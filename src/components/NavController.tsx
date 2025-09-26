import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from '../pages/Home';
import Quests from '../pages/Quests';
import Login from '../pages/Login';

const NavController = () => (
    <Router>
        <nav>
            <Link to="/">Home</Link> | <Link to="/quests">Quests</Link> | <Link to="/login">Login</Link>
        </nav>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/login" element={<Login />} />
            {/* other routes */}
        </Routes>
    </Router>
);

export default NavController;