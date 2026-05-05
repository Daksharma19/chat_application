import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useChatSession } from "../hooks/useChatSession.js";
import { ChatWindow } from "./ChatWindow.jsx";
import { MessageInput } from "./MessageInput.jsx";
import { UserList } from "./UserList.jsx";

export function ChatApp({ user }) {
  const { logout } = useAuth();
  const [peerId, setPeerId] = useState("");
  const session = useChatSession(user.id);

  const peerLabel = useMemo(() => {
    const u = session.onlineUsers.find((x) => x.id === peerId);
    return u?.label;
  }, [session.onlineUsers, peerId]);

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="card cardPad">
        <div className="row" style={{ flexWrap: "wrap" }}>
          <div className="row" style={{ gap: 10, minWidth: 0 }}>
            <div className="brand" style={{ fontSize: 18 }}>
              Chat
            </div>
            <span className="subtle" style={{ minWidth: 0 }}>
              Signed in as <strong>{user.displayName}</strong> <span className="subtle">({user.email})</span>
            </span>
          </div>

          <div className="space" />

          <span className="badge" aria-live="polite" title="Socket connection status">
            <span className={`dot ${session.connected ? "dotOk" : "dotBad"}`} />
            {session.connected ? "Connected" : "Disconnected"}
          </span>

          <button type="button" className="btn btnGhost" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {session.connectionError && (
        <div className="alert" role="alert">
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Can’t connect to chat server</div>
          <div className="subtle" style={{ lineHeight: 1.4 }}>
            {session.connectionError}. Check that the backend is running, <span className="kbd">VITE_SOCKET_URL</span>{" "}
            matches the API, and <span className="kbd">CLIENT_ORIGIN</span> in backend <span className="kbd">.env</span>{" "}
            includes this page&apos;s origin (e.g. both <span className="kbd">http://localhost:5173</span> and{" "}
            <span className="kbd">http://127.0.0.1:5173</span>).
          </div>
        </div>
      )}

      <div className="chatGrid">
        <UserList
          users={session.onlineUsers}
          currentUserId={user.id}
          selectedId={peerId}
          onSelect={setPeerId}
        />

        <div className="card cardPad chatPanel">
          <div className="chatHeader">
            <div className="chatTitle">
              <div className="avatar" aria-hidden="true">
                {(peerLabel || peerId || "?").trim().slice(0, 1).toUpperCase()}
              </div>
              <div className="chatTitleText">
                <div className="chatPeer">{peerId ? peerLabel || peerId : "No chat selected"}</div>
                <div className="chatSubtitle">
                  {peerId ? "Messages are end‑to‑end *not* encrypted (demo app)." : "Pick a user to start chatting."}
                </div>
              </div>
            </div>
            <span className="pill">{peerId ? "Direct message" : "Idle"}</span>
          </div>

          <ChatWindow userId={user.id} peerId={peerId} peerLabel={peerLabel} messages={session.messages} />

          <MessageInput
            disabled={!session.connected || !peerId}
            onSend={(content) => session.sendMessage(peerId, content)}
          />
        </div>
      </div>
    </div>
  );
}
