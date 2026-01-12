"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import VideoContainer from "./VideoContainer";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
const VideoCall = () => {
  const { localStream, peer, ongoingCall, handleHangup } = useSocket();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  console.log("peer>>>>>>>:-", peer?.stream);

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];

      setIsVideoOn(videoTrack.enabled);
      const audioTrack = localStream.getAudioTracks()[0];

      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const isOnCall = localStream && peer && ongoingCall ? true : false;

  if (!localStream) {
    return <div />;
  } else {
    return (
      <div>
        <div
          className="
    relative
    w-full
    h-[65vh] sm:h-[70vh] md:h-[75vh] lg:h-[80vh]
    bg-black
    rounded-xl
    overflow-hidden
    flex items-center justify-center
  "
        >
          {peer?.stream && (
            <VideoContainer
              stream={peer.stream}
              isLocalStream={false}
              isOnCall={isOnCall}
            />
          )}

          {localStream && (
            <VideoContainer
              stream={localStream}
              isLocalStream={true}
              isOnCall={isOnCall}
            />
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center justify-center sm:justify-start">
          <button onClick={toggleMic}>
            {isMicOn && <MdMic size={28} />}
            {!isMicOn && <MdMicOff size={28} />}
          </button>
          <button
            className="px-4 py-2 bg-rose-500 text-white rounded mx-4"
            onClick={handleHangup}
          >
            End Call
          </button>
          <button onClick={toggleCamera}>
            {isVideoOn && <MdVideocam size={28} />}
            {!isVideoOn && <MdVideocamOff size={28} />}
          </button>
        </div>
      </div>
    );
  }
};

export default VideoCall;
