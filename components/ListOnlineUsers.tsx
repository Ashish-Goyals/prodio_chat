"use client";

import { useUser } from "@clerk/nextjs";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar";

function ListOnlineUsers() {
  const { onlineUsers, handleCall } = useSocket();
  const { user } = useUser();

  const filteredUsers = onlineUsers.filter(
    (onlineUser) => onlineUser.userId !== user?.id
  );

  if (filteredUsers.length === 0) {
    return (
      <div className="flex flex-row gap-3 items-center py-3">
        <Avatar src="" />
        <p>No users online</p>
      </div>
    );
  }

  return (
    <div>
      {filteredUsers.map((onlineUser) => (
        <div
          key={onlineUser.userId}
          className="flex flex-row gap-3 items-center py-3 cursor-pointer hover:bg-muted"
          onClick={() => handleCall(onlineUser)}
        >
          <Avatar src={onlineUser.profile?.imageUrl || ""} />
          <p>{onlineUser.profile?.firstName?.split(" ")[0]}</p>
        </div>
      ))}
    </div>
  );
}

export default ListOnlineUsers;
