import { AuthAPI } from "./api/auth";
import { ApiClient } from "./api/client";
import { SRP } from "./crypto/srp";
import { AES } from "./crypto/aes";
import { RSA } from "./crypto/rsa";
import { GroupAPI } from "./api/group";
import { CryptoUtils } from "./crypto/utils";
import { User, UserSelf } from "./api/dto/user";
import {
  CryptoContext,
  CryptoContextError,
  CryptoContextErrorCode,
} from "./crypto_context";
import { AuthContext } from "./api/auth_context";
import { GroupModel } from "./api/dto/group";
import { CryptoError, CryptoErrorCode } from "./crypto/errors";

export enum SuperSantaAPIErrorCode {
  BAD_CRYPTO_CONTEXT = "BAD_CRYPTO_CONTEXT",
  BAD_DRAW = "BAD_DRAW",
  BAD_RESULT = "BAD_RESULT",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class SuperSantaAPIError extends Error {
  constructor(
    public code: SuperSantaAPIErrorCode,
    error: unknown = null,
    message: string = "Unknown error"
  ) {
    super(
      error instanceof Error
        ? `${message} : [${error.name}] ${error.message}`
        : message
    );
    this.name = "SuperSantaAPIError";
  }
}

export class SuperSantaAPI {
  static instance: SuperSantaAPI | null = null;
  static getInstance(config: { apiHost: string }) {
    if (!SuperSantaAPI.instance) {
      const cryptoUtils = new CryptoUtils();
      const aes = new AES(cryptoUtils);
      const srp = new SRP(aes);
      const rsa = new RSA();

      const authContext = new AuthContext();
      const apiClient = new ApiClient(`${config.apiHost}/api/v1`, authContext);

      const authAPI = new AuthAPI(apiClient, srp);
      const groupAPI = new GroupAPI(apiClient);
      SuperSantaAPI.instance = new SuperSantaAPI(
        authAPI,
        groupAPI,
        cryptoUtils,
        rsa,
        aes,
        srp
      );
    }
    return SuperSantaAPI.instance;
  }

  private cryptoContext: CryptoContext;

  constructor(
    private authAPI: AuthAPI,
    private groupAPI: GroupAPI,
    private cryptoUtils: CryptoUtils,
    rsa: RSA,
    aes: AES,
    srp: SRP
  ) {
    this.cryptoContext = new CryptoContext(this.cryptoUtils, rsa, aes, srp);
  }

  /**
   * Create a new group with the given name and secret.
   *
   * **This will login the user**
   *
   * @throws {SuperSantaAPIError} BAD_CRYPTO_CONTEXT
   */
  async createGroup(
    name: string,
    secret: string,
    admin: { username: string; email: string; password: string }
  ): Promise<{ group: GroupModel; user: UserSelf }> {
    if (
      this.cryptoContext.hasSecretKey() ||
      this.cryptoContext.hasPrivateKey()
    ) {
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.BAD_CRYPTO_CONTEXT,
        null,
        "Crypto context is already initialized, please logout first"
      );
    }

    const { secretVerifierEncoded } = await this.cryptoContext.createSecretKey(
      secret
    );

    const {
      passwordVerifierEncoded,
      publicKeySecretEncoded,
      privateKeyEncryptedEncoded,
    } = await this.cryptoContext.createUserKeys(admin.password);

    const group = await this.groupAPI.createGroup(name, admin, {
      secretVerifier: secretVerifierEncoded,
      passwordVerifier: passwordVerifierEncoded,
      privateKeyEncrypted: privateKeyEncryptedEncoded,
      publicKeySecret: publicKeySecretEncoded,
    });

    await this.loginGroup(group.id, secret);
    const user = await this.loginUser(admin.email, admin.password);
    if (!user)
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.UNKNOWN_ERROR,
        null,
        "Failed to login user after creating group"
      );

