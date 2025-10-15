import { NavLink, Outlet } from 'react-router-dom';

const NavController = () => (
    <div>
        <nav style={{ display: 'flex', gap: '1rem', padding: '1rem 0' }}>
            <NavLink to="/" end>
                Home
            </NavLink>
            <NavLink to="/quests">
                Quests
            </NavLink>
            <NavLink to="/shop">
                Shop
            </NavLink>
            <NavLink to="/inventory">
                Inventory
            </NavLink>
            <NavLink to="/about">
                About
            </NavLink>
        </nav>
        <Outlet />
    </div>
);

export default NavController;