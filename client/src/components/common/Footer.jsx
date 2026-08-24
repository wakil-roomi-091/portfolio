import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiMail, FiMapPin, FiArrowUp, FiTwitter } from 'react-icons/fi';
import api from '../../services/api';
import logError from '../../utils/logError';
import toExternalUrl from '../../utils/externalUrl';

const Footer = ({ dark }) => {
    const [profile, setProfile] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile');
                setProfile(res.data);
            } catch (error) {
                logError('footer/profile', error);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const name = profile?.name || 'Roomi';
    const location = profile?.location || 'Peshawar, Pakistan';
    const social = profile?.social || {};
    const email = social.email || 'wakila971@gmail.com';

    const currentYear = new Date().getFullYear();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Work', path: '/work' },
        { name: 'Skills', path: '/skills' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <footer className={`relative border-t ${dark ? 'bg-[#0E1117] border-[#262D3A]' : 'bg-[#FAFAFB] border-[#E7E8EE]'}`}>
            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full gradient-bg text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center ${showScrollTop ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                    }`}
                aria-label="Scroll to top"
            >
                <FiArrowUp className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 sm:py-12">
                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#E7E8EE] dark:border-[#262D3A]">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="font-display text-2xl font-extrabold">
                            Roomi<span className="gradient-text">.</span>
                        </Link>
                        <p className={`font-body text-sm mt-3 ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                            } max-w-xs`}>
                            Full-stack developer crafting modern, scalable web applications with a focus on clean UI and secure backend.
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                            <FiMapPin className="w-4 h-4 text-accent" strokeWidth={1.5} />
                            <span className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                                {location}
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-2.5">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className={`font-body text-sm transition-colors duration-200 ${dark
                                                ? 'text-[#8A92A3] hover:text-[#ECEEF1]'
                                                : 'text-[#6B7280] hover:text-[#14151A]'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">
                            Connect
                        </h4>
                        <ul className="space-y-2.5">
                            {social.github && (
                                <li>
                                    <a
                                        href={toExternalUrl(social.github)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 font-body text-sm transition-colors duration-200 ${dark
                                                ? 'text-[#8A92A3] hover:text-[#ECEEF1]'
                                                : 'text-[#6B7280] hover:text-[#14151A]'
                                            }`}
                                    >
                                        <FiGithub className="w-4 h-4" strokeWidth={1.5} />
                                        GitHub
                                    </a>
                                </li>
                            )}
                            {social.linkedin && (
                                <li>
                                    <a
                                        href={toExternalUrl(social.linkedin)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 font-body text-sm transition-colors duration-200 ${dark
                                                ? 'text-[#8A92A3] hover:text-[#ECEEF1]'
                                                : 'text-[#6B7280] hover:text-[#14151A]'
                                            }`}
                                    >
                                        <FiLinkedin className="w-4 h-4" strokeWidth={1.5} />
                                        LinkedIn
                                    </a>
                                </li>
                            )}
                            {email && (
                                <li>
                                    <a
                                        href={`mailto:${email}`}
                                        className={`flex items-center gap-2 font-body text-sm transition-colors duration-200 ${dark
                                                ? 'text-[#8A92A3] hover:text-[#ECEEF1]'
                                                : 'text-[#6B7280] hover:text-[#14151A]'
                                            }`}
                                    >
                                        <FiMail className="w-4 h-4" strokeWidth={1.5} />
                                        Email
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div>
                        <h4 className="font-display text-sm font-semibold uppercase tracking-wider mb-4">
                            Let's Work Together
                        </h4>
                        <p className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'} mb-4`}>
                            Have a project in mind? I'm always open to new opportunities.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 font-display text-sm font-semibold py-2.5 px-5 rounded-full gradient-bg text-white shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)_/_0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgb(var(--accent-rgb)_/_0.6)]"
                        >
                            Get in Touch
                            <FiMail className="w-4 h-4" strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                    <p className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                        © {currentYear} {name}.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link
                            to="/privacy"
                            className={`font-body text-xs ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'} hover:text-accent transition-colors`}
                        >
                            Privacy Policy
                        </Link>
                        <span className={`text-xs ${dark ? 'text-[#262D3A]' : 'text-[#E7E8EE]'}`}>|</span>
                        <Link
                            to="/terms"
                            className={`font-body text-xs ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'} hover:text-accent transition-colors`}
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;