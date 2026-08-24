import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import logError from '../../utils/logError';

const About = ({ dark }) => {
    const sectionRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile');
                setProfile(res.data);
            } catch (error) {
                logError('home/about-profile', error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!loading && sectionRef.current) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.querySelectorAll('.scroll-reveal').forEach((el, i) => {
                                setTimeout(() => {
                                    el.classList.add('visible');
                                }, i * 150);
                            });
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.15 }
            );

            observer.observe(sectionRef.current);
            return () => observer.disconnect();
        }
    }, [loading]);

    // Show loading state
    if (loading) {
        return (
            <section
                id="about"
                className={`py-[120px] ${dark ? 'bg-[#1B2230]' : 'bg-[#F2F3F7]'}`}
            >
                <div className="max-w-[1200px] mx-auto px-8 text-center">
                    <p className="font-body text-[#6B7280]">Loading about...</p>
                </div>
            </section>
        );
    }

    // Fallback data if profile is null or error
    const fallbackData = {
        name: 'Roomi',
        aboutHeading: 'From Peshawar, building for the world.',
        aboutP1: "I'm a passionate full-stack developer based in Peshawar, Pakistan, currently pursuing my Computer Science degree at UET Peshawar. Originally from the beautiful valleys of Chitral, I bring a unique perspective to every project I build.",
        aboutP2: "I specialize in the MERN stack, with a growing interest in cybersecurity and AI integration. I believe in building secure, scalable, and beautiful applications that solve real problems.",
        stats: [
            { num: '4+', lab: 'Projects designed' },
            { num: '2+', lab: 'Years learning to build' },
            { num: '100%', lab: 'Self-driven projects' },
        ],
        profileImage: null,
    };

    const data = profile || fallbackData;
    const name = data.name || fallbackData.name;
    const aboutHeading = data.aboutHeading || fallbackData.aboutHeading;
    const aboutP1 = data.aboutP1 || fallbackData.aboutP1;
    const aboutP2 = data.aboutP2 || fallbackData.aboutP2;
    const stats = data.stats && data.stats.length > 0 ? data.stats : fallbackData.stats;
    const profileImage = data.profileImage || null;

    return (
        <section
            ref={sectionRef}
            id="about"
            className={`py-16 sm:py-24 lg:py-[120px] ${dark ? 'bg-[#1B2230]' : 'bg-[#F2F3F7]'}`}
        >
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
                    {/* Left - Photo */}
                    <div className="scroll-reveal">
                        <div className="aspect-square max-w-[340px] mx-auto lg:max-w-full rounded-[24px] shadow-[0_30px_60px_-24px_rgb(var(--accent-rgb)_/_0.4)] overflow-hidden relative bg-gradient-to-br from-accent to-accent-end">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Log the failure, not the URL — it points at a photo of a person.
                                        console.error('Profile image failed to load');
                                        e.target.style.display = 'none';
                                        // Build the fallback with the DOM API instead of innerHTML: the
                                        // initial is set via textContent, so a profile name can never be
                                        // parsed as HTML here (no injection sink), whatever it contains.
                                        const parent = e.target.parentElement;
                                        const fallback = document.createElement('div');
                                        fallback.className = 'absolute inset-0 flex items-center justify-center';

                                        const stripe = document.createElement('div');
                                        stripe.className = 'absolute inset-0 stripe-pattern-45 animate-slide-slow';

                                        const initial = document.createElement('span');
                                        initial.className = 'relative z-10 font-display text-[96px] font-extrabold text-white/95';
                                        initial.textContent = name.charAt(0);

                                        fallback.appendChild(stripe);
                                        fallback.appendChild(initial);
                                        parent.appendChild(fallback);
                                    }}
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 stripe-pattern-45 animate-slide-slow" />
                                    <div className="relative z-10 flex items-center justify-center h-full">
                                        <span className="font-display text-[96px] font-extrabold text-white/95">
                                            {name.charAt(0)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right - Content */}
                    <div className="space-y-6">
                        {/* Eyebrow */}
                        <div className="scroll-reveal">
                            <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5">
                                <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                                <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                    About Me
                                </span>
                            </div>
                        </div>

                        {/* H2 */}
                        <h2 className="scroll-reveal font-display text-[clamp(30px,3.8vw,42px)] font-extrabold tracking-[-0.015em]">
                            {aboutHeading}
                        </h2>

                        {/* Paragraph 1 */}
                        <p className="scroll-reveal font-body text-base leading-[1.65] text-[#6B7280]">
                            {aboutP1}
                        </p>

                        {/* Paragraph 2 */}
                        <p className="scroll-reveal font-body text-base leading-[1.65] text-[#6B7280]">
                            {aboutP2}
                        </p>

                        {/* Stats */}
                        <div className="scroll-reveal grid grid-cols-3 gap-3 sm:gap-4 mt-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`rounded-[14px] border p-4 sm:p-5 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-[#FFFFFF] border-[#E7E8EE]'
                                        }`}
                                >
                                    <span className="font-display text-[22px] sm:text-[28px] font-extrabold">{stat.num || '—'}</span>
                                    <p className="font-body text-[12.5px] text-[#6B7280] mt-1">{stat.lab || ''}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;