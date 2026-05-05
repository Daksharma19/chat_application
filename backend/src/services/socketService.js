import { verifyUserToken } from "../utils/jwt.js";
import {
  createMessage,
  findUndeliveredForUser,
  markDelivered,
} from "./messageService.js";
import { getUserSummariesByIds } from "./userService.js";

function serializeMessage(doc) {
  return {
    _id: String(doc._id),
    senderId: doc.senderId,
    receiverId: doc.receiverId,
    content: doc.content,
    timestamp: doc.timestamp instanceof Date ? doc.timestamp.toISOString() : doc.timestamp,
    delivered: doc.delivered,
  };
}

export function initSocket(io) {
  const onlineUsers = new Map();

  io.use((socket, next) => {
    try {
      const raw =
        socket.handshake.auth?.token ||
        (typeof socket.handshake.headers?.authorization === "string"
          ? socket.handshake.headers.authorization.replace(/^Bearer\s+/i, "")
          : null);
      if (!raw || typeof raw !== "string") {
        return next(new Error("Unauthorized"));
      }
      const payload = verifyUserToken(raw);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  async function broadcastUserList() {
    const ids = [...onlineUsers.keys()];
    const users = await getUserSummariesByIds(ids);
    io.emit("user_list", { users });
  }

  async function registerSocket(socket) {
    const userId = socket.data.userId;
    if (!userId) return;

    if (!socket.data._registerLock) {
      socket.data._registerLock = (async () => {
        try {
          const previousSocketId = onlineUsers.get(userId);
          if (previousSocketId && previousSocketId !== socket.id) {
            const oldSocket = io.sockets.sockets.get(previousSocketId);
            if (oldSocket) oldSocket.disconnect(true);
          }

          onlineUsers.set(userId, socket.id);
          await broadcastUserList();

          const pending = await findUndeliveredForUser(userId);
          for (const msg of pending) {
            socket.emit("receive_message", serializeMessage(msg));
            await markDelivered(msg._id);
          }
        } catch (err) {
          console.error(err);
        } finally {
          socket.data._registerLock = null;
        }
      })();
    }

    await socket.data._registerLock;
  }

  io.on("connection", (socket) => {
    socket.on("join", () => {
      void registerSocket(socket).catch((err) => console.error(err));
    });

    socket.on("send_message", async ({ receiverId, content }) => {
      const senderId = socket.data.userId;
      if (!senderId || !receiverId || typeof content !== "string") return;
      const text = content.trim();
      if (!text) return;

      const timestamp = new Date();
      const receiverSocketId = onlineUsers.get(receiverId);

      try {
        const doc = await createMessage({
          senderId,
          receiverId,
          content: text,
          timestamp,
          delivered: false,
        });

        const base = serializeMessage(doc);
        const instant = Boolean(receiverSocketId);
        socket.emit("receive_message", { ...base, delivered: instant });

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", {
            ...base,
            delivered: true,
          });
          await markDelivered(doc._id);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      const uid = socket.data.userId;
      if (uid && onlineUsers.get(uid) === socket.id) {
        onlineUsers.delete(uid);
        void broadcastUserList().catch((err) => console.error(err));
      }
    });
  });
}
