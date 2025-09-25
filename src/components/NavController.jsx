import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from '../pages/Home';
import Quests from '../pages/Quests';

const NavController = () => (
    <Router>
        <nav>
            <Link to="/">Home</Link> | <Link to="/quests">Quests</Link>
        </nav>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quests" element={<Quests />} />
            {/* other routes */}
        </Routes>
    </Router>
);

export default NavController;