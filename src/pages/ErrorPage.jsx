// src/pages/ErrorPage.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ErrorPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleChat = () => {
    navigate("/chat");
  };

  return (
    <div className="error-page bg-light min-vh-100 d-flex flex-column align-items-center justify-content-center text-center p-3">
      <h1 className="display-5 text-danger fw-bold mb-3">
        Transaction Declined
      </h1>
      <p className="text-secondary mb-4">
        Your recent transaction was declined. Please contact customer service
        for assistance.
      </p>

      <div className="d-flex flex-column gap-2 w-100" style={{ maxWidth: "320px" }}>
        <Link to="/chat?user=admin@bank.com" className="btn btn-primary fw-bold">
          Chat with Customer Service
        </Link>

        <button className="btn btn-outline-danger fw-bold" onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
}
