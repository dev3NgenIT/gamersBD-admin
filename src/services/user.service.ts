const API_URL = 'https://gamersbd-server.onrender.com/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string | null;
  address?: {
    country?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    taxId?: string;
  };
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string | null;
  address?: {
    country?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    taxId?: string;
  };
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export const userService = {
  // Get all users (admin only)
  async getAllUsers(token: string): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }
    
    return data.data;
  },

  // Get single user by ID
  async getUserById(token: string, id: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }
    
    return data.data;
  },

  // Create new user (admin only)
  async createUser(token: string, userData: CreateUserDto): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create user');
    }
    
    return data.data;
  },

  // Update user (admin only)
  async updateUser(token: string, id: string, userData: UpdateUserDto): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }
    
    return data.data;
  },

  // Delete user (admin only)
  async deleteUser(token: string, id: string): Promise<void> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }
  },
};