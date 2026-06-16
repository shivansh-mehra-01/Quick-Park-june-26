import * as SecureStore from 'expo-secure-store';
import Config from '../constants/Config';

const USER_EMAIL_KEY = 'user_email';

export const authService = {
  async register(name: string, email: string, password: string, vehiclePlate: string) {
    try {
      const response = await fetch(`${Config.BACKEND_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          email: email,
          password: password,
          vehicle_plate: vehiclePlate
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store the email to auto-login
      await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
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

      if (data.user && data.user.email) {
        await SecureStore.setItemAsync(USER_EMAIL_KEY, data.user.email);
      }
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
      if (!email) return null;

      const response = await fetch(`${Config.BACKEND_URL}/profile/${email}`);
      const data = await response.json();
      
      if (!response.ok) {
        await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
        return null;
      }
      
      return {
        id: data._id,
        name: data.full_name,
        email: data.email,
        vehicles: data.vehicles || [],
        favorites: data.favorites || []
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: any) {
    try {
      const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);
      if (!email) throw new Error("No active session");

      const response = await fetch(`${Config.BACKEND_URL}/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          full_name: updates.name,
          vehicles: updates.vehicles,
          favorites: updates.favorites,
          pushToken: updates.pushToken
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
