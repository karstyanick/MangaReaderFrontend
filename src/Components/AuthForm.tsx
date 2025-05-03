import React, { useState } from "react";
import { MODAL_STYLES_1 } from "./Modals/AddManga.Modal";

export interface AuthFormProps {
  signin: (email: string, password: string) => void;
  signup: (email: string, password: string, confirm: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  signin,
  signup,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    console.log("Hello");
    e.preventDefault();
    if (mode === "signin") {
      signin(username, password);
    } else {
      signup(username, password, confirm);
    }
  };

  return (
    <>

      <div style={{ ...MODAL_STYLES_1, maxWidth: "500px", minWidth: "300px" }}>
        <div className="authSelector">
          <button
            type="button"
            className={`${mode === "signin" ? "active" : ""} buttonBasic`}
            onClick={() => setMode("signin")}
          >
            Sign&nbsp;in
          </button>
          <button
            type="button"
            className={`${mode === "signup" ? "active" : ""} buttonBasic`}
            onClick={() => setMode("signup")}
          >
            Sign&nbsp;up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            required
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            required
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === "signup" && (
            <input
              required
              type="password"
              name="confirm"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}

          <button type="submit" className="buttonBasic authButton">
            Submit
          </button>
        </form>
      </div>
    </>
  );
};
