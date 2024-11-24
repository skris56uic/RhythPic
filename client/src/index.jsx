import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { AppContextProvider } from "./AppContextAndAppContextProvider";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </StrictMode>
);
