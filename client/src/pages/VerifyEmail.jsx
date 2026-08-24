import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logError from '../utils/logError';

// Landing page for the link in the confirmation email:
//   /verify-email?token=<raw token>
const VerifyEmail = () => {
    const [params] = useSearchParams();
    const { user, refreshUser } = useAuth();
    const [status, setStatus] = useState('verifying'); // verifying | ok | failed
    const [message, setMessage] = useState('');

    // The token is single-use, so the request must fire exactly once. In dev,
    // StrictMode runs effects twice — without this guard the second attempt
    // would consume-then-fail and show an error for a successful confirmation.
    const attempted = useRef(false);

    useEffect(() => {
        if (attempted.current) return;
        attempted.current = true;

        const token = params.get('token');
        if (!token) {
            setStatus('failed');
            setMessage('This link is missing its confirmation token.');
            return;
        }

        (async () => {
            try {
                const res = await api.post('/auth/verify-email', { token });
                setStatus('ok');
                setMessage(res.data?.message || 'Your email address has been confirmed');

                // `user` is React state, so pull the new emailVerified flag down
                // if this browser is signed in.
                if (localStorage.getItem('authToken')) {
                    await refreshUser();
                }
            } catch (error) {
                logError('auth/verify-email', error);
                setStatus('failed');
                setMessage(
                    error.response?.data?.message ||
                    'This link is invalid or has expired.'
                );
            }
        })();
        // Runs once on mount; the ref above is the real guard.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const icon = {
        verifying: <FiLoader className="w-7 h-7 text-accent animate-spin" strokeWidth={1.5} />,
        ok: <FiCheckCircle className="w-7 h-7 text-green-500" strokeWidth={1.5} />,
        failed: <FiXCircle className="w-7 h-7 text-red-500" strokeWidth={1.5} />,
    }[status];

    const heading = {
        verifying: 'Confirming your email…',
        ok: 'Email confirmed',
        failed: "We couldn't confirm this link",
    }[status];

    return (
        <main className="max-w-[560px] mx-auto px-5 sm:px-8 pt-32 pb-24">
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-8 text-center">
                <div className="flex justify-center mb-4">{icon}</div>

                <h1 className="font-display text-[24px] font-extrabold tracking-[-0.01em]">
                    {heading}
                </h1>

                {status !== 'verifying' && (
                    <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-3">
                        {message}
                    </p>
                )}

                {status === 'failed' && (
                    <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] mt-3">
                        Links expire after 24 hours and can only be used once. You can
                        request a fresh one from your account page.
                    </p>
                )}

                {status !== 'verifying' && (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="font-display text-[13px] font-semibold px-5 py-2.5 rounded-full border border-[#E7E8EE] dark:border-[#262D3A] text-[#6B7280] dark:text-[#8A92A3] hover:border-accent transition-colors duration-200"
                        >
                            Back to home
                        </Link>
                        {user && (
                            <Link
                                to="/account"
                                className="font-display text-[13px] font-semibold px-5 py-2.5 rounded-full gradient-bg text-white transition-all duration-300 hover:-translate-y-0.5"
                            >
                                Your account
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default VerifyEmail;
