import { useAuth } from "../auth/useAuth";

function Home() {
    const { me, logout } = useAuth();
    return (
        <div>
            <h2>Welcome, {me?.username}</h2>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

export default Home;