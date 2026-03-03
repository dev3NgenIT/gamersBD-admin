// services/user.service.ts
// const API_URL = "https://gamersbd-server.onrender.com/api";
const API_URL = "https://gamersbd-server.onrender.com/api";

export interface Address {
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  taxId?: string;
}

export interface Social {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string | null;
  address?: Address;
  social?: Social;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: "admin" | "user";
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatar?: string | null;
  address?: Address;
  social?: Social;
}

export const userService = {
  // Get all users (admin only)
  async getAllUsers(token: string): Promise<User[]> {
    try {
      if (!token) {
        throw new Error("No authentication token provided");
      }

      console.log("Fetching users with token:", token.substring(0, 20) + "...");
      
      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("API Response:", { status: response.status, data });

      if (!response.ok) {
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            throw new Error("Unauthorized: Please login again");
          case 403:
            throw new Error("Forbidden: You don't have permission to view users");
          case 404:
            throw new Error("API endpoint not found");
          default:
            throw new Error(data.message || `Failed to fetch users (Status: ${response.status})`);
        }
      }

      // Check if data has the expected structure
      if (!data || !data.data) {
        console.warn("Unexpected API response structure:", data);
        return [];
      }

      return data.data;
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      throw error;
    }
  },

  // Get single user by ID
  async getUserById(token: string, id: string): Promise<User> {
    try {
      if (!token) throw new Error("No authentication token provided");
      if (!id) throw new Error("User ID is required");

      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user");
      }

      return data.data;
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw error;
    }
  },

  // Create new user (admin only)
  async createUser(token: string, userData: CreateUserDto): Promise<User> {
    try {
      if (!token) throw new Error("No authentication token provided");

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      return data.data;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  },

  // Update user (admin only) - Try with multiple methods
  async updateUser(
    token: string,
    id: string,
    userData: UpdateUserDto,
  ): Promise<User> {
    try {
      if (!token) throw new Error("No authentication token provided");
      if (!id) throw new Error("User ID is required");

      console.log(`Attempting to update user ${id} with data:`, userData);

      // First try with PUT method
      try {
        const putResponse = await fetch(`${API_URL}/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });

        const putData = await putResponse.json();
        
        if (putResponse.ok) {
          console.log("PUT request successful:", putData);
          return putData.data;
        }

        console.log("PUT request failed with status:", putResponse.status);
        
        // If PUT fails with 404, try PATCH
        if (putResponse.status === 404) {
          console.log("PUT method not supported, trying PATCH...");
          
          const patchResponse = await fetch(`${API_URL}/users/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          });

          const patchData = await patchResponse.json();
          
          if (patchResponse.ok) {
            console.log("PATCH request successful:", patchData);
            return patchData.data;
          }
          
          // If PATCH also fails with 404, try alternative routes
          if (patchResponse.status === 404) {
            console.log("PATCH method not supported, trying alternative routes...");
            
            // Try with different route patterns
            const alternativeRoutes = [
              `${API_URL}/user/${id}`,           // Singular
              `${API_URL}/admin/users/${id}`,     // Admin prefix
              `${API_URL}/api/users/${id}`,       // Double api prefix
              `${API_URL}/v1/users/${id}`,        // Versioned
            ];

            for (const route of alternativeRoutes) {
              console.log(`Trying alternative route: ${route}`);
              
              const altResponse = await fetch(route, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
              });

              if (altResponse.ok) {
                const altData = await altResponse.json();
                console.log("Alternative route successful:", route);
                return altData.data;
              }
            }
          }
          
          throw new Error(patchData.message || "Failed to update user with PATCH");
        }
        
        throw new Error(putData.message || `Failed to update user (Status: ${putResponse.status})`);
        
      } catch (error) {
        console.error("All update attempts failed:", error);
        throw error;
      }

    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  },

  // Delete user (admin only)
  async deleteUser(token: string, id: string): Promise<void> {
    try {
      if (!token) throw new Error("No authentication token provided");
      if (!id) throw new Error("User ID is required");

      console.log(`Attempting to delete user ${id}`);

      // Try DELETE with standard route
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return;
      }

      // If DELETE fails, try with different methods
      if (response.status === 404) {
        console.log("DELETE method not supported, trying alternative routes...");
        
        const alternativeRoutes = [
          `${API_URL}/user/${id}`,
          `${API_URL}/admin/users/${id}`,
          `${API_URL}/api/users/${id}`,
        ];

        for (const route of alternativeRoutes) {
          console.log(`Trying alternative route: ${route}`);
          
          const altResponse = await fetch(route, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (altResponse.ok) {
            console.log("Alternative route successful:", route);
            return;
          }
        }
      }

      const data = await response.json();
      throw new Error(data.message || "Failed to delete user");
      
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw error;
    }
  },
};