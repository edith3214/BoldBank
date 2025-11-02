import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { IoMdNotificationsOutline } from "react-icons/io";

export default function DepositPage() {
  return (
    <div className="min-vh-100 d-flex flex-column bg-white text-dark font-monospace">
      {/* Header */}
      <header className="d-flex justify-content-between align-items-center border-bottom px-4 px-md-5 py-3 bg-white">
        <div className="d-flex align-items-center gap-3 text-dark">
          <div className="text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" width="24" height="24">
              <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" />
            </svg>
          </div>
          <h2 className="h5 fw-bold mb-0">BOLD TRUST BANK</h2>
        </div>

        <div className="d-none d-md-flex align-items-center gap-4">
          <nav className="d-flex gap-4">
            <a href="#" className="text-dark text-decoration-none fw-medium">Dashboard</a>
            <a href="#" className="text-dark text-decoration-none fw-medium">Transfers</a>
            <a href="#" className="text-primary fw-bold text-decoration-none">Deposits</a>
            <a href="#" className="text-dark text-decoration-none fw-medium">Account</a>
          </nav>

          <div className="d-flex align-items-center gap-2">
            <button className="bell btn btn-light border-0" aria-label="notifications">
              <IoMdNotificationsOutline />
              <span className="dot" />
            </button>
            <button className="btn btn-light border-0">
              <span className="material-symbols-outlined fs-5">settings</span>
            </button>
            <div
              className="rounded-circle bg-cover"
              style={{
                width: "40px",
                height: "40px",
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA2Qo85pdfTDh2Gis5WvfIwFS5OfeU6v8KOHEUMi9Gi5-lPNEKSQDBN5_iH-Hj9TtF5u2TolmVqiVsxJxFMSe2ONEjK3QW-e_ZT75U2fEn3L0ZqjOnoPrrid6xdhcMbHa0TL4njCowVvrAkHqj_Iei1iabkNGwG_IQ0U75IuElPw6aMx-ytw1t6enXDNIvzbTS23lhhZ9k1yp-JsLrX9nDwd6RtcSHuOqOK4FGU7gEjUaiLjaT4QNcuD3nwrmZnZ0xQxiM13wryRR_U")',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 d-flex justify-content-center py-5 px-3">
        <div className="w-100" style={{ maxWidth: "700px" }}>
          <div className="px-3 mb-4">
            <h1 className="fw-bold display-6 mb-1">Deposit Funds</h1>
          </div>

          {/* Step 1: Choose Deposit Method */}
          <section className="mb-5">
            <h2 className="h5 fw-bold mb-3 px-3">Choose a deposit method</h2>

            <div className="d-flex flex-column gap-3 px-3">
              {[
                {
                  
                  title: "Bank Transfer",
                  desc: "Deposit directly from a linked bank account.",
                  defaultChecked: true,
                },
                {
                  
                  title: "Mobile Check Deposit",
                  desc: "Use your phone to deposit a check.",
                },
                {
                  
                  title: "Link a Digital Wallet",
                  desc: "Connect your digital wallet to add funds.",
                },
              ].map((method, i) => (
                <label
                  key={i}
                  className="border rounded-3 p-3 d-flex align-items-center gap-3 position-relative bg-light"
                  style={{ cursor: "pointer" }}
                >
                  <span className="material-symbols-outlined text-primary fs-3">
                    {method.icon}
                  </span>
                  <div className="flex-grow-1">
                    <p className="fw-semibold mb-0">{method.title}</p>
                    <small className="text-muted">{method.desc}</small>
                  </div>
                  <input
                    type="radio"
                    name="deposit_method"
                    className="form-check-input"
                    defaultChecked={method.defaultChecked}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Step 2: Enter Amount */}
          <section className="mb-5">
            <h2 className="h5 fw-bold mb-3 px-3">Enter amount</h2>
            <div className="px-3">
              <label htmlFor="depositAmount" className="form-label fw-semibold">
                Amount to Deposit
              </label>
              <div className="input-group input-group-lg mb-2">
                <span className="input-group-text bg-light">$</span>
                <input
                  type="number"
                  className="form-control"
                  id="depositAmount"
                  placeholder="0.00"
                />
                <span className="input-group-text bg-light">USD</span>
              </div>
              <small className="text-muted">
                Standard processing time is 1–2 business days. Daily deposit
                limit: $10,000.
              </small>
            </div>
          </section>

          {/* Step 3: CTA */}
          <section className="px-3 text-center">
            <button className="btn btn-primary btn-lg w-100 mb-3 fw-bold">
              Review Deposit
            </button>
            <div className="d-flex justify-content-center align-items-center gap-2 text-muted small">
              <span className="material-symbols-outlined fs-6">lock</span>
              <span>Your transactions are protected with bank-grade security.</span>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-top mt-5 pt-4 pb-3 text-center">
            <div className="d-flex justify-content-center gap-4 small">
              <a href="#" className="text-muted text-decoration-none">
                Help
              </a>
              <a href="#" className="text-muted text-decoration-none">
                Contact Support
              </a>
              <a href="#" className="text-muted text-decoration-none">
                Security Information
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
