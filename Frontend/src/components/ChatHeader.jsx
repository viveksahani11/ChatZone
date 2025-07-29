import { X, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, clearChat } = useChatStore();
  const { onlineUsers = [] } = useAuthStore();
  
  // ✅ NEW: State for options dropdown and confirmation modal
  const [showOptions, setShowOptions] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!selectedUser) return null;

  // ✅ NEW: Handle clear chat
  const handleClearChat = async () => {
    try {
      await clearChat(selectedUser._id);
      setShowClearConfirm(false);
      setShowOptions(false);
    } catch (error) {
      console.error("Clear chat error:", error);
    }
  };

  return (
    <>
      <div className="p-2.5 border-b border-base-300 bg-base-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Left: Avatar and Info */}
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium">{selectedUser.fullName}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          {/* Right: Options and Close Button */}
          <div className="flex items-center gap-2">
            {/* ✅ NEW: Options dropdown */}
            <div className="relative">
              <button 
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setShowOptions(!showOptions)}
              >
                <MoreVertical size={18} />
              </button>

              {/* Options Dropdown */}
              {showOptions && (
                <div className="absolute right-0 top-10 bg-base-100 border border-base-300 
                              rounded-lg shadow-lg z-50 min-w-[150px]">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-base-200 
                             flex items-center gap-2 text-sm text-red-500"
                    onClick={() => {
                      setShowClearConfirm(true);
                      setShowOptions(false);
                    }}
                  >
                    <Trash2 size={16} />
                    Clear Chat
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button 
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => setSelectedUser(null)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Clear Chat</h3>
            <p className="text-base-content/70 mb-4">
              Are you sure you want to clear this chat? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error btn-sm"
                onClick={handleClearChat}
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Click outside to close options */}
      {showOptions && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </>
  );
};

export default ChatHeader;