const Badge = ({ children, tone = 'accent', className = '' }) => {
    const tones = {
        accent: 'bg-accent/10 text-accent dark:bg-accent/20',
        green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        gray: 'bg-[#F2F3F7] text-[#6B7280] dark:bg-[#1B2230] dark:text-[#8A92A3]',
        pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    };

    return (
        <span className={`inline-block rounded-full px-2.5 py-1 font-display text-[11px] font-semibold tracking-wide ${tones[tone] || tones.accent} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;