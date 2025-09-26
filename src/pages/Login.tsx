import {useState} from "react";

function Login() {
    const [count, setCount] = useState(0)

    return (
        <div>
            <h2>Login</h2>

            <button onClick={() => setCount((count) => count + 1)}>
                count is {count}
            </button>
        </div>
    );

}

export default Login;