import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.body.style.background = "#565656"
document.body.style.margin = "0"
document.body.style.padding = "0"
document.body.oncontextmenu = function(e) {
  e.preventDefault();
  e.stopPropagation();
};
