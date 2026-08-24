import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiArrowLeft, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const Contact = ({ dark }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
            setSubmitted(true);
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

    if (submitted) {
        return (
            <div className={`min-h-screen pt-24 ${dark ? 'bg-[#0E1117] text-[#ECEEF1]' : 'bg-[#FAFAFB] text-[#14151A]'}`}>
                <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mb-6">
                        <FiCheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h2 className="font-display text-3xl font-extrabold text-center">Message Sent!</h2>
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3] text-center max-w-md mt-2">
                        Thank you for reaching out. I'll get back to you as soon as possible.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="mt-6 inline-flex items-center gap-2 font-display text-[14px] font-semibold py-3 px-6 rounded-full gradient-bg text-white transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <FiSend className="w-4 h-4" strokeWidth={1.5} />
                        Send Another Message
                    </button>
                </div>
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

                {/* ===== PAGE HEADER ===== */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-3">
                        <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                        <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                            Get in Touch
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-0.02em]">
                        Let's <span className="gradient-text">Connect</span>
                    </h1>
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-3 max-w-2xl text-lg leading-[1.7]">
                        Have a project in mind or want to collaborate? I'd love to hear from you.
                        Fill out the form and I'll get back to you within 24 hours.
                    </p>
                </div>

                {/* ===== TWO COLUMN LAYOUT ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ===== CONTACT INFO ===== */}
                    <div className="space-y-4">
                        <div className={`rounded-[18px] border p-6 ${
                            dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                        }`}>
                            <h3 className="font-display text-lg font-bold mb-4">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiMail className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Email</p>
                                        <a href="mailto:wakila971@gmail.com" className="font-display text-sm font-semibold hover:text-accent transition-colors">
                                            wakila971@gmail.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiPhone className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Phone</p>
                                        <a href="tel:03299951220" className="font-display text-sm font-semibold hover:text-accent transition-colors">
                                            0329 9951220
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiMapPin className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Location</p>
                                        <p className="font-display text-sm font-semibold">Peshawar, Pakistan</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                        <FiClock className="w-5 h-5 text-accent" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Response Time</p>
                                        <p className="font-display text-sm font-semibold">Within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===== AVAILABILITY ===== */}
                        <div className={`rounded-[18px] border p-6 ${
                            dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                        }`}>
                            <h3 className="font-display text-sm font-bold mb-2">Availability</h3>
                            <p className={`font-body text-sm ${
                                dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                            }`}>
                                Open to internships, freelance projects, and interesting collaborations.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-body text-xs text-green-500">Available for work</span>
                            </div>
                        </div>
                    </div>

                    {/* ===== CONTACT FORM ===== */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className={`rounded-[18px] border p-6 ${
                            dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                        }`}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-1">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-[#FAFAFB] dark:bg-[#0E1117] focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-[#FAFAFB] dark:bg-[#0E1117] focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-[#FAFAFB] dark:bg-[#0E1117] focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all"
                                        placeholder="What's this about?"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows="5"
                                        className="w-full px-4 py-2.5 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-[#FAFAFB] dark:bg-[#0E1117] focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all resize-y"
                                        placeholder="Tell me about your project..."
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full inline-flex items-center justify-center gap-2 font-display text-[14.5px] font-semibold py-3.5 px-7 rounded-full gradient-bg text-white shadow-[0_10px_26px_-10px_rgb(var(--accent-rgb)_/_0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-10px_rgb(var(--accent-rgb)_/_0.6)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <FiSend className="w-4 h-4" strokeWidth={2} />
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                                {!user ? (
                                    <p className="font-body text-xs text-center text-[#6B7280] dark:text-[#8A92A3]">
                                        You'll be asked to log in before your message is sent.
                                    </p>
                                ) : (
                                    <p className="font-body text-xs text-center text-[#6B7280] dark:text-[#8A92A3]">
                                        The address above is passed on as your reply-to. Your
                                        confirmation email goes to your account address, once
                                        that address has been confirmed.
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;