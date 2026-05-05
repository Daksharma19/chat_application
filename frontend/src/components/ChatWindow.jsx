import { useEffect, useMemo, useRef } from "react";

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function ChatWindow({ userId, peerId, peerLabel, messages }) {
  const filtered = useMemo(() => {
    if (!peerId) return [];
    return messages.filter(
      (m) =>
        (m.senderId === userId && m.receiverId === peerId) ||
        (m.senderId === peerId && m.receiverId === userId)
    );
  }, [messages, peerId, userId]);

  const endRef = useRef(null);
  useEffect(() => {
    if (!peerId) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [peerId, filtered.length]);

  if (!peerId) {
    return (
      <div className="messages">
        <div className="emptyState">
          <div className="stack" style={{ gap: 6, maxWidth: 520 }}>
            <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Select someone to start</div>
            <div className="subtle">
              Choose a user on the left to open a conversation. Messages will appear here.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages" role="log" aria-label={`Chat with ${peerLabel || peerId}`}>
      {filtered.length === 0 ? (
        <div className="emptyState">
          <div className="stack" style={{ gap: 6, maxWidth: 520 }}>
            <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>No messages yet</div>
            <div className="subtle">
              Say hi to <strong>{peerLabel || peerId}</strong> to start the conversation.
            </div>
          </div>
        </div>
      ) : (
        filtered.map((m) => {
          const mine = m.senderId === userId;
          return (
            <div
              key={m._id}
              className={`bubbleRow ${mine ? "bubbleRowMine" : ""}`}
              aria-label={mine ? "You" : peerLabel || peerId}
            >
              <div className={`bubble ${mine ? "bubbleMine" : ""}`}>
                <div className="bubbleText">{m.content}</div>
                <div className="bubbleMeta">
                  <span>{formatTime(m.timestamp)}</span>
                  {mine ? <span>· {m.delivered ? "delivered" : "sending…"}</span> : null}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
}
