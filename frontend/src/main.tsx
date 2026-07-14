// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./features/autenticacion/context/AuthContext";
import { AppRouter } from "./app/AppRouter";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
