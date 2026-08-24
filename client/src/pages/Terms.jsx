import { Link } from 'react-router-dom';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';

const LAST_UPDATED = 'August 23, 2026';
const CONTACT_EMAIL = 'wakila971@gmail.com';

const sections = [
    {
        h: '1. Acceptance of Terms',
        p: [
            'These Terms of Service ("Terms") govern your access to and use of this personal portfolio website ("the Site"). By visiting the Site or creating an account, you agree to these Terms. If you do not agree, please do not use the Site.',
        ],
    },
    {
        h: '2. Use of the Site',
        p: [
            'The Site is provided for personal and informational purposes — to showcase projects, skills, and background, and to let visitors get in touch. You agree to use the contact form only for genuine inquiries.',
        ],
    },
    {
        h: '3. Accounts',
        p: ['If you create an account, you agree to:'],
        list: [
            'Provide accurate information and keep your credentials secure.',
            'Be responsible for activity that occurs under your account.',
            'Verify your email address where requested so we can confirm you own it.',
        ],
    },
    {
        h: '4. Acceptable Use',
        p: ['When using the Site, you agree not to:'],
        list: [
            'Send spam, harassing, unlawful, or deceptive content through the contact form.',
            'Attempt to gain unauthorized access to accounts, data, or the underlying systems.',
            'Probe, scan, or test the vulnerability of the Site, or disrupt its normal operation.',
            'Scrape or harvest content or data using automated means without permission.',
        ],
    },
    {
        h: '5. Intellectual Property',
        p: [
            'Unless otherwise stated, the content, design, code, and projects presented on this Site are the property of the Site owner. You may not copy, reproduce, or reuse them for commercial purposes without prior written permission. Third-party names and logos remain the property of their respective owners.',
        ],
    },
    {
        h: '6. Third-Party Links',
        p: [
            'The Site may link to external websites (such as GitHub, LinkedIn, or project demos) that we do not control. We are not responsible for the content, policies, or practices of those third-party sites.',
        ],
    },
    {
        h: '7. Disclaimer',
        p: [
            'The Site is provided on an "as is" and "as available" basis, without warranties of any kind, whether express or implied. We do not guarantee that the Site will be uninterrupted, error-free, or secure at all times.',
        ],
    },
    {
        h: '8. Limitation of Liability',
        p: [
            'To the fullest extent permitted by law, the Site owner shall not be liable for any indirect, incidental, or consequential damages arising from your use of, or inability to use, the Site.',
        ],
    },
    {
        h: '9. Changes to These Terms',
        p: [
            'We may update these Terms from time to time. Continued use of the Site after changes are posted constitutes acceptance of the revised Terms. The "Last updated" date above reflects the latest revision.',
        ],
    },
    {
        h: '10. Governing Law',
        p: [
            'These Terms are governed by and construed in accordance with the laws of Pakistan, without regard to its conflict-of-law provisions.',
        ],
    },
];

const Terms = ({ dark }) => {
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
                        <FiFileText className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                            Terms
                        </span>
                    </div>
                    <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-0.02em]">
                        Terms of <span className="gradient-text">Service</span>
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
                        <h2 className="font-display text-lg font-bold mb-3">11. Contact</h2>
                        <p className={`font-body text-[15px] leading-[1.8] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'}`}>
                            Questions about these Terms? Contact{' '}
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

export default Terms;
