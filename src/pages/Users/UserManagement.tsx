// pages/UserManagement/UserManagement.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { userService, User, CreateUserDto, UpdateUserDto } from "../../services/user.service";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import { useNavigate } from "react-router";

export default function UserManagement() {
  const { token: contextToken } = useAuth();
  const navigate = useNavigate();
  
  // Use token from context or fallback to sessionStorage
  const [token, setToken] = useState<string | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Initialize token from context or sessionStorage
  useEffect(() => {
    const storedToken = contextToken || sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    
    console.log("Token initialization:", {
      contextToken: contextToken ? "present" : "null",
      storedToken: storedToken ? "present" : "null",
      storedUser: storedUser ? "present" : "null"
    });

    if (storedToken) {
      setToken(storedToken);
    } else {
      // No token found, redirect to login
      setError("No authentication token found. Please login again.");
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [contextToken, navigate]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Fetch users
  const fetchUsers = async () => {
    if (!token) {
      console.log("No token available for fetching users");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching users with token...");
      const data = await userService.getAllUsers(token);
      console.log("Users fetched successfully:", data);
      
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load users";
      console.error("Error fetching users:", err);
      
      setError(errorMessage);
      showToast(errorMessage, "error");
      
      // If unauthorized, redirect to login
      if (errorMessage.includes("Unauthorized") || errorMessage.includes("login")) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchTerm) ||
      (user.email?.toLowerCase() || '').includes(searchTerm) ||
      (user.firstName?.toLowerCase() || '').includes(searchTerm) ||
      (user.lastName?.toLowerCase() || '').includes(searchTerm) ||
      (user.phone?.toLowerCase() || '').includes(searchTerm);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handle user actions
  const handleAddUser = async (userData: CreateUserDto) => {
  if (!token) {
    showToast("Authentication token not found", "error");
    return;
  }

  try {
    console.log("Creating user with data:", userData); // Debug log
    const newUser = await userService.createUser(token, userData);
    console.log("User created successfully:", newUser); // Debug log
    
    setUsers([newUser, ...users]);
    showToast("User created successfully!", "success");
    setAddModalOpen(false);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to create user";
    console.error("Error in handleAddUser:", err); // Debug log
    showToast(errorMessage, "error");
    throw err; // Re-throw to let modal handle loading state
  }
};

  const handleEditUser = async (userData: UpdateUserDto) => {
    if (!token) {
      showToast("Authentication token not found", "error");
      return;
    }
    
    if (!selectedUser) {
      showToast("No user selected for editing", "error");
      return;
    }

    try {
      const updatedUser = await userService.updateUser(
        token,
        selectedUser._id,
        userData,
      );
      
      setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
      showToast("User updated successfully!", "success");
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      showToast(errorMessage, "error");
      throw err;
    }
  };

  const handleDeleteUser = async () => {
    if (!token) {
      showToast("Authentication token not found", "error");
      return;
    }
    
    if (!selectedUser) {
      showToast("No user selected for deletion", "error");
      return;
    }

    try {
      await userService.deleteUser(token, selectedUser._id);
      setUsers(users.filter((u) => u._id !== selectedUser._id));
      showToast("User deleted successfully!", "success");
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
      showToast(errorMessage, "error");
      throw err;
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    
    return user.email.substring(0, 2).toUpperCase();
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <>
        <PageMeta
          title="User Management | GamersBD Admin"
          description="Manage system users"
        />
        <PageBreadcrumb pageTitle="User Management" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <>
        <PageMeta
          title="User Management | GamersBD Admin"
          description="Manage system users"
        />
        <PageBreadcrumb pageTitle="User Management" />
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Error Loading Users</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="User Management | GamersBD Admin"
        description="Manage system users"
      />
      <PageBreadcrumb pageTitle="User Management" />

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-[100] p-4 rounded-lg shadow-lg transition-all transform animate-slide-in ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
          }`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Regular Users
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {users.filter((u) => u.role === "user").length}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as typeof roleFilter)
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>

              {/* Add User Button */}
              <Button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add User</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.parentElement!.innerHTML = getUserInitials(user);
                                }}
                              />
                            ) : (
                              getUserInitials(user)
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || `${user.firstName} ${user.lastName}`.trim()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 rounded-full transition"
                            title="Edit user"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 rounded-full transition"
                            title="Delete user"
                          >
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {search || roleFilter !== "all"
                            ? "No users found matching your criteria"
                            : "No users yet"}
                        </p>
                        {(search || roleFilter !== "all") && (
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                            Try adjusting your search or filter
                          </p>
                        )}
                        {!search && roleFilter === "all" && users.length === 0 && (
                          <Button
                            onClick={() => setAddModalOpen(true)}
                            className="mt-4 flex items-center gap-2"
                          >
                            <PlusIcon className="w-4 h-4" />
                            <span>Add Your First User</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddUser}
      />

      <EditUserModal
        isOpen={editModalOpen}
        user={selectedUser}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditUser}
      />

      <DeleteUserModal
        isOpen={deleteModalOpen}
        user={selectedUser}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
      />
    </>
  );
}