import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { AdminControlProvider } from "./context/AdminControlContext";
import { ProfileProvider } from "./context/ProfileContext"; // <- import
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AdminControlProvider>
          <ProfileProvider>
            <App />
          </ProfileProvider>
        </AdminControlProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
