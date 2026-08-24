import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

// Primary Button
export const PrimaryButton = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 font-display text-[14.5px] font-semibold py-[15px] px-7 rounded-full gradient-bg text-white shadow-[0_10px_26px_-10px_rgb(var(--accent-rgb)_/_0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-10px_rgb(var(--accent-rgb)_/_0.6)] ${className}`}
    >
      {children}
    </button>
  );
};

// Ghost Button
export const GhostButton = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 font-display text-[14.5px] font-semibold py-[15px] px-7 rounded-full border-[1.5px] border-[#E7E8EE] dark:border-[#262D3A] bg-white dark:bg-[#161B22] text-[#14151A] dark:text-[#ECEEF1] transition-all duration-300 hover:border-accent hover:-translate-y-1 ${className}`}
    >
      {children}
    </button>
  );
};

// Danger Button
export const DangerButton = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 font-display text-[14.5px] font-semibold py-[15px] px-7 rounded-full bg-[#EF4444] text-white shadow-[0_10px_26px_-10px_rgba(239,68,68,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-10px_rgba(239,68,68,0.6)] ${className}`}
    >
      {children}
    </button>
  );
};

// Icon Button
export const IconButton = ({ icon: Icon, onClick, variant = 'default', className = '' }) => {
  const variants = {
    default: 'hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] text-[#6B7280] dark:text-[#8A92A3]',
    accent: 'hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] text-accent',
    danger: 'hover:bg-red-50 dark:hover:bg-red-900/20 text-[#EF4444]',
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors duration-200 ${variants[variant] || variants.default} ${className}`}
    >
      <Icon className="w-4 h-4" strokeWidth={1.5} />
    </button>
  );
};