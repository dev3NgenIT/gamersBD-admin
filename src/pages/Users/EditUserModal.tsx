import { useState, useEffect } from "react";
import { User } from "../../services/user.service";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
}

export default function EditUserModal({ isOpen, user, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit User
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label>Bio</Label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter bio"
                  />
                </div>

                <div>
                  <Label>Role</Label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "user" })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}