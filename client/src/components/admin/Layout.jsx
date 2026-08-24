import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiGrid, FiStar, FiMail, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import { FiMenu } from 'react-icons/fi';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { to: '/admin', icon: FiHome, label: 'Dashboard' },
        { to: '/admin/projects', icon: FiGrid, label: 'Projects' },
        { to: '/admin/skills', icon: FiStar, label: 'Skills' },
        { to: '/admin/messages', icon: FiMail, label: 'Messages' },
        { to: '/admin/profile', icon: FiUser, label: 'Profile & About' },
        { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFB] dark:bg-[#0E1117]">
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 h-full w-[260px] bg-white dark:bg-[#161B22] border-r border-[#E7E8EE] dark:border-[#262D3A] transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 h-[76px] px-5 border-b border-[#E7E8EE] dark:border-[#262D3A]">
                    <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                        <span className="font-display text-white font-extrabold text-lg">R</span>
                    </div>
                    <div>
                        <span className="font-display text-lg font-extrabold">Roomi<span className="gradient-text">.</span></span>
                        <p className="font-body text-[11px] text-[#6B7280] dark:text-[#8A92A3] leading-tight">Admin Console</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                                `relative flex items-center gap-3 px-4 py-3 rounded-xl font-display text-[14px] font-medium transition-all duration-200 ${isActive
                                    ? 'gradient-soft text-accent'
                                    : 'text-[#6B7280] dark:text-[#8A92A3] hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gradient-bg" />
                                    )}
                                    <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                                    {item.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#E7E8EE] dark:border-[#262D3A] space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 font-body text-[12px] text-[#6B7280] dark:text-[#8A92A3] hover:text-accent transition-colors w-full"
                    >
                        ← Back to live site
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 font-body text-[12px] text-red-500 hover:text-red-600 transition-colors w-full"
                    >
                        <FiLogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-[260px]">
                {/* Mobile Topbar */}
                <div className="lg:hidden flex items-center justify-between h-[76px] px-5 border-b border-[#E7E8EE] dark:border-[#262D3A] bg-[#FAFAFB]/80 dark:bg-[#0E1117]/80 backdrop-blur-md sticky top-0 z-30">
                    <button onClick={() => setIsMobileOpen(true)} className="p-2">
                        <FiMenu className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    <span className="font-display font-bold">Roomi<span className="gradient-text">.</span></span>
                    <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-white font-display text-xs font-bold">R</span>
                    </div>
                </div>

                <main className="p-5 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;