import { CreateUserRequest, User } from "./user";

export enum GroupAPIStatusCode {
  NOT_ENOUGH_USERS = 460,
  DRAW_SESSION_NOT_FOUND = 461,
}

export interface CreateGroupRequest {
  name: string;
  secret_verifier: string;
  admin: CreateUserRequest;
}

export interface JoinGroupRequest {
  group_token: string;
  user: CreateUserRequest;
}

export interface InitDrawResponse {
  public_keys_secret: string[];
}

export interface FinishDrawRequest {
  public_keys: string[];
}

export interface GroupModel {
  id: string;
  name: string;
  results?: string[];
  users: User[];
  created_at: Date;
  updated_at: Date;
}

export interface GroupInfo {
  id: string;
  name: string;
}
