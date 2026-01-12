"use client";
import { Phone, PhoneOff } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import Avatar from "./Avatar";
const CallNotification = () => {
  const { ongoingCall, handleJoinCall, handleHangup } = useSocket();
  console.log("ongoingCall", ongoingCall);

  if (!ongoingCall?.isRinging) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-md p-4 sm:p-6 animate-in fade-in zoom-in">
        <div className="flex items-center justify-center mb-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
            <Avatar
              src={ongoingCall?.participants?.caller?.profile?.imageUrl || ""}
            />
          </div>
        </div>

        <h2 className="text-center text-lg font-semibold">Incoming Call</h2>
        <p className="text-center text-sm text-muted-foreground mt-1">
          {ongoingCall?.participants?.caller?.profile?.firstName?.split(" ")[0]}{" "}
          is calling you...
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
            onClick={() => handleHangup?.()}
          >
            <PhoneOff size={20} />
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
            onClick={() => handleJoinCall?.(ongoingCall)}
          >
            <Phone size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
