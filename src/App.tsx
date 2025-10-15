import React from 'react'
import './App.css'
import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Quests from "./pages/Quests"
import NavController from "./components/NavController";
import About from "./pages/About";
import Inventory from "./pages/Inventory"

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { me, loading } = useAuth();
    if (loading) return <div>Loading…</div>;
    return me ? children : <Navigate to="/login" replace />;
}

function App() {

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
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/about" element={<About />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </>
    )
}

export default App
