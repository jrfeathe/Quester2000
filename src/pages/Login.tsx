import React, { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

function Login() {
    const { login, register } = useAuth();
    const nav = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"login" | "register">("login");
    const [busy, setBusy] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        try {
            if (mode === "login") await login(username, password);
            else await register(username, password);
            nav("/"); // nav to home
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <h2>{mode === "login" ? "Login" : "Register"}</h2>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
            <button type="submit" disabled={busy}>{mode === "login" ? "Login" : "Register"}</button>
            <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} disabled={busy}>
                Switch to {mode === "login" ? "Register" : "Login"}
            </button>
        </form>
    );
}

export default Login;