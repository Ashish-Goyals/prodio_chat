"use client";

import { useUser } from "@clerk/nextjs";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar";

function ListOnlineUsers() {
  const { onlineUsers, handleCall } = useSocket();
  const { user } = useUser();

  const filteredUsers = onlineUsers?.filter(
    (onlineUser) => onlineUser.userId !== user?.id
  );

  if (filteredUsers?.length === 0) {
    return (
      <div className="flex items-center gap-3 py-3">
        <Avatar src="" />
        <p className="text-sm">No users online</p>
      </div>
    );
  }

  return (
    <div>
      {filteredUsers?.map((onlineUser) => (
        <div
          key={onlineUser.userId}
          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-muted rounded-md px-1 sm:px-2"
          onClick={() => handleCall?.(onlineUser)}
        >
          <Avatar src={onlineUser.profile?.imageUrl || ""} />
          <p className="text-sm truncate max-w-[90px] sm:max-w-[150px] md:max-w-none">
            {onlineUser.profile?.firstName?.split(" ")[0]}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ListOnlineUsers;
