import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiGithub, FiExternalLink, FiChevronLeft, FiChevronRight, FiX, FiLock } from 'react-icons/fi';
import api from '../services/api';
import logError from '../utils/logError';
import toExternalUrl from '../utils/externalUrl';
import ProtectedContent from '../components/common/ProtectedContent';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProjectDetail = ({ dark }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/projects/${id}`);
                setProject(res.data);
                setCurrentImageIndex(0);
            } catch (error) {
                logError('page/project-detail', error);
                toast.error('Project not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id, navigate]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') handlePrevImage(e);
            if (e.key === 'ArrowRight') handleNextImage(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentImageIndex]);

    const handlePrevImage = (e) => {
        e?.stopPropagation();
        if (!images || images.length === 0) return;
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNextImage = (e) => {
        e?.stopPropagation();
        if (!images || images.length === 0) return;
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const images = project?.images?.length > 0
        ? project.images
        : (project?.image ? [project.image] : []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">Project not found</p>
            </div>
        );
    }

    const coverColors = {
        'cover-1': 'from-accent to-accent-end',
        'cover-2': 'from-[#F472B6] to-[#8B5CF6]',
        'cover-3': 'from-accent-end to-[#34D399]',
        'cover-4': 'from-[#6366F1] to-[#14B8A6]',
    };

    return (
        <div className={`min-h-screen pt-20 ${dark ? 'bg-[#0E1117] text-[#ECEEF1]' : 'bg-[#FAFAFB] text-[#14151A]'}`}>
            <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
                {/* ===== BACK TO WORK + HOME ===== */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/work"
                        className="inline-flex items-center gap-2 font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] hover:text-accent transition-colors"
                    >
                        <FiArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                        Back to Work
                    </Link>
                    <span className="text-[#6B7280] dark:text-[#8A92A3]">|</span>
                    <Link
                        to="/"
                        className="font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] hover:text-accent transition-colors"
                    >
                        Home
                    </Link>
                </div>

                {/* ===== PROJECT HEADER ===== */}
                <div className="mb-8">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                            {project.tag}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#6B7280] dark:bg-[#8A92A3]" />
                        <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">
                            {project.stack?.length || 0} technologies
                        </span>
                        {images.length > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-[#6B7280] dark:bg-[#8A92A3]" />
                                <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">
                                    {images.length} image{images.length > 1 ? 's' : ''}
                                </span>
                            </>
                        )}
                    </div>
                    <h1 className="font-display text-[clamp(36px,5vw,64px)] font-extrabold tracking-[-0.02em] leading-[1.08]">
                        {project.title}
                    </h1>
                </div>

                {/* ===== IMAGE SLIDER ===== */}
                {images.length > 0 && (
                    <div className="mb-10">
                        <div className="relative rounded-[24px] overflow-hidden bg-[#F2F3F7] dark:bg-[#1B2230]">
                            <div className="aspect-video relative">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${project.title} - ${currentImageIndex + 1}`}
                                    className="w-full h-full object-contain cursor-pointer"
                                    onClick={() => setLightboxOpen(true)}
                                />
                            </div>

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                                    >
                                        <FiChevronLeft className="w-6 h-6" strokeWidth={2} />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                                    >
                                        <FiChevronRight className="w-6 h-6" strokeWidth={2} />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white font-display text-sm font-semibold z-10">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200 ${currentImageIndex === index
                                                ? 'border-accent'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== PROJECT INFO ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="font-display text-xl font-bold mb-4">About this project</h2>
                        <p className={`font-body text-base leading-[1.8] ${dark ? 'text-[#8A92A3]' : 'text-[#6B7280]'
                            }`}>
                            {project.description}
                        </p>

                        <div className="mt-6">
                            <h3 className="font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-3">
                                Technologies Used
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.stack?.map((tech) => (
                                    <span
                                        key={tech}
                                        className={`font-display text-xs font-semibold px-3 py-1.5 rounded-lg ${dark ? 'bg-[#1B2230] text-[#ECEEF1]' : 'bg-[#F2F3F7] text-[#14151A]'
                                            }`}
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ===== SIDEBAR ===== */}
                    <div className="space-y-4">
                        <div className={`rounded-[18px] border p-6 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                            }`}>
                            <h3 className="font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-4">
                                Links
                            </h3>
                            <div className="space-y-3">
                                {project.demo && (
                                    <a
                                        href={toExternalUrl(project.demo)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#F2F3F7] dark:bg-[#1B2230] font-display text-sm font-semibold hover:gradient-bg hover:text-white transition-all duration-300"
                                    >
                                        <span>Live Demo</span>
                                        <FiExternalLink className="w-4 h-4" strokeWidth={1.5} />
                                    </a>
                                )}
                                {project.github && (
                                    <ProtectedContent
                                        fallback={
                                            <button
                                                onClick={() => window.location.href = '/login'}
                                                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#F2F3F7] dark:bg-[#1B2230] font-display text-sm font-semibold hover:gradient-bg hover:text-white transition-all duration-300"
                                            >
                                                <span>GitHub Repository</span>
                                                <FiLock className="w-4 h-4" strokeWidth={1.5} />
                                            </button>
                                        }
                                    >
                                        <a
                                            href={toExternalUrl(project.github)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#F2F3F7] dark:bg-[#1B2230] font-display text-sm font-semibold hover:gradient-bg hover:text-white transition-all duration-300"
                                        >
                                            <span>GitHub Repository</span>
                                            <FiGithub className="w-4 h-4" strokeWidth={1.5} />
                                        </a>
                                    </ProtectedContent>
                                )}
                            </div>
                        </div>

                        <div className={`rounded-[18px] border p-6 ${dark ? 'bg-[#161B22] border-[#262D3A]' : 'bg-white border-[#E7E8EE]'
                            }`}>
                            <h3 className="font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-3">
                                Project Info
                            </h3>
                            <div className="space-y-2 font-body text-sm">
                                <div className="flex justify-between">
                                    <span className="text-[#6B7280] dark:text-[#8A92A3]">Status</span>
                                    <span className="font-semibold">{project.tag}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6B7280] dark:text-[#8A92A3]">Technologies</span>
                                    <span className="font-semibold">{project.stack?.length || 0}</span>
                                </div>
                                {project.createdAt && (
                                    <div className="flex justify-between">
                                        <span className="text-[#6B7280] dark:text-[#8A92A3]">Added</span>
                                        <span className="font-semibold">
                                            {new Date(project.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== LIGHTBOX ===== */}
            {lightboxOpen && images.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-6 right-6 text-white hover:text-accent transition-colors z-20"
                    >
                        <FiX className="w-8 h-8" strokeWidth={1.5} />
                    </button>

                    <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[currentImageIndex]}
                            alt={`${project.title} - ${currentImageIndex + 1}`}
                            className="w-full max-h-[80vh] object-contain rounded-xl"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                                >
                                    <FiChevronLeft className="w-6 h-6" strokeWidth={2} />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
                                >
                                    <FiChevronRight className="w-6 h-6" strokeWidth={2} />
                                </button>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white font-display text-sm font-semibold z-10">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;