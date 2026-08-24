import { useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Contact = ({ dark }) => {
    const sectionRef = useRef(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

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
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: prev.name || user.name || '',
                email: prev.email || user.email || '',
            }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Contacting requires an account; send them to log in, then back here.
        if (!user) {
            toast.error('Please log in to send a message.');
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        setLoading(true);
        try {
            await api.post('/messages', formData);
            toast.success('Message sent successfully!');
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                subject: '',
                message: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            ref={sectionRef}
            id="contact"
            className="py-16 sm:py-24 lg:py-[120px] max-w-[1200px] mx-auto px-5 sm:px-8"
        >
            <div className="rounded-[28px] gradient-bg px-7 py-[60px] md:px-[60px] md:py-20 text-center overflow-hidden relative">
                <div className="absolute inset-0 stripe-pattern-45 animate-slide-slow" />

                <div className="relative z-10">
                    <h2 className="scroll-reveal font-display text-[clamp(36px,6vw,64px)] font-extrabold tracking-[-0.02em] text-white">
                        Let's build something great.
                    </h2>
                    <p className="scroll-reveal font-body text-white/90 max-w-[480px] mx-auto mt-4 mb-9">
                        Open to internships, freelance projects, and interesting collaborations. Let's connect and create something amazing together.
                    </p>

                    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/20 focus:border-white/50 focus:outline-none transition-colors"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/20 focus:border-white/50 focus:outline-none transition-colors"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Subject"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/20 focus:border-white/50 focus:outline-none transition-colors"
                            required
                        />
                        <textarea
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows="4"
                            className="w-full px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 border border-white/20 focus:border-white/50 focus:outline-none transition-colors resize-none"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2.5 font-display text-[14.5px] font-semibold py-[15px] px-7 rounded-full bg-white text-accent shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
                        >
                            <FiSend className="w-4 h-4" strokeWidth={2} />
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                        {!user ? (
                            <p className="font-body text-xs text-white/80">
                                You'll be asked to log in before your message is sent.
                            </p>
                        ) : (
                            <p className="font-body text-xs text-white/80">
                                The address above is passed on as your reply-to. Your
                                confirmation email goes to your account address, once that
                                address has been confirmed.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
