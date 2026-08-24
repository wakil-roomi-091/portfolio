import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiShield, FiTrash2, FiAlertTriangle, FiCheckCircle, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/admin/ConfirmDialog';

const Row = ({ icon: Icon, label, value, badge }) => (
    <div className="flex items-start gap-3 py-3 border-b border-[#E7E8EE] dark:border-[#262D3A] last:border-0">
        <Icon className="w-4 h-4 mt-0.5 text-[#6B7280] dark:text-[#8A92A3] shrink-0" strokeWidth={1.5} />
        <div>
            <p className="font-body text-xs uppercase tracking-wide text-[#6B7280] dark:text-[#8A92A3]">
                {label}
            </p>
            <p className="font-body text-sm mt-0.5 break-all flex items-center gap-2 flex-wrap">
                {value || '—'}
                {badge}
            </p>
        </div>
    </div>
);

const Account = () => {
    const { user, loading, deleteAccount, resendVerification } = useAuth();
    const navigate = useNavigate();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [resending, setResending] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        const result = await deleteAccount();
        setDeleting(false);
        setConfirmOpen(false);

        if (result.success) {
            toast.success(result.message || 'Your account has been deleted');
            navigate('/');
        } else {
            toast.error(result.message);
        }
    };

    const handleResend = async () => {
        setResending(true);
        const result = await resendVerification();
        setResending(false);

        if (result.success) {
            toast.success(result.message || 'Verification email sent');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <main className="max-w-[720px] mx-auto px-5 sm:px-8 pt-32 pb-24">
            <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em]">
                Your account
            </h1>
            <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-2">
                Everything this site stores about you.
            </p>

            {loading ? (
                <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-10">
                    Loading…
                </p>
            ) : !user ? (
                <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-10">
                    You are not signed in.
                </p>
            ) : (
                <>
                    <section className="mt-8 bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                        <h2 className="font-display text-lg font-bold mb-2">Stored data</h2>
                        <Row icon={FiUser} label="Name" value={user.name} />
                        <Row
                            icon={FiMail}
                            label="Email"
                            value={user.email}
                            badge={
                                user.emailVerified ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                        <FiCheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        Confirmed
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                                        <FiAlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        Not confirmed
                                    </span>
                                )
                            }
                        />
                        <Row icon={FiShield} label="Role" value={user.role} />
                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] mt-4">
                            Your password is stored only as a bcrypt hash and is never
                            readable — not by this site, and not by anyone with access to
                            the database.
                        </p>
                    </section>

                    {!user.emailVerified && (
                        <section className="mt-6 border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 rounded-[18px] p-6">
                            <h2 className="font-display text-lg font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                <FiAlertTriangle className="w-4 h-4" strokeWidth={1.5} />
                                Confirm your email
                            </h2>
                            <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-2">
                                You can use the site normally, but until this address is
                                confirmed we won't email you — including the receipt for a
                                contact-form message. Confirmation links expire after 24
                                hours.
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="mt-4 inline-flex items-center gap-2 font-display text-[13px] font-semibold px-5 py-2.5 rounded-full bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors duration-200"
                            >
                                <FiSend className="w-3.5 h-3.5" strokeWidth={1.5} />
                                {resending ? 'Sending…' : 'Send me a new link'}
                            </button>
                        </section>
                    )}

                    <section className="mt-6 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-[18px] p-6">
                        <h2 className="font-display text-lg font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
                            <FiAlertTriangle className="w-4 h-4" strokeWidth={1.5} />
                            Delete account
                        </h2>
                        <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-2">
                            This removes your account and your name, email and password hash
                            for good. Any message you sent through the contact form is kept,
                            but stripped of your name and address so it can no longer be
                            traced back to you. This cannot be undone.
                        </p>
                        <button
                            onClick={() => setConfirmOpen(true)}
                            className="mt-4 inline-flex items-center gap-2 font-display text-[13px] font-semibold px-5 py-2.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                        >
                            <FiTrash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                            Delete my account
                        </button>
                    </section>
                </>
            )}

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                isLoading={deleting}
                title="Delete your account?"
                message="Your account, name and email will be permanently erased, and your contact messages will be anonymized. This cannot be undone."
            />
        </main>
    );
};

export default Account;
