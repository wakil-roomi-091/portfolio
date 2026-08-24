// Reusable iOS-style switch. Track fills with the accent gradient when on.
const Toggle = ({ checked, onChange, label, hint }) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
                {label && (
                    <p className="font-display text-[14px] font-semibold text-[#14151A] dark:text-[#ECEEF1]">
                        {label}
                    </p>
                )}
                {hint && (
                    <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] mt-0.5">
                        {hint}
                    </p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent/30 ${checked ? 'gradient-bg' : 'bg-[#E7E8EE] dark:bg-[#262D3A]'
                    }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
};

export default Toggle;
