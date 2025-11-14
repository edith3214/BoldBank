// src/pages/AdminPage.jsx
import React, { useState } from "react";
import { useBank } from "../context/BankContext";
import { useAdminControl } from "../context/AdminControlContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();
  const { transactions, approveTransaction, declineTransaction } = useBank();
  const { triggerLogout, declineTransaction: signalDecline } = useAdminControl();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  // track loading state per tx id
  const [loadingIds, setLoadingIds] = useState(new Set());

  const setLoading = (id, isLoading) => {
    setLoadingIds((prev) => {
      const copy = new Set(prev);
      if (isLoading) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  };

  const filtered = transactions.filter((t) => {
    if (!query) return true;
    const q = query.toLowerCase();
    // use ownerEmail (backend uses ownerEmail)
    const owner = (t.ownerEmail || t.owner || "").toLowerCase();
    return String(t.id).includes(q) ||
      (t.description || "").toLowerCase().includes(q) ||
      (t.type || "").toLowerCase().includes(q) ||
      owner.includes(q);
  });

  const handleApprove = async (tx) => {
    const ok = window.confirm(`Approve transaction ${tx.id}?`);
    if (!ok) return;
    try {
      setLoading(tx.id, true);
      await approveTransaction(tx.id); // awaits backend response and updates local state via BankContext
      alert(`Transaction ${tx.id} approved.`);
    } catch (err) {
      console.error("Approve failed", err);
      alert("Approve failed. See console for details.");
    } finally {
      setLoading(tx.id, false);
    }
  };

  const handleDecline = async (tx, logoutAfter = false) => {
    const text = logoutAfter
      ? `Decline transaction ${tx.id} and force the user to logout?`
      : `Decline transaction ${tx.id}?`;
    if (!window.confirm(text)) return;

    try {
      setLoading(tx.id, true);
      // pass logoutAfter to backend so server emits force-logout to the specific user's socket
      await declineTransaction(tx.id, logoutAfter);

      // optional: signal local admin-control (keeps any admin-only UI in sync)
      signalDecline(tx.id);

      // if admin used the local triggerLogout (for manual forcing) keep it but server-driven is preferred
      if (logoutAfter) {
        // triggerLogout() is client-side; prefer the server-driven force-logout emitted by backend.
        // triggerLogout(); // don't call this here — server will emit force-logout to the user's socket
      }

      alert(`Transaction ${tx.id} declined${logoutAfter ? " and user logged out." : "."}`);
    } catch (err) {
      console.error("Decline failed", err);
      alert("Decline failed. See console for details.");
    } finally {
      setLoading(tx.id, false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold">Admin Panel</h1>
            <div className="text-muted">Signed in as <strong>{user?.email}</strong></div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-danger"
              onClick={() => {
                // local convenience to trigger a UI logout example for testing
                if (window.confirm("Force logout all users (local test)?")) {
                  triggerLogout();
                  alert("Forced logout flag set (client-side).");
                }
              }}
            >
              Force Logout User
            </button>

            {/* Chat button placed next to "Force Logout User" */}
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                // prompt admin for the user's email (pre-fill with first tx owner if available)
                const defaultEmail =
                  (transactions && transactions.length && (transactions[0].ownerEmail || transactions[0].owner)) || "";
                const email = window.prompt("Enter the user's email to open chat with:", defaultEmail);
                if (!email) return;
                // client-side navigation keeps React state & sockets intact
                navigate(`/chat?user=${encodeURIComponent(email.trim())}`);
              }}
            >
              Chat with User
            </button>
          </div>
        </div>

        <div className="card p-3 mb-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <input
              className="form-control"
              placeholder="Search transactions, id, description, owner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="small text-muted">Showing {filtered.length} results</div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th className="text-end">Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.date || new Date(tx.createdAt || tx.createdAtMs).toLocaleString()}</td>
                    <td>{tx.description}</td>
                    <td>{tx.ownerEmail || tx.owner}</td>
                    <td>{tx.type || "Transfer"}</td>
                    <td className={`text-end ${tx.amount < 0 ? "text-danger" : "text-success"}`}>
                      {tx.amount < 0 ? "- $" : "+ $"}{Math.abs(tx.amount ?? 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${tx.status === "Pending" ? "bg-warning text-dark" : tx.status === "Declined" ? "bg-danger" : "bg-success"}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td>
                      {tx.status === "Pending" ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => handleApprove(tx)}
                            disabled={loadingIds.has(tx.id)}
                          >
                            {loadingIds.has(tx.id) ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : "Approve"}
                          </button>

                          <button
                            className="btn btn-sm btn-danger me-2"
                            onClick={() => handleDecline(tx, false)}
                            disabled={loadingIds.has(tx.id)}
                          >
                            {loadingIds.has(tx.id) ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : "Decline"}
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDecline(tx, true)}
                            disabled={loadingIds.has(tx.id)}
                          >
                            {loadingIds.has(tx.id) ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : "Decline + Logout"}
                          </button>
                        </>
                      ) : (
                        <span className="text-muted small">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3">
          <h6>Quick Controls</h6>
          <p className="text-muted small">Decline a transaction to send the user to the error page. You can also force-logout the user.</p>
        </div>
      </div>
    </div>
  );
}
