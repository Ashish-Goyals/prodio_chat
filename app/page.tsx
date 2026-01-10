import Image from "next/image";
import ListOnlineUsers from "../components/ListOnlineUsers";
import CallNotification from "../components/CallNotification";
import VideoCall from "../components/VideoCall";

export default function Home() {
  return (
    <div>
      <ListOnlineUsers />
      <CallNotification />
      <VideoCall />
    </div>
  );
}
