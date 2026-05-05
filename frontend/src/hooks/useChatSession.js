import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext.jsx";

export function useChatSession(userId) {
  const { socket, connected, connectionError } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket || !userId) return;

    const onUserList = ({ users }) => setOnlineUsers(Array.isArray(users) ? users : []);
    const onReceive = (msg) => {
      setMessages((prev) => {
        if (msg?._id && prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("user_list", onUserList);
    socket.on("receive_message", onReceive);

    return () => {
      socket.off("user_list", onUserList);
      socket.off("receive_message", onReceive);
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!socket || !connected) return;
    socket.emit("join");
  }, [socket, connected]);

  const sendMessage = useCallback(
    (receiverId, content) => {
      if (!socket || !receiverId) return;
      socket.emit("send_message", { receiverId, content });
    },
    [socket]
  );

  return { onlineUsers, messages, sendMessage, connected, connectionError };
}
