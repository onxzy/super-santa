import { AES } from "../crypto/aes";
import { RSA } from "../crypto/rsa";
import { SRP } from "../crypto/srp";
import { CryptoUtils } from "../crypto/utils";
import { AuthAPIError, AuthAPIErrorCode } from "./auth";
import { ApiClient, ApiError } from "./client";
import {
  CreateGroupRequest,
  GroupInfo,
  GroupModel,
  JoinGroupRequest,
} from "./dto/group";

export enum GroupAPIErrorCode {
  GROUP_AUTH_ERROR = "GROUP_AUTH_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class GroupAPIError extends Error {
  constructor(
    public code: GroupAPIErrorCode,
    error: unknown = null,
    message: string = "Unknown error"
  ) {
    super(
      error instanceof Error ? `[${error.name}] ${error.message}` : message
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
}
