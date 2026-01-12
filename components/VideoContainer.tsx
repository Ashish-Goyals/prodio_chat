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

  if (!isLocalStream) {
    return (
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="
            w-full h-full
            object-cover
          "
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        `
        absolute
        bottom-3 right-3
        sm:bottom-4 sm:right-4
        bg-black
        rounded-lg
        overflow-hidden
        shadow-xl
        border border-white/30
        transition-all duration-300
        `,
        isOnCall
          ? `
            w-24 h-36
            sm:w-28 sm:h-40
            md:w-32 md:h-44
            lg:w-36 lg:h-52
          `
          : `
            w-full max-w-[420px]
            mx-auto aspect-video
          `
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="
          w-full h-full
          object-cover
          scale-x-[-1]
        "
      />
    </div>
  );
};

export default VideoContainer;
