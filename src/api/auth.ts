export type Me = { id: number; username: string } | null;
const BASE = "http://localhost:3000";

export async function me(): Promise<Me> {
    const r = await fetch(`${BASE}/api/me`, { credentials: "include" });
    return r.status === 204 ? null : r.json();
}

export async function register(username: string, password: string) {
    const r = await fetch(`${BASE}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Register failed");
    return r.json();
}

export async function login(username: string, password: string) {
    const r = await fetch(`${BASE}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Login failed");
    return r.json();
}

export async function logout() {
    await fetch(`${BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
    });
}
