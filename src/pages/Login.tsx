import {useState} from "react";

function Login() {
    const [count, setCount] = useState(0);
    const [state, setState] = useState("Login");
    const [username, setUsername]= useState("");

    async function handleRegister() {
        try {
            const res = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || `Request failed: ${res.status}`);
            }

            const user = await res.json();
            alert(`Registered! id=${user.id}, username=${user.username}`);
        } catch (e) {
            alert((e as Error)?.message || "Something went wrong");
        }
    }

    return (
        <div>
            <h2>{state}</h2>

            <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
            </button>

            <input
                type="text"
                placeholder="Username"
                value={username ?? ""}
                onChange={(e) => setUsername(e.target.value)}
            />

            <button onClick={() => {setState("Register"); handleRegister();}}>
                Register
            </button>

            <button onClick={() => setState("Login")}>
                Login
            </button>
        </div>
    );

}

export default Login;