export class AuthContext {
  private groupToken: string | null = null;
  private authToken: string | null = null;

  static LocalStorageKey = "auth_token";
  static AuthTokenValidationMargin = 300; // 5 minutes

  setGroupToken(token: string) {
    this.groupToken = token;
    this.authToken = null;
    return this;
  }
  setAuthToken(token: string) {
    this.groupToken = null;
    this.authToken = token;
    return this;
  }
  getGroupToken() {
    return this.groupToken;
  }
  getAuthHeader() {
    return this.authToken ? `Bearer ${this.authToken}` : "";
  }

  save() {
    if (!this.isAuthTokenValid()) {
      return false;
    }

    localStorage.setItem(AuthContext.LocalStorageKey, this.authToken!);
    return true;
  }
  /**
   * Load the auth token from local storage.
   * If the token is valid, it will be set as the current auth token.
   * @returns true if the token is valid, false otherwise.
   */
  load() {
    if (this.authToken) {
      if (this.isAuthTokenValid()) return true;
    }

    const authToken = localStorage.getItem(AuthContext.LocalStorageKey);
    if (authToken && this.isTokenValid(authToken)) {
      this.authToken = authToken;
      return true;
    }

    return false;
  }
  clear() {
    this.groupToken = null;
    this.authToken = null;
    localStorage.removeItem(AuthContext.LocalStorageKey);
  }

  isAuthTokenValid(): boolean {
    if (!this.authToken) {
      return false;
    }
    return this.isTokenValid(this.authToken);
  }

  isGroupTokenValid(): boolean {
    if (!this.groupToken) {
      return false;
    }
    return this.isTokenValid(this.groupToken);
  }

  private isTokenValid(token: string): boolean {
    try {
      // Split the token to get the payload
      const parts = token.split(".");
      if (parts.length !== 3) {
        return false;
      }

      // Decode the payload
      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired with 5 minutes safety margin
      const currentTime = Math.floor(Date.now() / 1000);
      if (
        payload.exp &&
        payload.exp + AuthContext.AuthTokenValidationMargin < currentTime
      ) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
