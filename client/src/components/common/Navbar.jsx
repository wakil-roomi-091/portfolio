import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiSun, FiMoon, FiLock, FiUser, FiLogOut, FiUserCheck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ dark, toggleDark }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Work', path: '/work' },
    { name: 'Skills', path: '/skills' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? dark
            ? 'bg-[#0E1117]/75 backdrop-blur-[14px] border-b border-[#262D3A] py-3.5'
            : 'bg-[#FAFAFB]/75 backdrop-blur-[14px] border-b border-[#E7E8EE] py-3.5'
          : 'py-6'
        }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-[20px] font-extrabold tracking-[-0.01em]">
          Roomi<span className="gradient-text">.</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-display text-[14px] font-medium ${dark ? 'text-[#8A92A3] hover:text-[#ECEEF1]' : 'text-[#6B7280] hover:text-[#14151A]'
                } transition-colors duration-200`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3.5">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`hidden lg:inline-flex items-center gap-1.5 font-display text-[13px] font-semibold px-4 py-2 rounded-full ${dark ? 'bg-[#1B2230] text-[#ECEEF1] hover:bg-[#262D3A]' : 'bg-[#F2F3F7] text-[#14151A] hover:bg-[#E7E8EE]'
                    } transition-all duration-200`}
                >
                  <FiLock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Admin Panel
                </Link>
              )}
              <Link
                to="/account"
                title="Your account and data"
                className={`hidden md:inline-flex items-center gap-1.5 font-body text-sm ${dark ? 'text-[#8A92A3] hover:text-[#ECEEF1]' : 'text-[#6B7280] hover:text-[#14151A]'} transition-colors duration-200`}
              >
                <FiUserCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className={`inline-flex items-center gap-1.5 font-display text-[13px] font-semibold px-4 py-2 rounded-full border ${dark ? 'border-[#262D3A] hover:border-red-500 text-[#8A92A3] hover:text-red-400' : 'border-[#E7E8EE] hover:border-red-400 text-[#6B7280] hover:text-red-500'
                  } transition-all duration-200`}
              >
                <FiLogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`hidden lg:inline-flex items-center gap-1.5 font-display text-[13px] font-semibold px-4 py-2 rounded-full border ${dark ? 'border-[#262D3A] hover:border-accent text-[#8A92A3] hover:text-[#ECEEF1]' : 'border-[#E7E8EE] hover:border-accent text-[#6B7280] hover:text-[#14151A]'
                  } transition-all duration-200`}
              >
                <FiUser className="w-3.5 h-3.5" strokeWidth={1.5} />
                Login
              </Link>
              <Link
                to="/signup"
                className={`hidden lg:inline-flex items-center gap-1.5 font-display text-[13px] font-semibold px-5 py-2 rounded-full gradient-bg text-white shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)_/_0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgb(var(--accent-rgb)_/_0.6)]`}
              >
                <FiUser className="w-3.5 h-3.5" strokeWidth={1.5} />
                Sign Up
              </Link>
            </>
          )}

          <button
            onClick={toggleDark}
            className={`w-10 h-10 rounded-full border ${dark ? 'border-[#262D3A] bg-[#161B22]' : 'border-[#E7E8EE] bg-[#FFFFFF]'
              } flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:rotate-12 hover:border-accent`}
            aria-label="Toggle theme"
          >
            {dark ? (
              <FiSun className="w-[18px] h-[18px] text-[#ECEEF1]" strokeWidth={1.5} />
            ) : (
              <FiMoon className="w-[18px] h-[18px] text-[#14151A]" strokeWidth={1.5} />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden w-10 h-10 rounded-full border ${dark ? 'border-[#262D3A] bg-[#161B22]' : 'border-[#E7E8EE] bg-[#FFFFFF]'
              } flex items-center justify-center transition-colors duration-200`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <FiX className={`w-5 h-5 ${dark ? 'text-[#ECEEF1]' : 'text-[#14151A]'}`} strokeWidth={1.5} />
            ) : (
              <FiMenu className={`w-5 h-5 ${dark ? 'text-[#ECEEF1]' : 'text-[#14151A]'}`} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          } ${dark ? 'bg-[#161B22]' : 'bg-[#FFFFFF]'} border-t ${dark ? 'border-[#262D3A]' : 'border-[#E7E8EE]'}`}
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`font-display text-[16px] font-medium ${dark ? 'text-[#8A92A3] hover:text-[#ECEEF1]' : 'text-[#6B7280] hover:text-[#14151A]'
                } transition-colors duration-200 py-2`}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-[16px] font-medium text-accent py-2 flex items-center gap-2"
                >
                  <FiLock className="w-4 h-4" strokeWidth={1.5} />
                  Admin Panel
                </Link>
              )}
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className={`font-display text-[16px] font-medium ${dark ? 'text-[#8A92A3] hover:text-[#ECEEF1]' : 'text-[#6B7280] hover:text-[#14151A]'} transition-colors duration-200 py-2 flex items-center gap-2`}
              >
                <FiUserCheck className="w-4 h-4" strokeWidth={1.5} />
                Your account
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="font-display text-[16px] font-medium text-red-500 py-2 text-left flex items-center gap-2"
              >
                <FiLogOut className="w-4 h-4" strokeWidth={1.5} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="font-display text-[16px] font-medium text-accent py-2 flex items-center gap-2"
              >
                <FiUser className="w-4 h-4" strokeWidth={1.5} />
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="font-display text-[16px] font-semibold py-3 px-6 rounded-full gradient-bg text-white text-center shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)_/_0.5)] transition-all duration-300 hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2"
              >
                <FiUser className="w-4 h-4" strokeWidth={1.5} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;