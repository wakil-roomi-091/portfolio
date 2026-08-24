import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiMapPin, FiCalendar, FiCode, FiArrowLeft,
    FiUser, FiBriefcase, FiHeart, FiMail, FiGithub,
    FiLinkedin, FiZap, FiGlobe, FiFile, FiEye
} from 'react-icons/fi';
import api from '../services/api';
import logError from '../utils/logError';
import toExternalUrl from '../utils/externalUrl';

const About = ({ dark }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile');
                setProfile(res.data);
            } catch (error) {
                logError('page/about', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className={`min-h-screen pt-24 ${dark ? 'bg-[#0E1117]' : 'bg-[#FAFAFB]'}`}>
                <div className="max-w-[1200px] mx-auto px-8 py-12">
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">Loading about...</p>
                </div>
            </div>
        );
    }

    const data = profile || {};
    const name = data.name || 'Roomi';
    const title = data.title || 'Full-Stack Developer';
    const location = data.location || 'Peshawar, Pakistan';
    const education = data.education || 'UET Peshawar — CS Student';
    const aboutHeading = data.aboutHeading || 'From Peshawar, building for the world.';
    const aboutP1 = data.aboutP1 || "I'm a passionate full-stack developer based in Peshawar, Pakistan, currently pursuing my Computer Science degree at UET Peshawar. Originally from the beautiful valleys of Chitral, I bring a unique perspective to every project I build.";
    const aboutP2 = data.aboutP2 || "I specialize in the MERN stack, with a growing interest in cybersecurity and AI integration. I believe in building secure, scalable, and beautiful applications that solve real problems.";
    const stats = data.stats || [
        { num: '4+', lab: 'Projects designed' },
        { num: '2+', lab: 'Years learning to build' },
        { num: '100%', lab: 'Self-driven projects' },
    ];
    const profileImage = data.profileImage || null;
    const cvUrl = data.cvUrl || null;
    // Social links fall back to the owner's real accounts when the admin
    // Profile hasn't set them, mirroring how name/title/etc. default above.
    const social = data.social || {};
    const github = toExternalUrl(social.github || 'https://github.com/wakil-roomi-091');
    const linkedin = toExternalUrl(social.linkedin || 'https://www.linkedin.com/in/wakil-roomi-5b576b39b/');
    const email = social.email || 'wakila971@gmail.com';

    return (
        <div className={`min-h-screen pt-24 ${dark ? 'bg-[#0E1117] text-[#ECEEF1]' : 'bg-[#FAFAFB] text-[#14151A]'}`}>
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] hover:text-accent transition-colors mb-8"
                >
                    <FiArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    Back to Home
                </Link>

                <div className="mb-10 sm:mb-16 relative">
                    <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accent-end/5 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-4">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                About Me
                            </span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            <div>
                                <h1 className="font-display text-[clamp(38px,6vw,68px)] font-extrabold tracking-[-0.02em] leading-[1.08]">
                                    {aboutHeading}
                                </h1>
                                <p className="font-body text-lg text-[#6B7280] dark:text-[#8A92A3] mt-4 max-w-2xl leading-[1.7]">
                                    {aboutP1}
                                </p>
                            </div>
                            <div className="flex gap-3 shrink-0 flex-wrap items-center">
                                <a
                                    href={github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-3 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark
                                        ? 'bg-[#161B22] border-[#262D3A] hover:border-accent'
                                        : 'bg-white border-[#E7E8EE] hover:border-accent'
                                        }`}
                                    aria-label="GitHub"
                                >
                                    <FiGithub className="w-5 h-5" strokeWidth={1.5} />
                                </a>
                                <a
                                    href={linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-3 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark
                                        ? 'bg-[#161B22] border-[#262D3A] hover:border-accent'
                                        : 'bg-white border-[#E7E8EE] hover:border-accent'
                                        }`}
                                    aria-label="LinkedIn"
                                >
                                    <FiLinkedin className="w-5 h-5" strokeWidth={1.5} />
                                </a>
                                <a
                                    href={`mailto:${email}`}
                                    className={`p-3 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${dark
                                        ? 'bg-[#161B22] border-[#262D3A] hover:border-accent'
                                        : 'bg-white border-[#E7E8EE] hover:border-accent'
                                        }`}
                                    aria-label="Email"
                                >
                                    <FiMail className="w-5 h-5" strokeWidth={1.5} />
                                </a>
                                {cvUrl && (
                                    <a
                                        href={cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 font-display text-sm font-semibold py-2.5 px-5 rounded-full gradient-bg text-white shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)_/_0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgb(var(--accent-rgb)_/_0.6)]"
                                    >
                                        <FiEye className="w-4 h-4" strokeWidth={1.5} />
                                        View CV
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-[24px] overflow-hidden bg-gradient-to-br from-accent to-accent-end aspect-square relative shadow-[0_30px_60px_-24px_rgb(var(--accent-rgb)_/_0.4)]">
                            <div className="absolute inset-0 stripe-pattern-45 animate-slide-slow" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="font-display text-[120px] font-extrabold text-white/90">
                                        {name.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
                            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/5" />
                        </div>

                        <div className={`rounded-[18px] border p-6 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                            }`}>
                            <h3 className="font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-4 uppercase tracking-wide">
                                Quick Info
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiUser className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Name</p>
                                        <p className="font-display text-sm font-semibold">{name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiBriefcase className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Title</p>
                                        <p className="font-display text-sm font-semibold">{title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiMapPin className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Location</p>
                                        <p className="font-display text-sm font-semibold">{location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiCalendar className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Education</p>
                                        <p className="font-display text-sm font-semibold">{education}</p>
                                    </div>
                                </div>
                                {cvUrl && (
                                    <div className="flex items-center gap-3 pt-2 border-t border-[#E7E8EE] dark:border-[#262D3A]">
                                        <div className="w-9 h-9 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                            <FiFile className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Resume</p>
                                            <a
                                                href={cvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-display text-sm font-semibold hover:text-accent transition-colors"
                                            >
                                                View CV →
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`rounded-[18px] border p-6 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                            }`}>
                            <h3 className="font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-4 uppercase tracking-wide">
                                Stats
                            </h3>
                            <div className="space-y-3">
                                {stats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">{stat.lab || 'Stat'}</span>
                                        <span className="font-display text-lg font-extrabold gradient-text">{stat.num || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <div className={`rounded-[18px] border p-6 sm:p-8 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                            }`}>
                            <h2 className="font-display text-2xl font-bold mb-4">Who Am I?</h2>
                            <div className="space-y-4">
                                <p className={`font-body text-[15px] leading-[1.8] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                                    }`}>
                                    {aboutP1}
                                </p>
                                <p className={`font-body text-[15px] leading-[1.8] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                                    }`}>
                                    {aboutP2}
                                </p>
                            </div>
                        </div>

                        <div className={`rounded-[18px] border p-6 sm:p-8 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                            }`}>
                            <h2 className="font-display text-2xl font-bold mb-4">What I Do</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border ${dark ? 'border-[#262D3A] hover:border-accent' : 'border-[#E7E8EE] hover:border-accent'
                                    } transition-all duration-300`}>
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center mb-3">
                                        <FiCode className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="font-display font-bold">Full-Stack Development</h4>
                                    <p className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                                        Building complete web applications from frontend to backend.
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl border ${dark ? 'border-[#262D3A] hover:border-accent' : 'border-[#E7E8EE] hover:border-accent'
                                    } transition-all duration-300`}>
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center mb-3">
                                        <FiGlobe className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="font-display font-bold">Real-Time Apps</h4>
                                    <p className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                                        Creating responsive, interactive applications with WebSockets.
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl border ${dark ? 'border-[#262D3A] hover:border-accent' : 'border-[#E7E8EE] hover:border-accent'
                                    } transition-all duration-300`}>
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center mb-3">
                                        <FiHeart className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="font-display font-bold">UI/UX Design</h4>
                                    <p className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                                        Designing beautiful, user-centered interfaces and experiences.
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl border ${dark ? 'border-[#262D3A] hover:border-accent' : 'border-[#E7E8EE] hover:border-accent'
                                    } transition-all duration-300`}>
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center mb-3">
                                        <FiZap className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <h4 className="font-display font-bold">Secure Systems</h4>
                                    <p className={`font-body text-sm ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                                        Building secure, scalable applications with best practices.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[18px] gradient-bg p-6 sm:p-8 overflow-hidden relative">
                            <div className="absolute inset-0 stripe-pattern-45 animate-slide-slow" />
                            <div className="relative z-10">
                                <div className="flex items-start gap-4">
                                    <FiHeart className="w-6 h-6 text-white/60 mt-1" strokeWidth={1.5} />
                                    <div>
                                        <p className="font-body text-white/90 text-lg italic leading-[1.8]">
                                            "I believe in building secure, scalable, and beautiful applications that solve real problems."
                                        </p>
                                        <p className="font-display text-white font-semibold mt-3">— {name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;