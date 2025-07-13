import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Quests from './pages/Quests';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function App() {
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link> | <Link to="/quests">Quests</Link>
            </nav>
            <Routes>
                <Route path="/quests" element={<Quests />} />
                {/* other routes */}
            </Routes>
        </Router>
    );
}

export default App;
