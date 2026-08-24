const StatCard = ({ label, value, icon: Icon, delta, deltaLabel = 'vs last month', className = '' }) => {
    const isPositive = delta && delta > 0;
    const isNegative = delta && delta < 0;

    return (
        <div className={`bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6 ${className}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3]">{label}</p>
                    <p className="font-display text-[32px] font-extrabold mt-1">{value}</p>
                    {delta !== undefined && (
                        <p className="font-body text-sm mt-1">
                            <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-500' : 'text-[#6B7280]'}>
                                {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(delta)}%
                            </span>
                            <span className="text-[#6B7280] dark:text-[#8A92A3] font-normal ml-1">{deltaLabel}</span>
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="w-11 h-11 rounded-xl gradient-soft flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;