import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0C4010" },
    secondary: { main: "#0C4010" },
    background: { default: "#ededed", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: [
      "-apple-system","BlinkMacSystemFont","'Segoe UI'","Roboto","Oxygen",
      "Ubuntu","Cantarell","'Fira Sans'","'Droid Sans'","'Helvetica Neue'",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);