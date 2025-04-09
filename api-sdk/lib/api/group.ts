import { AuthAPIError, AuthAPIErrorCode } from "./auth";
import { ApiClient, ApiError } from "./client";
import {
  CreateGroupRequest,
  FinishDrawRequest,
  GroupAPIStatusCode,
  GroupInfo,
  GroupModel,
  InitDrawResponse,
  JoinGroupRequest,
} from "./dto/group";
import { UpdateWishesRequest, UpdateWishesResponse } from "./dto/user";

export enum GroupAPIErrorCode {
  GROUP_AUTH_ERROR = "GROUP_AUTH_ERROR",

  NOT_ENOUGH_USERS = "NOT_ENOUGH_USERS",
  DRAW_NOT_INITIED = "DRAW_NOT_INITIED",
  DRAW_DONE = "DRAW_DONE",

  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class GroupAPIError extends Error {
  constructor(
    public code: GroupAPIErrorCode,
    error: unknown = null,
    message: string = "Unknown error"
  ) {
    super(
      error instanceof Error
        ? `${message} : [${error.name}] ${error.message}`
        : message
    );
    this.name = "GroupAPIError";
  }
}

export class GroupAPI {
  private static basePath = "/group";
  private authContext;

  constructor(private client: ApiClient) {
    this.authContext = client.getAuthContext();
  }

  async createGroup(
    name: string,
    admin: { username: string; email: string },
    encodedKeys: {
      secretVerifier: string;
      passwordVerifier: string;
      privateKeyEncrypted: string;
      publicKeySecret: string;
    }
  ): Promise<GroupModel> {
    const group = await this.client.post<CreateGroupRequest, GroupModel>(
      `${GroupAPI.basePath}`,
      {
        name,
        secret_verifier: encodedKeys.secretVerifier,
        admin: {
          email: admin.email,
          username: admin.username,
          password_verifier: encodedKeys.passwordVerifier,
          public_key_secret: encodedKeys.publicKeySecret,
          private_key_encrypted: encodedKeys.privateKeyEncrypted,
        },
      }
    );

    return group;
  }

  async joinGroup(
    user: { username: string; email: string },
    encodedKeys: {
      passwordVerifier: string;
      privateKeyEncrypted: string;
      publicKeySecret: string;
    }
  ): Promise<GroupModel> {
    const groupToken = this.authContext.getGroupToken();
    if (!groupToken) {
      throw new GroupAPIError(
        GroupAPIErrorCode.GROUP_AUTH_ERROR,
        null,
        "Group token is not set. Please login to group first."
      );
    }

    const group = await this.client.post<JoinGroupRequest, GroupModel>(
      `${GroupAPI.basePath}/join`,
      {
        group_token: groupToken,
        user: {
          username: user.username,
          email: user.email,
          password_verifier: encodedKeys.passwordVerifier,
          public_key_secret: encodedKeys.publicKeySecret,
          private_key_encrypted: encodedKeys.privateKeyEncrypted,
        },
      }
    );

    return group;
  }

  async getGroupInfo(groupID: string): Promise<GroupInfo | null> {
    try {
      return await this.client.get<GroupInfo>(
        `${GroupAPI.basePath}/${groupID}/info`
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) return null; // Group not found
      }
      throw new GroupAPIError(
        GroupAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to get group info"
      );
    }
  }

