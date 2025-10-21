import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
    { to: '/', label: 'Home' },
    { to: '/quests', label: 'Quests' },
    { to: '/shop', label: 'Shop' },
    { to: '/inventory', label: 'Inventory' },
    { to: '/about', label: 'About' },
] as const;

const NavController = () => (
    <div className="skyui">
        <nav className="skyui-topnav" aria-label="Main navigation">
            {navItems.map(({ to, label }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `tab${isActive ? ' is-active' : ''}`}
                >
                    {label}
                </NavLink>
            ))}
        </nav>
        <Outlet />
    </div>
);

export default NavController;