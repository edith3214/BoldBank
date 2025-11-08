// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoPaperPlaneOutline,IoSettings } from "react-icons/io5";
import { FaRegBuilding } from "react-icons/fa";
import { MdHistory,MdSos } from "react-icons/md";
import { IoMdAdd,IoMdCash } from "react-icons/io";
import { FiHome } from "react-icons/fi";
import { IoStatsChartOutline, IoGridOutline } from "react-icons/io5";
import { CiCreditCard1 } from "react-icons/ci";
import { GoPerson } from "react-icons/go";
import { BiHide, BiWorld } from "react-icons/bi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useBank } from "../context/BankContext";
import { useAuth } from "../context/AuthContext";
import { useAdminControl } from "../context/AdminControlContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { IoMdClose } from "react-icons/io";

// Single-file React component for the dashboard preview.
// Uses Tailwind-like utility classes but includes scoped CSS below so it can be dropped
// into a project without external CSS. If you use Tailwind, remove the scoped CSS.

export default function DashboardPage() {
  const { balance, transactions } = useBank();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { forcedLogout, declinedTransactionId } = useAdminControl();

  useEffect(() => {
    if (forcedLogout) {
      logout();
      navigate("/login");
    } else if (declinedTransactionId) {
      navigate("/error");
    }
  }, [forcedLogout, declinedTransactionId, logout, navigate]);

  // add showMenu state
  const [showMenu, setShowMenu] = useState(false);

  // drawer state for accessible side navigation
  const [showDrawer, setShowDrawer] = useState(false);

  // handle Esc to close & prevent background scroll when drawer open
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setShowDrawer(false);
    }
    if (showDrawer) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showDrawer]);

  // show live time/date for a US timezone
  const [now, setNow] = useState(new Date());
  // change this to another US timezone if you prefer, e.g. "America/Chicago"
  const US_TIMEZONE = "America/New_York";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <button
          className="hamburger"
          aria-label="open drawer"
          onClick={() => setShowDrawer(true)}
        >
          <RxHamburgerMenu />
        </button>
        <div className="brand"> 
          <div className="brand-icon"></div>
          <div className="brand-text">TRUST BANK</div>
        </div>
        <div className="top-actions">
          <button className="bell" aria-label="notifications"><IoMdNotificationsOutline /><span className="dot"/></button>
          <Link to="/profile" className="avatar" aria-label="Profile">RB</Link>
        </div>
      </header>

      {/* Drawer overlay + sliding panel */}
      {showDrawer && (
        <>
          <div
            className="drawer-overlay"
            onClick={() => setShowDrawer(false)}
            aria-hidden="true"
          />
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <div className="drawer-name">Roberto</div>
                <div className="drawer-acct">Acct • 77990250980</div>
              </div>
              <button
                className="drawer-close"
                aria-label="Close drawer"
                onClick={() => setShowDrawer(false)}
              >
                <IoMdClose />
              </button>
            </div>

            <nav className="drawer-nav" aria-label="Main">
              <Link to="/transfer" className="drawer-link" onClick={() => setShowDrawer(false)}>
              <IoPaperPlaneOutline aria-hidden="true"/>
                Transfer
              </Link>

              <Link to="/history" className="drawer-link" onClick={() => setShowDrawer(false)}>               
                <MdHistory aria-hidden="true"/>
                History
              </Link>

              <Link to="/deposit" className="drawer-link" onClick={() => setShowDrawer(false)}>
                <IoMdAdd aria-hidden="true" />
                 Deposit
              </Link>

              <Link to="/profile" className="drawer-link" onClick={() => setShowDrawer(false)}>
                <GoPerson aria-hidden="true" /> Profile
              </Link>

              <Link to="/chat" className="drawer-link" onClick={() => setShowDrawer(false)}>
                <MdSos  aria-hidden="true" /> Support
              </Link>

              <button
                className="drawer-link drawer-logout"
                onClick={() => { logout(); setShowDrawer(false); }}
              >
                🚪 Logout
              </button>
            </nav>
          </aside>
        </>
      )}

      <main className="content">
        {/* === 1. BALANCE SECTION === */}
        <div className="dashboard-section balance-section">
          <section className="account-card">
            <div className="account-left">
              <div className="avatar-big">RB</div>
              <div className="greetings">
                <div className="greet-line">Good Day!</div>
                <div className="username">Roberto</div>
              </div>
            </div>

            <div className="account-right" aria-live="polite">
              <div className="time">
                {new Intl.DateTimeFormat("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                  timeZone: US_TIMEZONE,
                }).format(now)}
              </div>
              <div className="date">
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  timeZone: US_TIMEZONE,
                }).format(now)}
              </div>
            </div>

            <div className="balance-block">
              <div className="available">
                Available Balance
                <button className="eye" aria-label="toggle-visibility"><BiHide /></button>
              </div>
              <div className="balance">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="currency">USD</span>
              </div>

              <div className="acct-row">
                <div className="acct-number">
                  <div className="shield">🛡️</div>
                  <div className="acct-text">Your Account Nur <strong>77...</strong></div>
                  <span className="status active">Active</span>
                </div>

                <div className="acct-actions">
                  <button className="btn trans">Transactions</button>
                  {/* <button className="btn topup">Top up</button> */}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* === 2. QUICK ACTIONS SECTION === */}
        <div className="dashboard-section quick-actions-section">
          <section className="actions-intro">
            <h2>What would you like to do today?</h2>
            <p>Choose from our popular actions below</p>
          </section>

          <section className="actions-grid">
            <Link to="/account" className="tile gray" aria-label="Account Info">
              <div className="tile-icon"><FaRegBuilding /></div>
              <div className="tile-text">Account Info</div>
            </Link>
            <Link to="/transfer" className="tile blue" aria-label="Send Money">
              <div className="tile-icon"><IoPaperPlaneOutline /></div>
              <div className="tile-text">Send Money</div>
            </Link>
            <Link to="/deposit" className="tile mint" aria-label="Deposit">
              <div className="tile-icon"><IoMdAdd /></div>
              <div className="tile-text">Deposit</div>
            </Link>
            <Link to="/history" className="tile lilac" aria-label="History">
              <div className="tile-icon"><MdHistory /></div>
              <div className="tile-text">History</div>
            </Link>
          </section>
        </div>

        {/* === 3. CARDS SECTION === */}
        <div className="dashboard-section cards-section">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <button className="nav-item" aria-label="cards"><CiCreditCard1 /></button>
            <h6 className="m-0">Your Cards</h6>
            <a className="view-all">View all</a>
          </div>

          <div className="visa-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="card-small">Trust Bank</div>
                <div className="card-title">VIRTUAL BANKING</div>
              </div>
              <div className="card-right text-end">
                <div className="card-brand">VISA</div>
              </div>
            </div>

            <div className="card-number">•••• •••• •••• 9874</div>
            <div className="d-flex justify-content-between mt-2 card-meta">
              <div>Card Holder</div>
              <div>Valid Thru</div>
            </div>
          </div>

          <div className="visa-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="card-small">Trust Bank</div>
                <div className="card-title">VIRTUAL BANKING</div>
              </div>
              <div className="card-right text-end">
                <div className="card-brand">VISA</div>
              </div>
            </div>

            <div className="card-number">•••• •••• •••• 5697</div>
            <div className="d-flex justify-content-between mt-2 card-meta">
              <div>Card Holder</div>
              <div>Valid Thru</div>
            </div>
          </div>
        </div>

        {/* === 4. RECENT TRANSACTIONS SECTION === */}
        <div className="dashboard-section recent-section">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="m-0">Recent Transactions</h6>
            <a className="view-all">View all</a>
          </div>

          {transactions.slice(0, 4).map((tx) => (
            <div key={tx.id} className="txn">
              <div className="left d-flex align-items-center gap-3">
                <div className={`circle ${tx.amount < 0 ? "debit" : "credit"}`}>
                  {tx.amount < 0 ? "-" : "+"}
                </div>
                <div>
                  <div className="txn-amount">{tx.description}</div>
                  <div className="txn-type">{tx.type}</div>
                </div>
              </div>
              <div className="txn-value">
                {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </main>

      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-item" aria-label="home"><FiHome /></Link>
        <Link to="/account" className="nav-item" aria-label="account"><IoStatsChartOutline /></Link>
        <div className="nav-center">
          <button
            className="grid-btn"
            aria-label="menu"
            onClick={() => setShowMenu(true)}
          >
            <IoGridOutline />
          </button>
        </div>
        <Link to="/deposit" className="nav-item" aria-label="home"><CiCreditCard1 /></Link>
        <Link to="/profile" className="nav-item" aria-label="profile"><GoPerson /></Link>
        
      </nav>

      {showMenu && (
        <div className="menu-overlay" onClick={() => setShowMenu(false)}>
          <div className="menu-container" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header">
              <div>
                <div className="menu-name">Roberto</div>
                <div className="menu-acct">Account: 77990250980</div>
                <span className="verified">✔ Verified</span>
              </div>
              <button className="close-btn" onClick={() => setShowMenu(false)}>
                <IoMdClose />
              </button>
            </div>

            <h3 className="menu-title">Banking Menu</h3>
            <p className="menu-sub">Select an option to continue</p>

            <div className="menu-grid">
              <button><Link to="/dashboard" style={{ color: "#000" }} ><FiHome />Home</Link></button>
              
              <button><Link to="/history" style={{ color: "#000" }} ><IoStatsChartOutline />Activity</Link></button>
              <button><Link to="/error" style={{ color: "#000" }} ><CiCreditCard1 /> Cards</Link></button>
              <button><Link to="/transfer" style={{ color: "#000" }} ><IoPaperPlaneOutline /> Transfer</Link></button>
              <button><Link to="/error" style={{ color: "#000" }} ><BiWorld />Int’l Wire</Link></button>
              <button><Link to="/deposit" style={{ color: "#000" }} ><IoMdAdd /> Deposit</Link></button>
              <button><Link to="/error" style={{ color: "#000" }} ><IoMdCash /> Loan</Link></button>
              <button><Link to="/error" style={{ color: "#000" }} ><FaRegBuilding /> IRS Refund</Link></button>
              <button><Link to="/profile"  style={{ color: "#000" }}><IoSettings /> Settings</Link></button>
             <button><Link to="/chat" style={{ color: "#000" }}> <MdSos /> Support</Link></button>
              <button style={{ background: "#fdd" }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Scoped CSS so you can paste this file into a project and see similar visuals. */}
      <style>{`
        :root{
          --bg: #0f1724;
          --card-blue-1:rgb(15, 97, 136); /* lighter accent */
          --card-blue-2: #0369a1; /* deeper */
          --accent-green: #7ee787;
          --accent-red: #ff6b6b;
          --muted: #cbd5e1;
        }

        /* root container for app */
        #root {
          width: 100%;
          display: block;
        }

        .page-root {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: #f7fbff;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          color: #0b1220;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* make sure all sections expand */
        .content {
          flex: 1;
          width: 100%;
          margin: 0 auto;
          padding: 16px;
          padding-bottom: 96px;
          box-sizing: border-box;
          background:rgba(241, 243, 241, 1);
        }

        /* account card should also stretch properly */
        .account-card {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .topbar{
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:16px;
        }
        .brand{display:flex;align-items:center;gap:8px}
        .brand-icon{width:36px;height:36px;border-radius:8px;background:linear-gradient(180deg,#e6f2ff,#d9f0ff);display:flex;align-items:center;justify-content:center}
        .brand-text{font-weight:700;color:#0b1220}
        .hamburger{background:none;border:none;font-size:20px;color:#000}
        .top-actions{display:flex;gap:12px;align-items:center}
        .bell{background:none;border:none;position:relative;color:#000}
        .bell .dot{position:absolute;right:-6px;top:-6px;width:8px;height:8px;background:#ef4444;border-radius:999px}
        .avatar{width:36px;height:36px;border-radius:999px;background:linear-gradient(90deg,#2dd4bf,#60a5fa);color:white;display:flex;align-items:center;justify-content:center;font-weight:700}

        .content{
          flex: 1;
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 16px;
          padding-bottom: 96px;
          box-sizing: border-box;
        }
        .balance-section{
        padding: 12px;}
        .account-card{
          background: linear-gradient(135deg,var(--card-blue-1), var(--card-blue-2));
          color:white;border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;position:relative;box-shadow:0 12px 30px rgba(3,37,76,0.12);
          
        }
        .account-left{display:flex;align-items:center;gap:12px}
        .avatar-big{width:56px;height:56px;border-radius:999px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-weight:700}
        .greet-line{opacity:0.9}
        .username{font-weight:700}
        .account-right{position:absolute;right:18px;top:18px;text-align:right}
        .time{font-weight:700}
        .date{font-size:12px;opacity:0.9}

        .balance-block{margin-top:8px;}
        .available{font-size:14px;display:flex;align-items:center;gap:8px}
        .eye{background:transparent;border:none;color:white}
        .balance{font-size:32px;font-weight:800;margin-top:6px}
        .balance .currency{font-size:14px;opacity:0.9;margin-left:8px}

        .acct-row{display:flex;align-items:center;justify-content:space-between;margin-top:12px}
        .acct-number{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);padding:10px;border-radius:10px}
        .shield{font-size:18px}
        .status{margin-left:8px;padding:4px 8px;border-radius:999px;font-size:12px}
        .status.active{background: #d1fae5;color:#065f46}

        .acct-actions{display:flex;gap:8px;align-items:center}
        .btn{padding:8px 12px;border-radius:8px;border:none;font-weight:600}
        .btn.trans{background:rgba(255,255,255,0.12);color:white}
        .btn.topup{background:rgba(255,255,255,0.06);color:white}

        .actions-intro{margin-top:20px;
        margin-left:20px;
        margin-right:20px;}
        .actions-intro h2{font-size:20px;margin:0}
        .actions-intro p{margin:4px 0 0;color:var(--muted)}

        .actions-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:12px;
        padding-left:10px;
        background:rgba(255, 255, 255, 1);
        border-radius:10px;
        padding-right:10px;
        padding-top:20px;
        padding-bottom:20px;
        margin-right:15px;
        margin-left:15px;
        }
        .tile{padding:18px;border-radius:14px;display:flex;flex-direction:column;align-items:flex-start;gap:8px;min-height:92px;box-shadow:0 6px 18px rgba(12,22,36,0.04)}
        .tile .tile-icon{font-size:20px}
        .tile.gray{background:#f8fafc}
        .tile.blue{background:linear-gradient(180deg,#a7f3d0,#60a5fa);color:#0b1220;
        }
        .tile.mint{background:linear-gradient(180deg,#ecfccb,#bbf7d0);color:#0b1220}
        .tile.lilac{background:linear-gradient(180deg,#f3e8ff,#efe6ff);color:#0b1220}

        .cards-section{margin-top:18px; margin-bottom:18px;
        background:rgba(255, 255, 255, 1);
        border-radius:10px;
        padding-bottom:10px;
        margin-right:15px;
        margin-left:15px;
        padding-right:50px;
        padding-left:50px;}
        /* spacing between stacked card elements (keeps original color & radius) */
        .visa-card + .visa-card { margin-top:12px; }
        .cards-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
        .visa-card{
          background:linear-gradient(90deg,#2563eb,#0ea5e9);
          color:white;
          padding:16px;
          border-radius:12px;
          display:flex;
          flex-direction:column;
          
        }
        .card-small{font-weight:700}
        .card-title{font-size:12px;opacity:0.95;margin-top:4px}
        .card-brand{font-weight:700}
        .card-number{margin-top:12px;font-size:16px;opacity:0.95}
        .card-meta{font-size:12px;opacity:0.9}

        /* Transactions */
        .recent-section {
         background: #fff;
         margin-left:15px;
         margin-right:15px;
         padding-left:20px;
         padding-right:20px;
         padding-top:10px;
         border-radius:10px;
        }
        .recent-list .txn{display:flex;align-items:center;
        justify-content:space-between;padding:12px 8px;border-bottom:1px solid #f3f5f7}
        .circle{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
        .circle.credit{background:rgba(40,182,87,0.12);color:var(--credit-green)}
        .circle.debit{background:rgba(255,65,91,0.12);color:var(--debit-red)}
        .txn-amount{font-weight:700}
        .txn-type{font-size:12px;color:var(--muted)}
        .txn-value{font-weight:800}

        .bottom-nav{position:fixed;left:0;right:0;bottom:0;height:72px;background:#000;color:#fff;display:flex;align-items:center;justify-content:space-around;padding:0 18px;border-top-left-radius:12px;border-top-right-radius:12px;box-shadow:0 -8px 30px rgba(12,22,36,0.08)}
        .nav-item{background:none;border:none;color:inherit;font-size:20px;display:flex;align-items:center;justify-content:center}
        .nav-center{position:relative;bottom:18px}
        .grid-btn{width:68px;height:68px;border-radius:999px;background:linear-gradient(180deg,#ffffff,#e6f2ff);border:6px solid white;font-size:26px;box-shadow:0 8px 24px rgba(2,6,23,0.12)}

        /* small responsive tweaks */
        @media (max-width:480px){
          .balance{font-size:28px}
          .account-card{padding:14px}
        }

        /* add these styles near the bottom of this file's style block or in your CSS */
        .menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 36, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .menu-container {
          background: white;
          border-radius: 18px;
          padding: 24px;
          width: 90%;
          max-width: 420px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          animation: fadeIn 0.2s ease-out;
        }

        .menu-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        .menu-name {
          font-weight: 700;
          font-size: 18px;
        }

        .menu-acct {
          font-size: 14px;
          opacity: 0.8;
        }

        .verified {
          display: inline-block;
          background: #d1fae5;
          color: #065f46;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 12px;
          margin-top: 4px;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 22px;
        }

        .menu-title {
          text-align: center;
          margin-top: 8px;
          font-size: 20px;
          font-weight: 700;
        }

        .menu-sub {
          text-align: center;
          margin: 0;
          opacity: 0.7;
          font-size: 14px;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .menu-grid button {
          background: linear-gradient(180deg,#a7f3d0,#60a5fa);
          border: none;
          border-radius: 12px;
          padding: 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: #0b1220;
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
          transition: transform 0.1s;
        }
        .menu-grid button:hover {
          transform: scale(1.04);
        }
          
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2,6,23,0.45);
          backdrop-filter: blur(4px);
          z-index: 1000;
        }

        .drawer {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: min(84vw, 360px);
          max-width: 420px;
          background: #fff;
          box-shadow: 0 16px 48px rgba(2,6,23,0.24);
          z-index: 1001;
          padding: 18px;
          display: flex;
          flex-direction: column;
          transform: translateX(-6%);
          animation: drawerIn 220ms cubic-bezier(.2,.9,.3,1) both;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        @keyframes drawerIn {
          from { transform: translateX(-18%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .drawer-name {
          font-weight: 700;
          font-size: 16px;
        }

        .drawer-acct {
          font-size: 13px;
          color: #475569;
          opacity: 0.9;
        }

        .drawer-close {
          background: transparent;
          border: none;
          font-size: 20px;
        }

        .drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 8px;
        }

        .drawer-link {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: linear-gradient(180deg,#f8fafc,#ffffff);
          text-decoration: none;
          color: #0b1220;
          font-weight: 600;
          border: 1px solid rgba(2,6,23,0.04);
        }

        .drawer-link:hover {
          transform: translateX(4px);
        }

        .drawer-logout {
          background: #fff4f4;
          color: #9b1c1c;
          border: 1px solid rgba(255,0,0,0.06);
          margin-top: 8px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
