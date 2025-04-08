export interface CreateUserRequest {
  username: string;
  email: string;
  password_verifier: string;
  public_key_secret: string;
  private_key_encrypted: string;
}

export interface UpdateWishesRequest {
  wishes: string;
}

export interface UpdateWishesResponse {
  wishes: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  wishes: string;
  created_at: Date;
}

export interface UserSelf {
  id: string;
  username: string;
  email: string;
  group_id: string;
  is_admin: boolean;
  public_key_secret: string;
  private_key_encrypted: string;
  wishes: string;
  created_at: Date;
  updated_at: Date;
}
