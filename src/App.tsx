import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Quests from "./pages/Quests"
import NavController from "./components/NavController";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { me, loading } = useAuth();
    if (loading) return <div>Loading…</div>;
    return me ? children : <Navigate to="/login" replace />;
}

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            element={
                                <PrivateRoute>
                                    <NavController />
                                </PrivateRoute>
                            }
                        >
                            <Route path="/" element={<Home />} />
                            <Route path="/quests" element={<Quests />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
