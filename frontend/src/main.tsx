// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./app/AppRouter";
import { AlertSystem } from "./components/AlertSystem";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRouter />
    <AlertSystem />
  </React.StrictMode>
);
