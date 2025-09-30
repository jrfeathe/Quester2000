import {useState} from "react";

function Login() {
    const [count, setCount] = useState(0);
    const [state, setState] = useState("Login");
    const [username, setUsername]= useState("null");

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

            <button onClick={() => {setState("Register"); }}>
                Register
            </button>

            <button onClick={() => setState("Login")}>
                Login
            </button>
        </div>
    );

}

export default Login;