import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, currentUser } = useChatStore();
  const { onlineUsers, socket, authUser } = useAuthStore();
  
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // ✅ FIXED: Better socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      console.log("New message received in sidebar:", newMessage);
      // Refresh users list to get updated latest messages
      getUsers();
    };

    const handleMessageSent = (message) => {
      console.log("Message sent, updating sidebar:", message);
      // Refresh users list when we send a message too
      getUsers();
    };

    // Listen for both incoming and outgoing messages
    socket.on("newMessage", handleNewMessage);
    socket.on("message", handleNewMessage);
    socket.on("messageSent", handleMessageSent);
    
    // Also listen for any message events that might be emitted
    socket.on("new message", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("message", handleNewMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("new message", handleNewMessage);
    };
  }, [socket, getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => (onlineUsers || []).includes(user._id))
    : users;

  // ✅ FIXED: Better sorting with proper date handling
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // Get latest message timestamps
    const dateA = a.latestMessage?.createdAt 
      ? new Date(a.latestMessage.createdAt).getTime()
      : 0;
    const dateB = b.latestMessage?.createdAt 
      ? new Date(b.latestMessage.createdAt).getTime() 
      : 0;
    
    // Sort by latest message (most recent first)
    return dateB - dateA;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {sortedUsers.map((user) => {
          const isOnline = (onlineUsers || []).includes(user._id);
          const latest = user.latestMessage;
          // ✅ FIXED: Better current user detection
          const currentUserId = currentUser?._id || authUser?._id;
          const isSentByMe = latest?.sender?._id === currentUserId;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>

              {/* Info */}
              <div className="hidden lg:flex flex-col justify-between text-left min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{user.fullName}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {latest?.createdAt ? (
                      // ✅ FIXED: Better time formatting
                      new Date(latest.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    ) : ""}
                  </span>
                </div>
                <div className="text-sm text-zinc-400 truncate">
                  {latest?.text ? (
                    <>
                      <span className="font-medium mr-1 text-xs text-zinc-300">
                        {isSentByMe ? "You:" : `${latest?.sender?.username || user.fullName}:`}
                      </span>
                      <span>{latest.text}</span>
                    </>
                  ) : (
                    <span>No messages yet</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {sortedUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly ? "No online users" : "No users found"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;