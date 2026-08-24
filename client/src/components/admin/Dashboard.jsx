import { useState, useEffect } from 'react';
import { FiGrid, FiStar, FiMail, FiCheckCircle, FiArrowRight, FiPlus, FiZap, FiEdit2, FiTrendingUp } from 'react-icons/fi';
import StatCard from './StatCard';
import Badge from './Badge';
import api from '../../services/api';
import logError from '../../utils/logError';

const Dashboard = ({ showToast }) => {
    const [stats, setStats] = useState({
        projects: 0,
        skills: 0,
        messages: 0,
        unreadMessages: 0,
    });
    const [recentMessages, setRecentMessages] = useState([]);
    const [featuredProject, setFeaturedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, messagesRes, skillsRes] = await Promise.all([
                    api.get('/projects'),
                    api.get('/messages'),
                    api.get('/skills'),
                ]);

                const messages = messagesRes.data || [];
                const unread = messages.filter((m) => !m.isRead).length;
                const projects = projectsRes.data || [];
                const skills = skillsRes.data || [];

                setStats({
                    projects: projects.length,
                    skills: skills.length,
                    messages: messages.length,
                    unreadMessages: unread,
                });

                setRecentMessages(messages.slice(0, 4));
                setFeaturedProject(projects[0] || null);
            } catch (error) {
                logError('admin/dashboard', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return `${diff} days ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getInitials = (name) => {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (loading) {
        return <p className="font-body text-[#6B7280]">Loading dashboard...</p>;
    }

    const statCards = [
        { label: 'Total Projects', value: stats.projects, icon: FiGrid },
        { label: 'Skills Listed', value: stats.skills, icon: FiStar },
        { label: 'Unread Messages', value: stats.unreadMessages, icon: FiMail },
        { label: 'Site Status', value: 'Live', icon: FiCheckCircle },
    ];

    return (
        <div>
            {/* ===== DASHBOARD HEADER / HERO ===== */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-3">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                Admin Dashboard
                            </span>
                        </div>
                        <h1 className="font-display text-[clamp(28px,3.5vw,38px)] font-extrabold tracking-[-0.015em]">
                            Welcome back, <span className="gradient-text">Roomi</span>
                        </h1>
                        <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-1 max-w-lg">
                            Here's what's happening with your portfolio today. Manage projects, view messages, and keep your site up to date.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href="/admin/projects"
                            className="inline-flex items-center gap-2 font-display text-[14px] font-semibold py-2.5 px-5 rounded-full gradient-bg text-white shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)_/_0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgb(var(--accent-rgb)_/_0.6)]"
                        >
                            <FiPlus className="w-4 h-4" strokeWidth={1.5} />
                            New Project
                        </a>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-display text-[14px] font-semibold py-2.5 px-5 rounded-full border border-[#E7E8EE] dark:border-[#262D3A] bg-white dark:bg-[#161B22] text-[#14151A] dark:text-[#ECEEF1] transition-all duration-300 hover:border-accent hover:-translate-y-0.5"
                        >
                            <FiTrendingUp className="w-4 h-4" strokeWidth={1.5} />
                            View Site
                        </a>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <StatCard
                        key={index}
                        label={card.label}
                        value={card.value}
                        icon={card.icon}
                    />
                ))}
            </div>

            {/* 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mt-6">
                {/* Recent Messages Panel */}
                <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-bold">Recent Messages</h3>
                        <a
                            href="/admin/messages"
                            className="font-body text-sm text-accent hover:underline flex items-center gap-1"
                        >
                            View all
                            <FiArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </a>
                    </div>

                    {recentMessages.length === 0 ? (
                        <p className="font-body text-[#6B7280] text-sm">No messages yet</p>
                    ) : (
                        <div className="space-y-4">
                            {recentMessages.map((msg) => (
                                <div key={msg._id} className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <span className="font-display text-sm font-bold text-accent">
                                            {getInitials(msg.name)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-sm font-semibold truncate">
                                                {msg.name}
                                            </span>
                                            {!msg.isRead && (
                                                <Badge tone="green" className="text-[10px]">New</Badge>
                                            )}
                                        </div>
                                        <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] truncate">
                                            {msg.message}
                                        </p>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">
                                            {formatDate(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions + Featured Project */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                        <h3 className="font-display text-lg font-bold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <a
                                href="/admin/projects"
                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-[#F2F3F7] dark:bg-[#1B2230] font-display font-semibold text-sm hover:gradient-bg hover:text-white transition-all duration-300"
                            >
                                <FiPlus className="w-4 h-4" strokeWidth={1.5} />
                                Add New Project
                            </a>
                            <a
                                href="/admin/skills"
                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-[#F2F3F7] dark:bg-[#1B2230] font-display font-semibold text-sm hover:gradient-bg hover:text-white transition-all duration-300"
                            >
                                <FiZap className="w-4 h-4" strokeWidth={1.5} />
                                Manage Skills
                            </a>
                            <a
                                href="/admin/profile"
                                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl bg-[#F2F3F7] dark:bg-[#1B2230] font-display font-semibold text-sm hover:gradient-bg hover:text-white transition-all duration-300"
                            >
                                <FiEdit2 className="w-4 h-4" strokeWidth={1.5} />
                                Edit Profile
                            </a>
                        </div>
                    </div>

                    {/* Flagship Spotlight */}
                    {featuredProject && (
                        <div className="rounded-[18px] gradient-bg p-6 overflow-hidden relative">
                            <div className="absolute inset-0 stripe-pattern-45 animate-slide-slow" />
                            <div className="relative z-10">
                                <p className="font-display text-xs font-semibold uppercase tracking-wide text-white/80">
                                    Featured Project
                                </p>
                                <h4 className="font-display text-xl font-extrabold text-white mt-1">
                                    {featuredProject.title}
                                </h4>
                                <p className="font-body text-sm text-white/80 mt-1">
                                    {featuredProject.description?.slice(0, 80)}...
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {featuredProject.stack?.slice(0, 3).map((tech) => (
                                        <span
                                            key={tech}
                                            className="font-display text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/20 text-white"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                    {featuredProject.stack?.length > 3 && (
                                        <span className="font-display text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/20 text-white">
                                            +{featuredProject.stack.length - 3}
                                        </span>
                                    )}
                                </div>
                                <a
                                    href="/admin/projects"
                                    className="inline-flex items-center gap-1.5 mt-4 font-body text-sm text-white/90 hover:text-white transition-colors"
                                >
                                    Manage all projects
                                    <FiArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;