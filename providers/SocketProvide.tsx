"use client";

import React from "react";
import { SocketContextProvider } from "../context/SocketContext";

const SocketProvide = ({ children }: { children: React.ReactNode }) => {
  return <SocketContextProvider>{children}</SocketContextProvider>;
};

export default SocketProvide;
