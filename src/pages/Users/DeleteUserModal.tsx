import { useState } from "react";
import { User } from "../../services/user.service";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
// import Button from "../../components/ui/button/Button";

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteUserModal({ isOpen, user, onClose, onConfirm }: DeleteUserModalProps) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="absolute top-4 right-4">
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Delete User
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{user.name}"</span>? 
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}