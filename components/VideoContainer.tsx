"use client";
import { useRef, useEffect } from "react";
import { cn } from "../lib/utils";
interface IVideoContainer {
  stream: MediaStream | null;
  isLocalStream: boolean;
  isOnCall: boolean;
}
const VideoContainer = ({
  stream,
  isLocalStream,
  isOnCall,
}: IVideoContainer) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      className={cn(
        "rounded border w-full max-w-[1200px] h-auto object-cover",
        isLocalStream &&
          isOnCall &&
          "w-36 sm:w-44 md:w-52 h-auto absolute bottom-4 right-4 border-purple-500 border-2 rounded-md"
      )}
      autoPlay
      playsInline
      muted={isLocalStream}
      ref={videoRef}
    />
  );
};
export default VideoContainer;
