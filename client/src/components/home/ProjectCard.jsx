import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiLink, FiLock, FiGithub, FiEye } from 'react-icons/fi';
import ProtectedContent from '../common/ProtectedContent';
import toExternalUrl from '../../utils/externalUrl';

const ProjectCard = ({ project, dark, index }) => {
    const navigate = useNavigate();

    const coverColors = {
        'cover-1': 'from-accent to-accent-end',
        'cover-2': 'from-[#F472B6] to-[#8B5CF6]',
        'cover-3': 'from-accent-end to-[#34D399]',
        'cover-4': 'from-[#6366F1] to-[#14B8A6]',
    };

    const handleCardClick = (e) => {
        if (e.target.closest('a') || e.target.closest('button')) return;
        navigate(`/project/${project._id}`);
    };

    return (
        <div className="group cursor-pointer" onClick={handleCardClick}>
            <div
                className={`rounded-[18px] overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.2)] hover:border-transparent ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-[#FFFFFF] border-[#E7E8EE]'
                    }`}
            >
                {/* ===== COVER IMAGE ===== */}
                <div className="h-[220px] relative overflow-hidden bg-[#F2F3F7] dark:bg-[#1B2230]">
                    {project.image ? (
                        <div
                            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url(${project.image})` }}
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-r ${coverColors[project.cover] || 'from-accent to-accent-end'
                            } flex items-center justify-center`}>
                            <div className="absolute inset-0 stripe-pattern animate-slide" />
                            <span className="relative z-10 font-display text-[42px] font-extrabold text-white/92 tracking-[-0.02em]">
                                {project.title.split(' ').map(word => word[0]).join('')}
                            </span>
                        </div>
                    )}

                    {/* ===== VIEW DETAILS OVERLAY ===== */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/95 text-[#14151A] font-display text-sm font-semibold shadow-lg">
                            <FiEye className="w-4 h-4" strokeWidth={1.5} />
                            View Details
                        </span>
                    </div>
                </div>

                {/* ===== CARD BODY ===== */}
                <div className="p-6 flex flex-col gap-3.5">
                    {/* ===== TOP ROW ===== */}
                    <div className="flex items-center justify-between">
                        <span className="font-display text-[11.5px] font-bold tracking-[0.1em] uppercase text-accent">
                            {project.tag || 'Project'}
                        </span>
                        <div className="flex items-center gap-2">
                            {project.demo && (
                                <a
                                    href={toExternalUrl(project.demo)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className={`p-2 rounded-lg transition-all duration-200 ${dark ? 'hover:bg-[#262D3A]' : 'hover:bg-[#F2F3F7]'
                                        }`}
                                    aria-label="Live demo"
                                    title="Live Demo"
                                >
                                    <FiLink className={`w-4 h-4 ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                                        } hover:text-accent transition-colors duration-200`} strokeWidth={1.5} />
                                </a>
                            )}

                            {project.github && (
                                <ProtectedContent
                                    fallback={
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = '/login';
                                            }}
                                            className={`p-2 rounded-lg transition-all duration-200 ${dark ? 'hover:bg-[#262D3A]' : 'hover:bg-[#F2F3F7]'
                                                }`}
                                            aria-label="Login to view GitHub"
                                            title="Login to view GitHub"
                                        >
                                            <FiLock className={`w-4 h-4 ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                                                } hover:text-accent transition-colors duration-200`} strokeWidth={1.5} />
                                        </button>
                                    }
                                >
                                    <a
                                        href={toExternalUrl(project.github)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`p-2 rounded-lg transition-all duration-200 ${dark ? 'hover:bg-[#262D3A]' : 'hover:bg-[#F2F3F7]'
                                            }`}
                                        aria-label="GitHub repository"
                                        title="GitHub Repository"
                                    >
                                        <FiGithub className={`w-4 h-4 ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                                            } hover:text-accent transition-colors duration-200`} strokeWidth={1.5} />
                                    </a>
                                </ProtectedContent>
                            )}

                            <FiArrowUpRight className={`w-5 h-5 ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                                } transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent`} strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* ===== TITLE ===== */}
                    <h3 className="font-display text-xl font-bold leading-tight">
                        {project.title}
                    </h3>

                    {/* ===== DESCRIPTION ===== */}
                    <p className={`font-body text-[14px] leading-[1.6] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                        } line-clamp-2 flex-1`}>
                        {project.description}
                    </p>

                    {/* ===== TECH STACK ===== */}
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-[#E7E8EE] dark:border-[#262D3A]">
                        {project.stack?.slice(0, 4).map((tech) => (
                            <span
                                key={tech}
                                className={`font-display text-[10px] font-semibold px-2.5 py-1 rounded-full ${dark ? 'bg-[#1B2230] text-[#8A92A3]' : 'bg-[#F2F3F7] text-[#6B7280]'
                                    }`}
                            >
                                {tech}
                            </span>
                        ))}
                        {project.stack?.length > 4 && (
                            <span className={`font-display text-[10px] font-semibold px-2.5 py-1 rounded-full ${dark ? 'bg-[#1B2230] text-[#8A92A3]' : 'bg-[#F2F3F7] text-[#6B7280]'
                                }`}>
                                +{project.stack.length - 4}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;