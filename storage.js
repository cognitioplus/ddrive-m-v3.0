const TOKEN_KEY = 'ddrive_auth_token';
const USER_KEY = 'ddrive_user_info';

export const AuthStorage = {
  // Save user + token securely (you can add encryption here)
  save(user) {
    const token = btoa(JSON.stringify({ email: user.email, ts: Date.now() }));
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Retrieve authenticated user if token is valid
  get() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userInfo = localStorage.getItem(USER_KEY);
      
      if (!token || !userInfo) return null;

      // Optional: validate token age (< 30 days)
      const payload = JSON.parse(atob(token));
      if (Date.now() - payload.ts > 30 * 24 * 60 * 60 * 1000) {
        this.clear();
        return null;
      }

      return JSON.parse(userInfo);
    } catch (e) {
      this.clear();
      return null;
    }
  },

  // Clear session
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
