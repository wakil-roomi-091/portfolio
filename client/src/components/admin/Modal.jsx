import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { GhostButton, PrimaryButton, DangerButton } from './Button';

const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmLabel = 'Save', isDanger = false, isLoading = false }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
            onClick={handleOverlayClick}
        >
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] shadow-2xl w-full max-w-2xl max-h-[90vh] animate-popIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E8EE] dark:border-[#262D3A]">
                    <h2 className="font-display text-[18px] font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] transition-colors"
                    >
                        <FiX className="w-5 h-5 text-[#6B7280] dark:text-[#8A92A3]" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(70vh-120px)]">
                    {children}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E7E8EE] dark:border-[#262D3A]">
                    <GhostButton onClick={onClose}>Cancel</GhostButton>
                    {isDanger ? (
                        <DangerButton onClick={onConfirm} disabled={isLoading}>
                            {isLoading ? 'Deleting...' : confirmLabel}
                        </DangerButton>
                    ) : (
                        <PrimaryButton onClick={onConfirm} disabled={isLoading}>
                            {isLoading ? 'Saving...' : confirmLabel}
                        </PrimaryButton>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;