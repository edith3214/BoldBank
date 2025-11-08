// src/pages/TransferPage.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import { useBank } from "../context/BankContext";
import { useAdminControl } from "../context/AdminControlContext";
import { useAuth } from "../context/AuthContext";

// Add in index.html: 
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

export default function TransferPage() {
  const { balance, addTransaction, transactions } = useBank();
  const { declinedTransactionId } = useAdminControl();
  const { user } = useAuth();

  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Recipient UI state + last-pending details
  const [recipientName, setRecipientName] = useState("");
  const [pendingRecipient, setPendingRecipient] = useState("");
  const [pendingAmount, setPendingAmount] = useState(null);

  // New states per request
  const [latestTx, setLatestTx] = useState(null);
  const [status, setStatus] = useState("idle"); // "idle" | "pending" | "success"

  const transactionFee = 1.5;
  // Note: addTransaction should return the created transaction (BankContext does)

  // derive latest relevant transaction directly from shared transactions array
  useEffect(() => {
    if (!user) return;

    // find the most recent pending transaction for this user
    const pendingTx = transactions.find((t) => t.status === "Pending" && t.owner === user.email);
    if (pendingTx) {
      setLatestTx(pendingTx); // keep id reference
      setStatus("pending");
      return;
    }

    // if we have a latestTx reference, check its current status in transactions
    if (latestTx) {
      const match = transactions.find((t) => t.id === latestTx.id);
      if (match?.status === "Completed" && status === "pending") {
        setStatus("success");
      } else if (match?.status === "Declined") {
        alert("❌ Your transaction was declined.");
        navigate("/error");
        setStatus("idle");
      }
    }
  }, [transactions, user, latestTx, status, navigate, declinedTransactionId]);

  return (
    <div
      className="min-vh-100 bg-light text-dark d-flex flex-column align-items-center justify-content-center"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <main className="container-fluid py-5 d-flex justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
          <div className="mb-3">
            <Link to="/dashboard" className="btn btn-link p-0 text-decoration-none">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="text-center mb-5">
            <h1 className="fw-bold display-5">Make a Transfer</h1>
            <p className="text-secondary mt-2 fs-5">
              Available Balance:{" "}
              <span className="fw-bold text-success">
                ${balance.toFixed(2)}
              </span>
            </p>
          </div>

          <div className="card shadow-sm rounded-4 border-0 w-100">
            <div className="card-body p-4 p-md-5">
              {status === "idle" && (
                <form
                  className="d-flex flex-column gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const amountValue = parseFloat(e.target.amount.value);
                    if (!amountValue || amountValue <= 0) return alert("Enter valid amount");
                    if (!recipientName || recipientName.trim().length === 0) return alert("Enter recipient name");

                    try {
                      setIsTransferring(true);
                      // create tx on server and get returned tx object
                      const newTx = await addTransaction(
                        "Money Transfer",
                        "Transfer",
                        -amountValue,
                        user?.email // use real logged in email
                      );

                      console.log("✅ New transaction added:", newTx);

                      // remember who & how much this pending tx was for (used in UI)
                      setPendingRecipient(recipientName);
                      setPendingAmount(amountValue);

                      setLatestTx(newTx);
                      setStatus("pending");

                      // reset form fields
                      setAmount("");
                      setRecipientName("");
                     // alert("Transfer pending.");
                      e.target.reset();
                    } catch (err) {
                      console.error("Transfer failed", err);
                      alert("Failed to submit transfer.");
                    } finally {
                      setIsTransferring(false);
                    }
                  }}
                >
                  {/* Recipient Details */}
                   <div>
                    <h2 className="h5 fw-semibold mb-3">Recipient Details</h2>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Recipient Account Number</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Enter account number"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Recipient Bank</label>
                      <select className="form-select form-select-lg" required>
                        <option value="">Select a bank</option>
                        <option value="bank1">Bank of America</option>
                        <option value="bank2">Revolut Bank</option>
                        <option value="bank3">Wells Fargo</option>
                        <option value="bank4">Citibank</option>
                      </select>
                    </div>
                  </div>
                    
                   

                    <div className="mb-3">
                      <label className="form-label fw-medium">Recipient Name</label>
                      <input
                        name="recipientName"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Recipient full name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        required
                      />
                    </div>
                  {/* Transfer Details */}
                  <div>
                    <h2 className="h5 fw-semibold mb-3">Transfer Details</h2>

                    <div className="mb-3">
                      <label className="form-label fw-medium">Amount to Send</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text">$</span>
                        <input
                          name="amount"
                          type="number"
                          step="0.01"
                          className="form-control"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        Description (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Add a note for the recipient"
                      ></textarea>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  <div className="border rounded-3 bg-light p-3">
                    <h5 className="fw-semibold mb-3">Transaction Summary</h5>
                    <div className="text-muted small">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Recipient:</span>
                        <span className="fw-medium text-dark">{recipientName || "Recipient"}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Amount:</span>
                        <span className="fw-medium text-dark">
                          ${amount ? parseFloat(amount).toFixed(2) : "0.00"}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Transaction Fee:</span>
                        <span className="fw-medium text-dark">${transactionFee.toFixed(2)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold">Total:</span>
                        <span className="fw-bold text-dark">
                          $
                          {amount
                            ? (parseFloat(amount) + transactionFee).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={isTransferring}
                  >
                    {isTransferring ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        Send Money
                        <span className="material-symbols-outlined fs-5">
                          
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {status === "pending" && (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning mb-3" role="status"></div>
                  <h4 className="fw-bold">Transfer Pending Approval</h4>
                  <p className="text-muted">
                    Your transaction of{" "}
                    <strong>
                      ${pendingAmount ? Number(pendingAmount).toFixed(2) : "0.00"}
                    </strong>{" "}
                    to <strong>{pendingRecipient || "the recipient"}</strong> is pending.    
                  </p>
                  <p style ={{color: 'gray'}}>
                    please hold while we process your transaction.
                  </p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-5">
                  <div className="text-success display-3 mb-3">✅</div>
                  <h3 className="fw-bold">Transfer Successful!</h3>
                  <p className="text-secondary">
                    Your transaction of{" "}
                    <strong>${pendingAmount ? Number(pendingAmount).toFixed(2) : "0.00"}</strong>{" "}
                    to <strong>{pendingRecipient || "the recipient"}</strong> was approved and processed.
                  </p>
                  <button
                    className="btn btn-outline-primary mt-3"
                    onClick={() => {
                      // clear pending details and go back to empty form
                      setStatus("idle");
                      setPendingRecipient("");
                      setPendingAmount(null);
                    }}
                  >
                    Make Another Transfer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Security Tip */}
      <div className="container-fluid">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6 mx-auto">
          <div className="alert alert-primary d-flex align-items-center justify-content-center gap-2 mt-4 rounded-3 small">
            <span className="material-symbols-outlined fs-5"></span>
            <p ></p>
            <p className="mb-0">
              Note:you've chosen not to use a pin for transaction to secure your account it is recommended to enable it for added security.
              For your security, never share your password or OTP with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
