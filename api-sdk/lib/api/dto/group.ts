import { CreateUserRequest, User } from "./user";

export interface CreateGroupRequest {
  name: string;
  secret_verifier: string;
  admin: CreateUserRequest;
}

export interface JoinGroupRequest {
  group_token: string;
  user: CreateUserRequest;
}

export interface GroupModel {
  id: string;
  name: string;
  results?: string;
  users: User[];
  created_at: Date;
  updated_at: Date;
}

export interface GroupInfo {
  id: string;
  name: string;
}
