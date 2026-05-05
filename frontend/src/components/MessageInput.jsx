import { useState } from "react";

export function MessageInput({ disabled, onSend }) {
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v || disabled) return;
    onSend(v);
    setText("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      submit(e);
    }
  }

  return (
    <form onSubmit={submit} className="composer" aria-label="Message composer">
      <textarea
        className="textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={disabled ? "Select a user to start chatting…" : "Write a message… (Enter to send, Shift+Enter for new line)"}
        disabled={disabled}
        rows={1}
      />
      <button type="submit" className="btn btnPrimary" disabled={disabled}>
        Send
      </button>
    </form>
  );
}
