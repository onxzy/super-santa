import { UserSelf } from "./user";

// SRP Authentication interfaces
interface SrpChallenge {
  salt: string;
  server_pub_key: string;
}

interface SrpAuth {
  client_pub_key: string;
  client_auth: string;
}

// Group challenge
export interface GetGroupChallengeResponse {
  session_id: string;
  group_challenge: SrpChallenge;
}

// Group login
export interface GroupLoginRequest {
  session_id: string;
  group_auth: SrpAuth;
}

export interface GroupLoginResponse {
  token: string;
  server_auth: string;
}

// User login challenge
export interface GetLoginChallengeRequest {
  group_token: string;
  email: string;
}

export interface GetLoginChallengeResponse {
  session_id: string;
  user_challenge: SrpChallenge;
}

// User login
export interface LoginRequest {
  session_id: string;
  user_auth: SrpAuth;
}

export interface LoginResponse {
  server_auth: string;
  token: string;
}

// Authentication responses
export interface AuthResponse {
  claims: {
    [key: string]: any;
  };
}

export interface GroupAuthRequest {
  group_token: string;
}

export interface GroupAuthResponse {
  group_id: string;
}
