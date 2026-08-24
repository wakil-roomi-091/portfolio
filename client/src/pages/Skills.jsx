import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiStar, FiCode, FiServer, FiDatabase, FiCloud,
    FiTool, FiLayout, FiTrendingUp, FiArrowLeft,
    FiZap, FiAward, FiBox
} from 'react-icons/fi';
import api from '../services/api';
import logError from '../utils/logError';

const Skills = ({ dark }) => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await api.get('/skills');
                setSkills(res.data || []);
            } catch (error) {
                logError('page/skills', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    const categoryConfig = {
        frontend: {
            label: 'Frontend Development',
            icon: FiCode,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            gradient: 'from-blue-500/20 to-cyan-500/20',
            description: 'Building responsive, interactive user interfaces',
        },
        backend: {
            label: 'Backend Development',
            icon: FiServer,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            gradient: 'from-green-500/20 to-emerald-500/20',
            description: 'Scalable APIs, authentication, and server logic',
        },
        database: {
            label: 'Database & Storage',
            icon: FiDatabase,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
            gradient: 'from-yellow-500/20 to-amber-500/20',
            description: 'Efficient data modeling and storage solutions',
        },
        devops: {
            label: 'DevOps & Tools',
            icon: FiCloud,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            gradient: 'from-purple-500/20 to-violet-500/20',
            description: 'CI/CD, cloud deployment, and automation',
        },
        design: {
            label: 'Design & UI/UX',
            icon: FiLayout,
            color: 'text-pink-500',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/20',
            gradient: 'from-pink-500/20 to-rose-500/20',
            description: 'Beautiful, user-centered design systems',
        },
        other: {
            label: 'Other Tools',
            icon: FiTool,
            color: 'text-gray-500',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/20',
            gradient: 'from-gray-500/20 to-slate-500/20',
            description: 'Additional languages and utilities',
        },
    };

    const groupedSkills = skills.reduce((acc, skill) => {
        const category = skill.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {});

    const categoryOrder = ['frontend', 'backend', 'database', 'devops', 'design', 'other'];
    const sortedCategories = categoryOrder.filter((cat) => groupedSkills[cat]);

    const totalSkills = skills.length;
    const totalCategories = sortedCategories.length;

    if (loading) {
        return (
            <div className="min-h-screen pt-24 max-w-[1200px] mx-auto px-8 py-12">
                <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">Loading skills...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 ${dark ? 'bg-[#0E1117] text-[#ECEEF1]' : 'bg-[#FAFAFB] text-[#14151A]'}`}>
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
                {/* ===== BACK TO HOME ===== */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] hover:text-accent transition-colors mb-6"
                >
                    <FiArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    Back to Home
                </Link>

                {/* ===== HERO HEADER ===== */}
                <div className="mb-10 sm:mb-16 relative">
                    {/* Background Decoration */}
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-end/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-4">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                My Tech Stack
                            </span>
                            <span className="w-1 h-1 rounded-full bg-accent/30" />
                            <span className="font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3]">
                                {totalSkills} Skills
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="font-display text-[clamp(38px,6vw,68px)] font-extrabold tracking-[-0.02em] leading-[1.08]">
                            Technologies I <span className="gradient-text">Work With</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="font-body text-lg text-[#6B7280] dark:text-[#8A92A3] mt-4 max-w-2xl leading-[1.7]">
                            A comprehensive overview of the technologies, frameworks, and tools I use
                            to build modern web applications. Constantly evolving and expanding my stack.
                        </p>
                    </div>
                </div>

                {/* ===== STATS SUMMARY ===== */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 sm:mb-16">
                    <div className={`rounded-[18px] border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                        }`}>
                        <div className="w-12 h-12 rounded-full gradient-soft flex items-center justify-center mx-auto mb-2">
                            <FiZap className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        </div>
                        <span className="font-display text-3xl font-extrabold gradient-text">{totalSkills}</span>
                        <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">Total Skills</p>
                    </div>
                    <div className={`rounded-[18px] border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                        }`}>
                        <div className="w-12 h-12 rounded-full gradient-soft flex items-center justify-center mx-auto mb-2">
                            <FiBox className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        </div>
                        <span className="font-display text-3xl font-extrabold gradient-text">{totalCategories}</span>
                        <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">Categories</p>
                    </div>
                    <div className={`rounded-[18px] border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                        }`}>
                        <div className="w-12 h-12 rounded-full gradient-soft flex items-center justify-center mx-auto mb-2">
                            <FiAward className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        </div>
                        <span className="font-display text-3xl font-extrabold gradient-text">
                            {Object.values(groupedSkills).reduce((max, arr) => Math.max(max, arr.length), 0)}
                        </span>
                        <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">Most in a Category</p>
                    </div>
                    <div className={`rounded-[18px] border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                        }`}>
                        <div className="w-12 h-12 rounded-full gradient-soft flex items-center justify-center mx-auto mb-2">
                            <FiTrendingUp className="w-5 h-5 text-accent" strokeWidth={1.5} />
                        </div>
                        <span className="font-display text-3xl font-extrabold gradient-text">
                            {new Date().getFullYear() - 2022}+
                        </span>
                        <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">Years Learning</p>
                    </div>
                </div>

                {/* ===== SKILLS BY CATEGORY ===== */}
                <div className="space-y-12">
                    {sortedCategories.map((category) => {
                        const config = categoryConfig[category];
                        const Icon = config.icon;
                        const categorySkills = groupedSkills[category];

                        return (
                            <div key={category}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-6 h-6 ${config.color}`} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-xl font-bold">{config.label}</h2>
                                        <p className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                                            {config.description} · {categorySkills.length} skill{categorySkills.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {categorySkills.map((skill) => (
                                        <div
                                            key={skill._id}
                                            className={`group relative px-5 py-3 rounded-full border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark
                                                    ? 'bg-[#161B22] border-[#262D3A] hover:border-accent hover:shadow-accent/10'
                                                    : 'bg-white border-[#E7E8EE] hover:border-accent hover:shadow-accent/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                                                <span className="font-display text-sm font-medium">{skill.name}</span>
                                            </div>
                                            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ===== FOOTER SUMMARY ===== */}
                <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-[18px] gradient-bg overflow-hidden relative">
                    <div className="absolute inset-0 stripe-pattern-45 animate-slide-slow" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <div>
                            <h3 className="font-display text-xl font-bold text-white">Always Learning</h3>
                            <p className="font-body text-white/80 text-sm">
                                {totalSkills} skills and counting. Technology evolves, and so do I.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="flex items-center gap-2 text-white/80">
                                <FiTrendingUp className="w-5 h-5" strokeWidth={1.5} />
                                <span className="font-body text-sm">Constantly expanding</span>
                            </div>
                            <div className="w-px h-8 bg-white/20" />
                            <div className="flex items-center gap-2 text-white/80">
                                <FiZap className="w-5 h-5" strokeWidth={1.5} />
                                <span className="font-body text-sm">{new Date().getFullYear() - 2022}+ years</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skills;