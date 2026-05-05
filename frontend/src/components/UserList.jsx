export function UserList({ users, currentUserId, selectedId, onSelect }) {
  const others = users.filter((u) => u.id !== currentUserId);
  const count = others.length;

  function initials(label) {
    const v = (label || "").trim();
    if (!v) return "?";
    const parts = v.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || v[0];
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  }

  return (
    <div className="card cardPad" style={{ height: "100%" }}>
      <div className="panelTitle">
        <div className="title">Active users</div>
        <span className="pill" aria-label={`${count} users online`}>
          {count} online
        </span>
      </div>

      {others.length === 0 ? (
        <div className="subtle" style={{ padding: 10 }}>
          No other users online yet.
        </div>
      ) : (
        <ul className="userList" role="list">
          {others.map((u) => {
            const selected = selectedId === u.id;
            return (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => onSelect(u.id)}
                  className={`userBtn ${selected ? "userBtnSelected" : ""}`}
                  aria-pressed={selected}
                >
                  <div className="avatar" aria-hidden="true">
                    {initials(u.label)}
                  </div>
                  <div className="userMeta">
                    <div className="userName">{u.label}</div>
                    <div className="userId">{u.id}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