  async getGroup(): Promise<GroupModel> {
    try {
      return await this.client.get<GroupModel>(`${GroupAPI.basePath}`);
    } catch (error) {
      if (error instanceof ApiError) {
        // 400 should not occur
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.AUTH_ERROR, error);
      }
      throw new GroupAPIError(
        GroupAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to get group"
      );
    }
  }

  async updateWishes(wishes: string): Promise<string> {
    try {
      const { wishes: newWishes } = await this.client.put<
        UpdateWishesRequest,
        UpdateWishesResponse
      >(`${GroupAPI.basePath}/wishes`, { wishes });
      return newWishes;
    } catch (error) {
      if (error instanceof ApiError) {
        // 400 and 404 should not occur
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.AUTH_ERROR, error);
      }
      throw new GroupAPIError(
        GroupAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to update wishes"
      );
    }
  }

  /**
   *
   * @throws {GroupAPIError} NOT_ENOUGH_USERS, DRAW_NOT_INITIED
   */
  async initDraw(): Promise<string[]> {
    try {
      const { public_keys_secret } = await this.client.get<InitDrawResponse>(
        `${GroupAPI.basePath}/draw`
      );
      return public_keys_secret;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === GroupAPIStatusCode.NOT_ENOUGH_USERS)
          throw new GroupAPIError(
            GroupAPIErrorCode.NOT_ENOUGH_USERS,
            error,
            "Failed to init draw"
          );
        if (error.status === 409)
          throw new GroupAPIError(
            GroupAPIErrorCode.DRAW_DONE,
            error,
            "Draw already done"
          );
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.AUTH_ERROR, error);
        if (error.status === 403)
          throw new AuthAPIError(AuthAPIErrorCode.FORBIDDEN, error);
      }
      throw new GroupAPIError(
        GroupAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to init draw"
      );
    }
  }

  /**
   *
   * @throws {GroupAPIError} DRAW_NOT_INITIED, DRAW_DONE
   */
  async finishDraw(publicKeys: JsonWebKey[]): Promise<void> {
    try {
      await this.client.post<FinishDrawRequest, null>(
        `${GroupAPI.basePath}/draw`,
        {
          public_keys: publicKeys.map((key) => JSON.stringify(key)),
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === GroupAPIStatusCode.DRAW_SESSION_NOT_FOUND)
          throw new GroupAPIError(
            GroupAPIErrorCode.DRAW_NOT_INITIED,
            error,
            "Draw not initied or too old. init draw again"
          );
        if (error.status === 409)
          throw new GroupAPIError(
            GroupAPIErrorCode.DRAW_DONE,
            error,
            "Draw already done"
          );
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.AUTH_ERROR, error);
        if (error.status === 403)
          throw new AuthAPIError(AuthAPIErrorCode.FORBIDDEN, error);
      }
      throw new GroupAPIError(
        GroupAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to finish draw"
      );
    }
  }

  /**
   *
   * @throws {AuthAPIError} AUTH_ERROR, FORBIDDEN
   * @throws {GroupAPIError} DRAW_DONE
   */
  async deleteUser(userID: string): Promise<void> {
    try {
      await this.client.delete(`${GroupAPI.basePath}/user/${userID}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.AUTH_ERROR, error);
        if (error.status === 403)
          throw new AuthAPIError(AuthAPIErrorCode.FORBIDDEN, error);
        if (error.status === 409)
          throw new GroupAPIError(
            GroupAPIErrorCode.DRAW_DONE,
            error,
            "Draw already done"
          );
      }
      throw new GroupAPIError(
        GroupAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to delete user"
      );
    }
  }

  /**
   *
   * @throws {AuthAPIError} AUTH_ERROR, FORBIDDEN
   * @throws {GroupAPIError} DRAW_DONE
   * */
  async leaveGroup(): Promise<void> {
    try {
      await this.client.delete(`${GroupAPI.basePath}/user`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401)
          throw new AuthAPIError(AuthAPIErrorCode.AUTH_ERROR, error);
        if (error.status === 403)
          throw new AuthAPIError(AuthAPIErrorCode.FORBIDDEN, error);
        if (error.status === 409)
          throw new GroupAPIError(
            GroupAPIErrorCode.DRAW_DONE,
            error,
            "Draw already done"
          );
      }
      throw new GroupAPIError(
        GroupAPIErrorCode.UNKNOWN_ERROR,
        error,
        "Failed to leave group"
      );
    }
  }
}
