import { ThemeProvider } from "./context/ThemeContext";

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
