import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useBank } from "../context/BankContext";

export default function TransactionHistory() {
  const { transactions } = useBank();
  return (
    <div className="bg-light min-vh-100 d-flex flex-column font-sans">
      {/* Header */}
      <header className="d-flex align-items-center justify-content-between border-bottom border-secondary-subtle px-4 py-3 bg-white">
        <div className="d-flex align-items-center gap-3 text-dark">
          <div className="text-primary" style={{ width: "24px", height: "24px" }}>
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="fs-5 fw-bold mb-0">TRUST BANK</h2>
        </div>

        <div className="d-flex align-items-center gap-3">
          <nav className="d-none d-md-flex align-items-center gap-4">
            <a href="#" className="text-dark text-decoration-none fw-medium">
              Dashboard
            </a>
            <a href="#" className="text-primary fw-bold text-decoration-none">
              Transactions
            </a>
            <a href="#" className="text-dark text-decoration-none fw-medium">
              Accounts
            </a>
            <a href="#" className="text-dark text-decoration-none fw-medium">
              Profile
            </a>
          </nav>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-primary fw-bold px-3 py-2">New Transfer</button>
            <button className="bell btn btn-light p-2" aria-label="notifications">
              <IoMdNotificationsOutline />
              <span className="dot" />
            </button>
            <div
              className="rounded-circle bg-cover bg-center"
              style={{
                width: "40px",
                height: "40px",
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA1P38znyaME5PjUIjD5IEcDUHq3zfEN9W_tlzDVAYDUrsqT7SgAbYfUNf_ZrtOixO8BcJ-hZ4GZcfpR0kbnfQpiRgfPctSxq0Jf95hctJlbV_K-OLf4NtV6dTFidpdA_d8gXTmFGetfXMJcJy5jBYmU7ySmwmBhg4tV7c9aYhzR1KZlOJDDj1Lxn8lCRJNQRr3fRykJe0e3Pp3-2jNU92n5zPrCsPFWoZb5ExFx9fNroUDV-nDrd757L0uzUUEYJniszuahRwENzWp")',
              }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow d-flex justify-content-center py-4 px-3">
        <div className="w-100" style={{ maxWidth: "1200px" }}>
          {/* Header Section */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
            <div>
              <h1 className="fw-black fs-2 mb-1">Transaction History</h1>
              <p className="text-secondary mb-0">
                View and manage your account activity.
              </p>
            </div>
            <button className="btn btn-light d-flex align-items-center gap-2 fw-bold">
              <span className="material-symbols-outlined">download</span>
              Export as CSV
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                type="text"
                className="form-control border-0 bg-light"
                placeholder="Search by name, amount, or keyword"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="d-flex flex-wrap gap-2 p-3 align-items-center">
            <button className="btn btn-light d-flex align-items-center gap-1">
              Date Range
              <span className="material-symbols-outlined">expand_more</span>
            </button>
            <button className="btn btn-light d-flex align-items-center gap-1">
              Transaction Type
              <span className="material-symbols-outlined">expand_more</span>
            </button>
            <button className="btn btn-light d-flex align-items-center gap-1">
              Sort By: Date
              <span className="material-symbols-outlined">expand_more</span>
            </button>
            <div className="flex-grow-1"></div>
            <button className="btn btn-link text-primary text-decoration-underline">
              Reset Filters
            </button>
          </div>

          {/* Table */}
          <div className="p-3">
            <div className="table-responsive border rounded bg-white">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>{tx.description}</td>
                      <td>
                        <span className="badge bg-light text-secondary">{tx.type}</span>
                      </td>
                      <td
                        className={`text-end fw-medium ${
                          tx.amount < 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge bg-success-subtle text-success">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="d-flex align-items-center justify-content-between border-top mt-3 p-3">
            <p className="text-muted small mb-0">
              Showing 1 to 5 of 25 results
            </p>
            <div className="d-flex gap-2">
              <button className="btn btn-light p-2">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="btn btn-primary text-white fw-bold px-3">1</button>
              <button className="btn btn-light px-3">2</button>
              <button className="btn btn-light px-3">3</button>
              <button className="btn btn-light p-2">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