    return { group, user };
  }

  /**
   * Login to group using group ID and secret.
   *
   * **You must call this before loginUser and joinGroup.**
   * This can be used to check the group secret before prompting the user for their email and password or allowing them to join the group.
   *
   * @throws {AuthAPIError} BAD_GROUP_ID, BAD_SECRET, GROUP_AUTH_ERROR
   */
  async loginGroup(groupId: string, secret: string) {
    const { secretKey } = await this.authAPI.getGroupToken(groupId, secret);
    this.cryptoContext.setSecretKey(secretKey);
  }

  /**
   * Login to user using email and password. **You must call loginGroup first.**
   *
   * @throws {SuperSantaAPIError} BAD_CRYPTO_CONTEXT
   * @throws {AuthAPIError} BAD_EMAIL, BAD_PASSWORD, AUTH_ERROR
   */
  async loginUser(email: string, password: string): Promise<UserSelf | null> {
    if (!this.cryptoContext.hasSecretKey()) {
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.BAD_CRYPTO_CONTEXT,
        null,
        "Crypto context is not initialized, please call loginGroup first"
      );
    }

    const { passwordKey } = await this.authAPI.getAuthToken(email, password);

    const user = await this.authAPI.getUser();

    await this.cryptoContext.importPrivateKey(
      passwordKey,
      user.private_key_encrypted
    );

    await this.cryptoContext.saveToLocalStorage();

    return user;
  }

  /**
   * Load crypto and auth context from local storage and check if the auth token is still valid.
   * On failure the crypto context will be cleared and the user will be logged out.
   *
   * **Warning:** This should be called on app start to check if the user is still logged in.
   * Calling it multiple times may result in an unwanted context clear.
   *
   * **You should not call it during the login process !**
   *
   * @return User object if the auth token is valid, null otherwise.
   */
  async auth(): Promise<UserSelf | null> {
    try {
      await this.cryptoContext.loadFromLocalStorage();
    } catch (error) {
      this.logout();
      return null;
    }

    const user = await this.authAPI.auth();
    if (user) return user;

    this.logout();
    return null;
  }

  logout() {
    this.authAPI.logout();
    this.cryptoContext.clear();
  }

  /**
   * Get user
   *
   * @throws {AuthAPIError} AUTH_ERROR
   */
  getUser() {
    return this.authAPI.getUser();
  }

  /**
   * Get group
   *
   * @throws {AuthAPIError} AUTH_ERROR
   */
  getGroup() {
    return this.groupAPI.getGroup();
  }

  /**
   * Get group info, useful to display group name before login.
   *
   * @returns GroupInfo or null if group not found
   */
  getGroupInfo(id: string) {
    return this.groupAPI.getGroupInfo(id);
  }

  /**
   * Join the logged in group with the given username, email and password.
   *
   * **You must call loginGroup first.**
   *
   * @throws {SuperSantaAPIError} BAD_CRYPTO_CONTEXT
   */
  async joinGroup(
    username: string,
    email: string,
    password: string
  ): Promise<{ group: GroupModel; user: UserSelf }> {
    if (!this.cryptoContext.hasSecretKey()) {
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.BAD_CRYPTO_CONTEXT,
        null,
        "Crypto context is not initialized, please call loginGroup first"
      );
    }

    const {
      passwordVerifierEncoded,
      publicKeySecretEncoded,
      privateKeyEncryptedEncoded,
    } = await this.cryptoContext.createUserKeys(password);

    const group = await this.groupAPI.joinGroup(
      {
        email: email,
        username: username,
      },
      {
        passwordVerifier: passwordVerifierEncoded,
        publicKeySecret: publicKeySecretEncoded,
        privateKeyEncrypted: privateKeyEncryptedEncoded,
      }
    );

    const user = await this.loginUser(email, password);
    if (!user)
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.UNKNOWN_ERROR,
        null,
        "Failed to login user after joining group"
      );

    return { group, user };
  }

  /**
   * Update user wishes.
   *
   * @throws {AuthAPIError} AUTH_ERROR
   */
  async updateWishes(wishes: string) {
    return await this.groupAPI.updateWishes(wishes);
  }

  /**
   * Draw the secret santa.
   *
   * @throws {AuthAPIError} AUTH_ERROR, FORBIDDEN
   * @throws {GroupAPIError} NOT_ENOUGH_USERS, DRAW_ALREADY_DONE
   * @throws {SuperSantaAPIError} BAD_CRYPTO_CONTEXT, BAD_DRAW (One of the public keys was not valid)
   */
  async draw() {
    if (!this.cryptoContext.hasSecretKey()) {
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.BAD_CRYPTO_CONTEXT,
        null,
        "Secret key missing, are you logged in ?"
      );
    }

    const publicKeysSecret = await this.groupAPI.initDraw();

    let publicKeys;
    try {
      publicKeys = await Promise.all(
        publicKeysSecret.map((key) => this.cryptoContext.decryptPublicKey(key))
      );
    } catch (error) {
      if (
        error instanceof CryptoError &&
        error.code === CryptoErrorCode.UNWRAP_FAILED
      ) {
        throw new SuperSantaAPIError(
          SuperSantaAPIErrorCode.BAD_DRAW,
          error,
          "Failed to unwrap public keys"
        );
      }
      if (
        error instanceof CryptoContextError &&
        error.code === CryptoContextErrorCode.INVALID_PUBLIC_KEY
      ) {
        throw new SuperSantaAPIError(
          SuperSantaAPIErrorCode.BAD_DRAW,
          error,
          "Unwrapped public key was not valid"
        );
      }
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to decrypt public keys"
      );
    }

    // Generate a random shift amount (less than the array length)
    const shiftAmount =
      Math.floor(Math.random() * (publicKeysSecret.length - 1)) + 1;

    // Rotate the array by shiftAmount positions
    // This creates a mapping where each person gives a gift to someone else
    const shiftedPublicKeys = [
      ...publicKeys.slice(shiftAmount),
      ...publicKeys.slice(0, shiftAmount),
    ];

    await this.groupAPI.finishDraw(shiftedPublicKeys);

    const group = await this.groupAPI.getGroup();
    const user = await this.parseResult(group);

    console.log(user);
  }

  /**
   * Parse the result of the draw.
   *
   * @throws {SuperSantaAPIError} BAD_CRYPTO_CONTEXT, BAD_RESULT
   * @returns User or null if no result yet
   */
  async parseResult(group: GroupModel): Promise<User | null> {
    if (!this.cryptoContext.isComplete()) {
      throw new SuperSantaAPIError(
        SuperSantaAPIErrorCode.BAD_CRYPTO_CONTEXT,
        null,
        "Crypto context is not complete, are you logged in ?"
      );
    }

    if (!group.results || group.results.length === 0) {
      return null;
    }

    let userID = null;

    for (const result of group.results) {
      userID = await this.cryptoContext.decryptResult(result);
      if (userID) break;
    }

    if (userID) {
      const user = group.users.find((user) => user.id === userID);
      if (user) return user;
    }

    throw new SuperSantaAPIError(
      SuperSantaAPIErrorCode.BAD_RESULT,
      null,
      "Failed to parse result, you are alone !"
    );
  }

  /**
   * Delete a user from the group.
   *
   * **You must be an admin to do this and the draw should not have been done**
   *
   * @throws {AuthAPIError} AUTH_ERROR, FORBIDDEN
   * @throws {GroupAPIError} DRAW_DONE
   */
  async deleteUser(userID: string): Promise<void> {
    return await this.groupAPI.deleteUser(userID);
  }

  /**
   * Leave the group.
   *
   * **The draw should not have been done**
   *
   * @throws {AuthAPIError} AUTH_ERROR, FORBIDDEN
   * @throws {GroupAPIError} DRAW_DONE
   */
  async leaveGroup(): Promise<void> {
    return await this.groupAPI.leaveGroup();
  }
}
