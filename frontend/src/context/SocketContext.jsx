import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function SocketProvider({ token, children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      setConnectionError(null);
      return;
    }

    const s = io(url, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(s);
    setConnectionError(null);
    if (s.connected) setConnected(true);

    const onConnect = () => {
      setConnected(true);
      setConnectionError(null);
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = (err) => {
      setConnected(false);
      setConnectionError(err?.message || "Could not connect to chat server");
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onConnectError);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onConnectError);
      s.removeAllListeners();
      s.close();
      setSocket(null);
      setConnected(false);
      setConnectionError(null);
    };
  }, [token]);

  const value = useMemo(
    () => ({ socket, connected, connectionError }),
    [socket, connected, connectionError]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
