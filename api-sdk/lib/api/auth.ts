import { SRP } from "../crypto/srp";
import {
  GetGroupChallengeResponse,
  GetLoginChallengeRequest,
  GetLoginChallengeResponse,
  GroupAuthRequest,
  GroupAuthResponse,
  GroupLoginRequest,
  GroupLoginResponse,
  LoginRequest,
  LoginResponse,
} from "./dto/auth";
import { ApiClient, ApiError } from "./client";
import { UserSelf } from "./dto/user";

export enum AuthAPIErrorCode {
  BAD_GROUP_ID = "BAD_GROUP_ID",
  BAD_SECRET = "BAD_SECRET",
  GROUP_AUTH_ERROR = "GROUP_AUTH_ERROR",

  BAD_EMAIL = "BAD_EMAIL",
  BAD_PASSWORD = "BAD_PASSWORD",
  AUTH_ERROR = "AUTH_ERROR",

  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class AuthAPIError extends Error {
  constructor(
    public code: AuthAPIErrorCode,
    error: unknown = null,
    message: string = "Unknown error"
  ) {
    super(
      error instanceof Error ? `[${error.name}] ${error.message}` : message
    );
    this.name = "AuthAPIError";
  }
}

export class AuthAPI {
  private static basePath = "/auth";
  private authContext;

  constructor(private client: ApiClient, private srp: SRP) {
    this.authContext = client.getAuthContext();
  }

  /**
   * Get token for group.
   * This function will first get a login challenge from the server, then solve the challenge using SRP, and finally get a group token.
   * The group token will be stored in the auth context.
   * @throws {AuthAPIError} BAD_GROUP_ID, BAD_SECRET, UNKNOWN_ERROR
   */
  async getGroupToken(
    id: string,
    secret: string
  ): Promise<{ secretKey: CryptoKey }> {
    this.authContext.clear();

    let challenge: GetGroupChallengeResponse;
    try {
      challenge = await this.client.get<GetGroupChallengeResponse>(
        `${AuthAPI.basePath}/group/${id}/challenge`
      );
    } catch (error) {
      if (error instanceof ApiError) {
        // 400 should not occur
        if (error.status === 404)
          throw new AuthAPIError(AuthAPIErrorCode.BAD_GROUP_ID, error);
      }
      throw new AuthAPIError(
        AuthAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to get group challenge"
      );
    }

    const solve = await this.srp.solveChallenge(
      challenge.group_challenge.server_pub_key,
      id,
      secret,
      challenge.group_challenge.salt
    );

    try {
      const { token } = await this.client.post<
        GroupLoginRequest,
        GroupLoginResponse
      >(`${AuthAPI.basePath}/group`, {
        session_id: challenge.session_id,
        group_auth: {
          client_pub_key: solve.clientPublicEphemeral,
          client_auth: solve.clientSession.proof,
        },
      });
      this.authContext.setGroupToken(token);
    } catch (error) {
      if (error instanceof ApiError) {
        // 400 and 401 should not occur
        if (error.status === 403)
          throw new AuthAPIError(AuthAPIErrorCode.BAD_SECRET, error);
      }
      throw new AuthAPIError(
        AuthAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to get group token"
      );
    }

    return { secretKey: solve.privateKey };
  }

  /**
   * Get auth token for user.
   * This function will first get a login challenge from the server, then solve the challenge using SRP, and finally get an auth token.
   * The auth token will be stored in the auth context.
   * @throws {AuthAPIError} GROUP_AUTH_ERROR, BAD_EMAIL, BAD_PASSWORD, UNKNOWN_ERROR
   */
  async getAuthToken(
    email: string,
    password: string
  ): Promise<{ passwordKey: CryptoKey }> {
    const groupToken = this.authContext.getGroupToken();
    if (!groupToken) {
      throw new AuthAPIError(
        AuthAPIErrorCode.GROUP_AUTH_ERROR,
        null,
        "Group token is not set. Please call getGroupToken first."
      );
    }

    let challenge: GetLoginChallengeResponse;
    try {
      challenge = await this.client.post<
        GetLoginChallengeRequest,
        GetLoginChallengeResponse
      >(`${AuthAPI.basePath}/login/challenge`, {
        group_token: groupToken,
        email: email,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.GROUP_AUTH_ERROR, error);
        if (error.status === 404)
          throw new AuthAPIError(AuthAPIErrorCode.BAD_EMAIL, error);
      }
      throw new AuthAPIError(
        AuthAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to get login challenge"
      );
    }

    const solve = await this.srp.solveChallenge(
      challenge.user_challenge.server_pub_key,
      email,
      password,
      challenge.user_challenge.salt
    );

    try {
      const { token } = await this.client.post<LoginRequest, LoginResponse>(
        `${AuthAPI.basePath}/login`,
        {
          session_id: challenge.session_id,
          user_auth: {
            client_pub_key: solve.clientPublicEphemeral,
            client_auth: solve.clientSession.proof,
          },
        }
      );
      this.authContext.setAuthToken(token);
      this.authContext.save();
    } catch (error) {
      if (error instanceof ApiError) {
        // 400 and 401 should not occur
        if (error.status === 403)
          throw new AuthAPIError(AuthAPIErrorCode.BAD_PASSWORD, error);
      }
      throw new AuthAPIError(
        AuthAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to get auth token"
      );
    }

    return { passwordKey: solve.privateKey };
  }

  /**
   * Check if the auth token is valid.
   */
  async checkAuthToken() {
    try {
      await this.getUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user info.
   * @throws {AuthAPIError} AUTH_ERROR, UNKNOWN_ERROR
   */
  async getUser(): Promise<UserSelf> {
    try {
      return await this.client.get<UserSelf>(`${AuthAPI.basePath}/login`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.AUTH_ERROR, error);
      }
      throw new AuthAPIError(
        AuthAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to get user"
      );
    }
  }

  /**
   * Check if the group token is valid.
   */
  async checkGroupToken() {
    try {
      await this.getGroupId();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get group ID.
   * @throws {AuthAPIError} GROUP_AUTH_ERROR, UNKNOWN_ERROR
   */
  async getGroupId(): Promise<string> {
    const groupToken = this.authContext.getGroupToken();
    if (!groupToken) {
      throw new AuthAPIError(
        AuthAPIErrorCode.GROUP_AUTH_ERROR,
        null,
        "Group token is not set. Please call getGroupToken first."
      );
    }

    try {
      const { group_id } = await this.client.post<
        GroupAuthRequest,
        GroupAuthResponse
      >(`${AuthAPI.basePath}/group`, {
        group_token: groupToken,
      });
      return group_id;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.GROUP_AUTH_ERROR, error);
      }
      throw new AuthAPIError(
        AuthAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to check group token"
      );
    }
  }

  logout() {
    this.authContext.clear();
    return null;
  }

  /**
   * Load the auth context from local storage and check if the auth token is still valid.
   *
   * **On failure the auth context will be cleared.**
   */
  async auth() {
    if (!this.authContext.load()) return null;

    try {
      return await this.getUser();
    } catch (error) {
      if (error instanceof AuthAPIError) {
        if (error.code === AuthAPIErrorCode.AUTH_ERROR) {
          this.authContext.clear();
          return null;
        }
      }
      throw error;
    }
  }
}
