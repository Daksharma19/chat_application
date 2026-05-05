import { AuthScreen } from "./components/AuthScreen.jsx";
import { ChatApp } from "./components/ChatApp.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";

export default function App() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="appShell">
        <div className="container">
          <div className="card cardPad">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="brand">Chat</div>
                <div className="subtle">Loading your session…</div>
              </div>
              <span className="badge" aria-live="polite">
                <span className="dot" />
                Loading
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthScreen />;
  }

  return (
    <div className="appShell">
      <div className="container">
        <SocketProvider token={token}>
          <ChatApp user={user} />
        </SocketProvider>
      </div>
    </div>
  );
}
