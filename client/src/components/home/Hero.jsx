import { useEffect, useRef, useState } from 'react';
import { FiArrowRight, FiStar, FiZap, FiLock, FiLayout } from 'react-icons/fi';
import api from '../../services/api';
import logError from '../../utils/logError';

const Hero = ({ dark }) => {
    const sectionRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [imgError, setImgError] = useState(false);

    // Fetch profile data in the background. The hero renders immediately with
    // hardcoded fallbacks (see below) and re-renders when this resolves — the
    // <h1> (the LCP element on mobile) must never wait on the network.
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile');
                setProfile(res.data);
            } catch (error) {
                logError('home/hero-profile', error);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.scroll-reveal').forEach((el) => {
                            el.classList.add('visible');
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
            sectionRef.current.querySelectorAll('.scroll-reveal').forEach((el) => {
                el.classList.add('visible');
            });
        }

        return () => observer.disconnect();
    }, []);

    const name = profile?.name || 'Roomi';
    const location = profile?.location || 'Peshawar, Pakistan';
    const aboutP1 = profile?.aboutP1 || "I specialize in building fast, real-time web applications using the MERN stack. Clean UI, secure backend, and seamless UX.";
    const profileImage = profile?.profileImage || null;

    const stats = profile?.stats || [
        { num: '4+', lab: 'Full-stack projects' },
        { num: 'MERN', lab: 'Core stack' },
        { num: 'Peshawar', lab: 'CS Student' },
    ];
    const heroStats = stats.slice(0, 3);

    return (
        <section
            ref={sectionRef}
            id="hero"
            className="min-h-0 lg:min-h-screen flex items-center pt-12 sm:pt-[120px] lg:pt-[120px] pb-10 sm:pb-24 lg:pb-24 relative overflow-hidden"
        >
            {/* Dot Grid Background */}
            <div
                className={`fixed inset-0 z-0 pointer-events-none dots-bg ${dark ? 'text-[#232938]' : 'text-[#D9DBE4]'
                    }`}
                style={{
                    maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 55%)',
                    WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 55%)',
                }}
            />

            {/* Gradient Blobs */}
            <div
                className={`absolute top-[-180px] right-[-140px] w-[480px] h-[480px] rounded-full bg-gradient-to-br from-accent to-accent-end blur-[80px] ${dark ? 'opacity-22' : 'opacity-35'
                    } animate-float pointer-events-none`}
            />
            <div
                className={`absolute top-[420px] left-[-160px] w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#F472B6] to-accent blur-[80px] ${dark ? 'opacity-22' : 'opacity-35'
                    } animate-float [animation-delay:4s] pointer-events-none`}
            />

            <div className="max-w-[1200px] mx-auto px-8 w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 xl:gap-16 items-center">
                    {/* Left Column */}
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-5">
                        {/* Mobile Avatar (Visible only on < lg) */}
                        <div className="lg:hidden mb-5 sm:mb-2">
                            <div className="w-[180px] h-[180px] sm:w-36 sm:h-36 rounded-full p-1 gradient-bg shadow-[0_14px_34px_-8px_rgb(var(--accent-rgb)_/_0.5)] sm:shadow-[0_12px_30px_-8px_rgb(var(--accent-rgb)_/_0.5)]">
                                <div className="w-full h-full rounded-full overflow-hidden relative bg-gradient-to-br from-accent to-accent-end">
                                    {profileImage && !imgError ? (
                                        <img
                                            src={profileImage}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 stripe-pattern animate-slide" />
                                            <div className="relative z-10 flex items-center justify-center h-full">
                                                <span className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                                                    {name.charAt(0)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[6px] px-3.5 sm:py-[7px] sm:pr-4 sm:pl-2.5 max-w-full">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                Open for internships &amp; freelance
                            </span>
                        </div>

                        {/* H1 */}
                        <h1 className="font-display text-[clamp(30px,5.5vw,68px)] font-extrabold tracking-[-0.02em] leading-[1.1]">
                            Hi, I'm {name} —
                            <br />
                            I design &amp; build
                            <br />
                            <span className="gradient-text">full-stack products.</span>
                        </h1>

                        {/* Lede */}
                        <p className="font-body text-[14.5px] sm:text-[16px] text-[#4B5563] dark:text-[#9DA6B8] max-w-[420px] sm:max-w-[460px] leading-[1.6]">
                            {aboutP1}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                            <a
                                href="#work"
                                className="inline-flex items-center gap-2.5 font-display text-[14px] font-semibold py-[12px] px-5 sm:py-[14px] sm:px-6 rounded-full gradient-bg text-white shadow-[0_10px_26px_-10px_rgb(var(--accent-rgb)_/_0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-10px_rgb(var(--accent-rgb)_/_0.6)]"
                            >
                                View my work
                                <FiArrowRight className="w-4 h-4" strokeWidth={2} />
                            </a>
                            <a
                                href="#contact"
                                className={`inline-flex items-center gap-2.5 font-display text-[14px] font-semibold py-[12px] px-5 sm:py-[14px] sm:px-6 rounded-full border-[1.5px] ${dark ? 'border-[#262D3A] bg-[#161B22] text-[#ECEEF1]' : 'border-[#E7E8EE] bg-[#FFFFFF] text-[#14151A]'
                                    } transition-all duration-300 hover:border-accent hover:-translate-y-1`}
                            >
                                Get in touch
                                <FiStar className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                        </div>

                        {/* Meta Stats */}
                        <div className="w-full grid grid-cols-3 gap-2 sm:gap-6 pt-3 sm:pt-4 lg:flex lg:flex-wrap lg:gap-8 lg:pt-3">
                            {heroStats.map((stat, index) => (
                                <div key={index} className="flex flex-col gap-0.5 min-w-0 text-center lg:text-left">
                                    <span className="font-display text-[20px] sm:text-[24px] lg:text-[26px] font-extrabold leading-tight">
                                        {stat.num || '—'}
                                    </span>
                                    <span className="font-body text-[12px] text-[#6B7280] dark:text-[#8A92A3]">
                                        {stat.lab || ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Visual */}
                    <div className="hidden lg:block relative min-h-[440px]">
                        {/* Profile Image Card */}
                        <div className="absolute top-[10px] right-[0px] w-[340px] h-[420px] rounded-[28px] overflow-hidden shadow-[0_30px_60px_-20px_rgb(var(--accent-rgb)_/_0.45)] bg-gradient-to-br from-accent to-accent-end">
                            {profileImage && !imgError ? (
                                <img
                                    src={profileImage}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 stripe-pattern animate-slide" />
                                    <div className="relative z-10 flex items-center justify-center h-full">
                                        <span className="font-display text-[110px] font-extrabold text-white/95">
                                            {name.charAt(0)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Floating Cards */}
                        <div className="absolute top-[0px] left-[-20px] animate-floaty">
                            <div className={`px-[16px] py-[12px] rounded-[14px] flex items-center gap-2 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-[#FFFFFF] border-[#E7E8EE]'
                                } border shadow-[0_14px_30px_-12px_rgba(0,0,0,0.12)] text-sm`}>
                                <FiZap className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                <span className="font-display text-[13px] font-semibold">Real-time apps</span>
                            </div>
                        </div>

                        <div className="absolute bottom-[100px] right-[180px] animate-floaty-delay-1">
                            <div className={`px-[16px] py-[12px] rounded-[14px] flex items-center gap-2 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-[#FFFFFF] border-[#E7E8EE]'
                                } border shadow-[0_14px_30px_-12px_rgba(0,0,0,0.12)] text-sm`}>
                                <FiLock className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                <span className="font-display text-[13px] font-semibold">Secure by design</span>
                            </div>
                        </div>

                        <div className="absolute bottom-[20px] left-[10px] animate-floaty-delay-2">
                            <div className={`px-[16px] py-[12px] rounded-[14px] flex items-center gap-2 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-[#FFFFFF] border-[#E7E8EE]'
                                } border shadow-[0_14px_30px_-12px_rgba(0,0,0,0.12)] text-sm`}>
                                <FiLayout className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                <span className="font-display text-[13px] font-semibold">UI/UX focused</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;