import * as SecureStore from 'expo-secure-store';
import Config from '../constants/Config';

const JWT_TOKEN_KEY = 'auth_jwt_token';

export const authService = {
  async register(name: string, email: string, password: string) {
    try {
      const response = await fetch(`${Config.BACKEND_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          email: email,
          password: password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store the secure JWT token
      if (data.token) {
        await SecureStore.setItemAsync(JWT_TOKEN_KEY, data.token);
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await fetch(`${Config.BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      if (data.token) {
        await SecureStore.setItemAsync(JWT_TOKEN_KEY, data.token);
      }
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await SecureStore.deleteItemAsync(JWT_TOKEN_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const token = await SecureStore.getItemAsync(JWT_TOKEN_KEY);
      if (!token) return null;

      // Notice how we NO LONGER send the email in the URL.
      // The backend figures out who we are securely from the Bearer token.
      const response = await fetch(`${Config.BACKEND_URL}/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        await SecureStore.deleteItemAsync(JWT_TOKEN_KEY);
        return null;
      }
      
      return {
        id: data._id,
        name: data.full_name,
        email: data.email,
        wallet_balance: data.wallet_balance || 0,
        vehicles: data.vehicles || []
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: any) {
    try {
      const token = await SecureStore.getItemAsync(JWT_TOKEN_KEY);
      if (!token) throw new Error("No active session");

      const response = await fetch(`${Config.BACKEND_URL}/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: updates.name,
          vehicles: updates.vehicles 
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};
