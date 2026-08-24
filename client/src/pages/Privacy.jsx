import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

const LAST_UPDATED = 'August 23, 2026';
const CONTACT_EMAIL = 'wakila971@gmail.com';

const sections = [
    {
        h: '1. Introduction',
        p: [
            'This Privacy Policy explains how this personal portfolio website ("the Site", "we", "us") collects, uses, and protects information when you visit the Site or get in touch. By using the Site, you agree to the practices described here.',
        ],
    },
    {
        h: '2. Information We Collect',
        p: ['We keep data collection to the minimum needed to run the Site:'],
        list: [
            'Account details — if you create an account, we store your name and email address. Your password is never stored in plain text; it is hashed with bcrypt.',
            'Contact messages — when you use the contact form, we store the name, email, subject, and message you submit so we can reply.',
            'Technical data — like most websites, our server temporarily processes basic request information (such as IP address and browser type) for security and abuse prevention.',
        ],
    },
    {
        h: '3. How We Use Your Information',
        p: ['We use the information above only to:'],
        list: [
            'Respond to your inquiries and messages.',
            'Create and secure your account and keep you signed in.',
            'Send transactional emails such as email verification and contact confirmations.',
            'Protect the Site against spam, abuse, and unauthorized access.',
        ],
    },
    {
        h: '4. We Do Not Sell Your Data',
        p: [
            'We do not sell, rent, or trade your personal information. We do not use third-party advertising networks or behavioural tracking on this Site.',
        ],
    },
    {
        h: '5. Cookies & Local Storage',
        p: [
            "The Site stores a small amount of data in your browser's local storage: an authentication token (so you stay signed in) and your theme preference (light or dark). These are required for the Site to function and are not used to track you across other websites.",
        ],
    },
    {
        h: '6. Third-Party Services',
        p: ['We rely on a few trusted providers to operate the Site. Your data may be processed by them solely to deliver their service:'],
        list: [
            'MongoDB Atlas — database hosting.',
            'Cloudinary — hosting and delivery of images and files (such as the CV).',
            'Brevo — sending transactional emails (verification and contact confirmations).',
        ],
    },
    {
        h: '7. Data Security & Retention',
        p: [
            'Data is transmitted over encrypted connections (HTTPS) and passwords are hashed. We retain your information only as long as needed for the purposes above. You can delete your account at any time from your account settings — doing so erases your personal data and anonymizes any messages you have sent.',
        ],
    },
    {
        h: '8. Your Rights',
        p: [
            'You may request access to, correction of, or deletion of your personal data. You can delete your own account directly, or contact us for help with any privacy request.',
        ],
    },
    {
        h: "9. Children's Privacy",
        p: [
            'The Site is not directed at children, and we do not knowingly collect personal information from anyone under the age of 13.',
        ],
    },
    {
        h: '10. Changes to This Policy',
        p: [
            'We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised "Last updated" date.',
        ],
    },
];

const Privacy = ({ dark }) => {
    return (
        <div className={`min-h-screen pt-24 ${dark ? 'bg-[#0E1117] text-[#ECEEF1]' : 'bg-[#FAFAFB] text-[#14151A]'}`}>
            <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] hover:text-accent transition-colors mb-8"
                >
                    <FiArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    Back to Home
                </Link>

                {/* ===== HEADER ===== */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-4">
                        <FiShield className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                            Privacy
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-0.02em]">
                        Privacy <span className="gradient-text">Policy</span>
                    </h1>
                    <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-3">
                        Last updated: {LAST_UPDATED}
                    </p>
                </div>

                {/* ===== CONTENT ===== */}
                <div className={`rounded-[18px] border p-6 sm:p-8 space-y-8 ${
                    dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                }`}>
                    {sections.map((section) => (
                        <section key={section.h}>
                            <h2 className="font-display text-lg font-bold mb-3">{section.h}</h2>
                            <div className="space-y-3">
                                {section.p?.map((para, i) => (
                                    <p
                                        key={i}
                                        className={`font-body text-[15px] leading-[1.8] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}
                                    >
                                        {para}
                                    </p>
                                ))}
                                {section.list && (
                                    <ul className="space-y-2 pl-1">
                                        {section.list.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full gradient-bg shrink-0" />
                                                <span className={`font-body text-[15px] leading-[1.8] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    ))}

                    {/* Contact */}
                    <section>
                        <h2 className="font-display text-lg font-bold mb-3">11. Contact Us</h2>
                        <p className={`font-body text-[15px] leading-[1.8] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                            If you have any questions about this Privacy Policy or your data, reach out at{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">
                                {CONTACT_EMAIL}
                            </a>
                            .
                        </p>
                    </section>
                </div>

                <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] mt-6 text-center">
                    This document is a general template for a personal portfolio website and does not constitute legal advice.
                </p>
            </div>
        </div>
    );
};

export default Privacy;
