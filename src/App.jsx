import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { BankProvider } from "./context/BankContext";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ErrorPage from "./pages/ErrorPage";
import TransferPage from "./pages/TransferPage";
import TransactionHistory from "./pages/HistoryPage";
import ChatPage from "./pages/ChatPage";

function PrivateRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  // while auth is being checked, render nothing (or a spinner if you like)
  if (loading) return null; // or return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  return (
    <BankProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRole="user">
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/transfer"
          element={
            <PrivateRoute allowedRole="user">
              <TransferPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute allowedRole="user">
              <TransactionHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <PrivateRoute>{/* both admin & user allowed */}
              <ChatPage />
            </PrivateRoute>
          }
        />

        <Route path="/error" element={<ErrorPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BankProvider>
  );
}
