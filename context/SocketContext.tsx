"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";
import { SocketUser, OngoingCall, Participants, PeerData } from "../types";
import Peer, { SignalData } from "simple-peer";

interface iSocketContext {
  socket: Socket | null;
  isSocketConnected: boolean;
  onlineUsers: SocketUser[] | null;
  handleCall?: (user: SocketUser) => void;
  localStream?: MediaStream | null;
  peer?: PeerData | null;
  ongoingCall?: OngoingCall | null;
  handleJoinCall?: (ongoingCall: OngoingCall) => void;
  handleHangup?: () => void;
}

export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);
  const [ongoingCall, setOngoingCall] = useState<OngoingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<PeerData | null>(null);
  const SignalsRef = useRef<SignalData[]>([]);

  const currentSocketUser = onlineUsers.find(
    (onlineUser) => onlineUser.userId === user?.id
  );

  const getMediaStream = useCallback(
    async (faceMode?: string) => {
      if (localStream) {
        return localStream;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 360, ideal: 720, max: 1080 },
            frameRate: { min: 16, ideal: 30, max: 30 },
            facingMode: videoDevices.length > 0 ? faceMode : undefined,
          },
        });

        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.log("failed to load the stream", error);
        setLocalStream(null);
        return null;
      }
    },
    [localStream]
  );

  const removeStream = useCallback(() => {
    if (peer?.peerConnection) {
      peer.peerConnection.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setPeer(null);
    setLocalStream(null);
    setOngoingCall(null);
  }, [peer, localStream]);

  const handleHangup = useCallback(() => {
    if (socket) {
      socket.emit("hangup", { ongoingCall });
    }
    removeStream();
  }, [socket, ongoingCall, removeStream]);

  const createPeer = useCallback(
    (stream: MediaStream, initiator: boolean) => {
      const iceServers: RTCIceServer[] = [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ];

      const newPeer = new Peer({
        stream,
        initiator,
        trickle: true,
        config: {
          iceServers,
        },
      });

      newPeer.on("error", (err) => {
        console.error("peer error:", err);
        handleHangup();
      });

      newPeer.on("close", () => {
        console.log("Peer connection clos");
        removeStream();
      });

      const rtcPeerConnection: RTCPeerConnection = (newPeer as any)._pc;
      rtcPeerConnection.oniceconnectionstatechange = () => {
        console.log(
          "iceconnectionstate:",
          rtcPeerConnection.iceConnectionState
        );
        if (
          rtcPeerConnection.iceConnectionState === "disconnected" ||
          rtcPeerConnection.iceConnectionState === "failed"
        ) {
          handleHangup();
        }
      };

      return newPeer;
    },
    [handleHangup, removeStream]
  );

  const handleCall = useCallback(
    async (user: SocketUser) => {
      if (!currentSocketUser || !socket) return;

      const stream = await getMediaStream();
      if (!stream) {
        console.log("no stream in handleCall");
        return;
      }

      const participants = { caller: currentSocketUser, receiver: user };
      setOngoingCall({
        participants,
        isRinging: false,
      });

      const newPeer = createPeer(stream, true);

      setPeer({
        peerConnection: newPeer,
        participantUser: user,
        stream: undefined,
      });

      newPeer.on("stream", (remoteStream) => {
        console.log("caller received remote stream", remoteStream);
        setPeer((prev) => (prev ? { ...prev, stream: remoteStream } : prev));
      });

      newPeer.on("signal", (data: SignalData) => {
        console.log("caler sending signal", data.type);
        socket.emit("webrtcSignal", {
          sdp: data,
          ongoingCall: { participants, isRinging: false },
          isCaller: true,
        });
      });

      socket.emit("call", participants);
    },
    [socket, currentSocketUser, getMediaStream, createPeer]
  );

  const onIncomingCall = useCallback((participants: Participants) => {
    setOngoingCall({
      participants,
      isRinging: true,
    });
  }, []);

  const handleJoinCall = useCallback(
    async (ongoingCall: OngoingCall) => {
      setOngoingCall((prev) => {
        if (prev) {
          return {
            ...prev,
            isRinging: false,
          };
        }
        return prev;
      });

      const stream = await getMediaStream();
      if (!stream) {
        console.log("Could not get stream in handleJoinCall");
        return;
      }

      console.log("Create receiver peer");

      const newPeer = createPeer(stream, false);

      setPeer({
        peerConnection: newPeer,
        participantUser: ongoingCall.participants.caller,
        stream: undefined,
      });

      newPeer.on("stream", (remoteStream) => {
        console.log("receiver received remote stream", remoteStream);
        setPeer((prev) => (prev ? { ...prev, stream: remoteStream } : prev));
      });

      newPeer.on("signal", (data: SignalData) => {
        console.log("receiver sending signal", data.type);
        if (socket) {
          socket.emit("webrtcSignal", {
            sdp: data,
            ongoingCall,
            isCaller: false,
          });
        }
      });

      console.log("pocesing pending signals:", SignalsRef.current.length);
      SignalsRef.current.forEach((signal) => {
        console.log("processing signal", signal.type);
        newPeer.signal(signal);
      });
      SignalsRef.current = [];
    },
    [socket, getMediaStream, createPeer]
  );

  const completePeerConnection = useCallback(
    async (connectionData: {
      sdp: SignalData;
      ongoingCall: OngoingCall;
      isCaller: boolean;
    }) => {
      if (!peer?.peerConnection) {
        console.log("no peer connection availablel", connectionData.sdp.type);
        SignalsRef.current.push(connectionData.sdp);
        return;
      }

      try {
        console.log("signaling peer connectin", connectionData.sdp.type);
        peer.peerConnection.signal(connectionData.sdp);
      } catch (error) {
        console.error("error peer:", error);
      }
    },
    [peer]
  );

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket === null) return;

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsSocketConnected(true);
      console.log("Socket connected");
    }

    function onDisconnect() {
      setIsSocketConnected(false);
      console.log("Socket disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    socket.emit("addNewUser", user);

    const handleGetUsers = (res: SocketUser[]) => {
      setOnlineUsers(res);
    };

    socket.on("getUsers", handleGetUsers);
    socket.on("getOnlineUsers", handleGetUsers);

    return () => {
      socket.off("getUsers", handleGetUsers);
      socket.off("getOnlineUsers", handleGetUsers);
    };
  }, [socket, isSocketConnected, user]);

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    socket.on("incomingCall", onIncomingCall);
    socket.on("webrtcSignal", completePeerConnection);
    socket.on("hangup", removeStream);

    return () => {
      socket.off("incomingCall", onIncomingCall);
      socket.off("webrtcSignal", completePeerConnection);
      socket.off("hangup", removeStream);
    };
  }, [
    socket,
    isSocketConnected,
    onIncomingCall,
    completePeerConnection,
    removeStream,
  ]);

  useEffect(() => {
    return () => {
      removeStream();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isSocketConnected,
        onlineUsers,
        handleCall,
        ongoingCall,
        localStream,
        handleJoinCall,
        peer,
        handleHangup,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
};
