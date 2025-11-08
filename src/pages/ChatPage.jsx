import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { socket } from "../lib/socket";
import { useSearchParams, useNavigate } from "react-router-dom";

const BACKEND = import.meta.env.VITE_BACKEND || "http://localhost:3001";

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // the other participant (admin opens with ?user=user@bank.com, user opens with ?user=admin@bank.com)
  const other = searchParams.get("user") || (user?.role === "user" ? "admin@bank.com" : null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!other) {
      alert("No conversation specified.");
      navigate(-1);
      return;
    }

    // fetch initial convo
    const fetchConvo = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/messages?user=${encodeURIComponent(other)}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("fetch convo error", e);
      }
    };
    fetchConvo();

    // ensure socket connected
    if (!socket.connected) socket.connect();

    const onNew = (msg) => {
      // only add messages that belong to this conversation
      if (
        (msg.fromEmail === other && msg.toEmail === user.email) ||
        (msg.fromEmail === user.email && msg.toEmail === other)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("message:created", onNew);

    return () => {
      socket.off("message:created", onNew);
    };
  }, [user, other, navigate]);

  useEffect(() => {
    // scroll to bottom
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await fetch(`${BACKEND}/api/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: other, content: text.trim() }),
      });
      if (!res.ok) throw new Error("Send failed");
      const saved = await res.json();
      // server emits the saved message to both participants; we can optimistically append too
      setMessages((prev) => [...prev, saved]);
      setText("");
    } catch (err) {
      console.error("send message error", err);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Chat with Trust Support</h4>
        <div className="small text-muted">Signed in </div>
      </div>

      <div
        ref={listRef}
        className="border rounded p-3 mb-3"
        style={{ height: "60vh", overflowY: "auto", background: "#f8f9fa" }}
      >
        {messages.length === 0 && <div className="text-muted">No messages yet. Send the first message.</div>}
        {messages.map((m) => {
          const mine = m.fromEmail === user.email;
          return (
            <div key={m.id} className={`d-flex mb-2 ${mine ? "justify-content-end" : "justify-content-start"}`}>
              <div style={{ maxWidth: "75%" }}>
                <div className={`p-2 rounded ${mine ? "bg-primary text-white" : "bg-white border"}`}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
                <div className="small text-muted mt-1">{new Date(m.createdAtMs || m.createdAt || Date.now()).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="d-flex gap-2">
        <input
          className="form-control"
          placeholder={`Message trust support `}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  );
}
