import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiList, FiSearch, FiArrowRight, FiEye, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import logError from '../utils/logError';
import ProjectCard from '../components/home/ProjectCard';

const Work = ({ dark }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTag, setFilterTag] = useState('All');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects');
                setProjects(res.data);
            } catch (error) {
                logError('page/work', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const allTags = ['All', ...new Set(projects.map((p) => p.tag).filter(Boolean))];

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.stack.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesTag = filterTag === 'All' || project.tag === filterTag;
        return matchesSearch && matchesTag;
    });

    const totalProjects = projects.length;
    const uniqueTags = allTags.length - 1;

    if (loading) {
        return (
            <div className="min-h-screen pt-24 max-w-[1200px] mx-auto px-8 py-12">
                <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">Loading projects...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 ${dark ? 'bg-[#0E1117] text-[#ECEEF1]' : 'bg-[#FAFAFB] text-[#14151A]'}`}>
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
                {/* ===== BACK TO HOME ===== */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] hover:text-accent transition-colors mb-6"
                >
                    <FiArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                    Back to Home
                </Link>

                {/* ===== HERO HEADER ===== */}
                <div className="mb-10 sm:mb-12 relative">
                    <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-accent-end/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-4">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                My Portfolio
                            </span>
                            <span className="w-1 h-1 rounded-full bg-accent/30" />
                            <span className="font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3]">
                                {totalProjects} Projects
                            </span>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            <div>
                                <h1 className="font-display text-[clamp(38px,6vw,68px)] font-extrabold tracking-[-0.02em] leading-[1.08]">
                                    My <span className="gradient-text">Work</span>
                                </h1>
                                <p className="font-body text-lg text-[#6B7280] dark:text-[#8A92A3] mt-3 max-w-2xl leading-[1.7]">
                                    Explore a collection of projects that showcase my skills in full-stack development,
                                    UI/UX design, and real-world problem solving.
                                </p>
                            </div>

                            <div className="flex gap-4 shrink-0">
                                <div className={`px-5 py-3 rounded-xl border ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                                    }`}>
                                    <span className="font-display text-2xl font-extrabold gradient-text">{totalProjects}</span>
                                    <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Total</p>
                                </div>
                                <div className={`px-5 py-3 rounded-xl border ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                                    }`}>
                                    <span className="font-display text-2xl font-extrabold gradient-text">{uniqueTags}</span>
                                    <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">Tags</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== SEARCH & FILTERS ===== */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#8A92A3]" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Search projects by title, description, or tech stack..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl border ${dark
                                    ? 'bg-[#161B22] border-[#262D3A] text-[#ECEEF1] placeholder:text-[#8A92A3]'
                                    : 'bg-white border-[#E7E8EE] text-[#14151A] placeholder:text-[#6B7280]'
                                } focus:border-accent focus:outline-none transition-colors`}
                        />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${view === 'grid'
                                    ? 'gradient-bg text-white shadow-lg'
                                    : 'text-[#6B7280] dark:text-[#8A92A3] hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230]'
                                }`}
                        >
                            <FiGrid className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${view === 'list'
                                    ? 'gradient-bg text-white shadow-lg'
                                    : 'text-[#6B7280] dark:text-[#8A92A3] hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230]'
                                }`}
                        >
                            <FiList className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] ml-2">
                            {filteredProjects.length} / {totalProjects}
                        </span>
                    </div>
                </div>

                {/* ===== TAG FILTERS ===== */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => setFilterTag(tag)}
                            className={`px-4 py-2 rounded-full font-display text-sm font-medium transition-all duration-200 ${filterTag === tag
                                    ? 'gradient-bg text-white shadow-lg'
                                    : dark
                                        ? 'bg-[#161B22] border border-[#262D3A] text-[#8A92A3] hover:border-accent hover:text-[#ECEEF1]'
                                        : 'bg-white border border-[#E7E8EE] text-[#6B7280] hover:border-accent hover:text-[#14151A]'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* ===== PROJECTS ===== */}
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full gradient-soft flex items-center justify-center mx-auto mb-4">
                            <FiEye className="w-8 h-8 text-accent" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-display text-xl font-bold">No projects found</h3>
                        <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-1">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className={`grid gap-6 ${view === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                            : 'grid-cols-1'
                        }`}>
                        {filteredProjects.map((project) => (
                            <ProjectCard key={project._id} project={project} dark={dark} />
                        ))}
                    </div>
                )}

                {/* ===== FOOTER CTA ===== */}
                {filteredProjects.length > 0 && (
                    <div className="mt-12 p-6 rounded-[18px] gradient-bg overflow-hidden relative">
                        <div className="absolute inset-0 stripe-pattern-45 animate-slide-slow" />
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="font-display text-lg font-bold text-white">See Something You Like?</h3>
                                <p className="font-body text-white/80 text-sm">
                                    I'm always open to new projects and collaborations.
                                </p>
                            </div>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 font-display text-sm font-semibold px-6 py-3 rounded-full bg-white text-accent shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                            >
                                Let's Talk
                                <FiArrowRight className="w-4 h-4" strokeWidth={1.5} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Work;