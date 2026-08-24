import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose, duration = 2800 }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <FiCheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <FiXCircle className="w-5 h-5 text-red-400" />,
    };

    return (
        <div className="fixed bottom-6 right-6 z-[300] animate-popIn">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#14151A] text-white border border-white/10 shadow-2xl">
                {icons[type] || icons.success}
                <span className="font-body text-sm font-medium">{message}</span>
            </div>
        </div>
    );
};

export default Toast;