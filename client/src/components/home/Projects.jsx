import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import logError from '../../utils/logError';
import ProjectCard from './ProjectCard';

const Projects = ({ dark }) => {
    const sectionRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects');
                setProjects(res.data);
            } catch (error) {
                logError('home/projects', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.scroll-reveal').forEach((el, i) => {
                            setTimeout(() => {
                                el.classList.add('visible');
                            }, i * 100);
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [projects]);

    if (loading) {
        return (
            <section id="work" className="py-[120px] max-w-[1200px] mx-auto px-8">
                <div className="text-center">
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">Loading projects...</p>
                </div>
            </section>
        );
    }

    // The home page is a highlight reel, not the full archive: show the first
    // four projects here and send visitors to /work for the rest.
    const visibleProjects = projects.slice(0, 4);
    const hasMore = projects.length > 4;

    return (
        <section ref={sectionRef} id="work" className="py-16 sm:py-24 lg:py-[120px] max-w-[1200px] mx-auto px-5 sm:px-8">
            <div className="scroll-reveal mb-12">
                <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5">
                    <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                    <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                        Featured Work
                    </span>
                </div>
                <h2 className="font-display text-[clamp(34px,4.6vw,52px)] font-extrabold tracking-[-0.015em] mt-4">
                    Projects I've built
                </h2>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12">
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">No projects yet. Check back soon!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {visibleProjects.map((project, index) => (
                            <div
                                key={project._id}
                                className={`${project.span || 'lg:col-span-6'} col-span-12 scroll-reveal`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <ProjectCard project={project} dark={dark} index={index} />
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="scroll-reveal flex justify-center mt-14">
                            <Link
                                to="/work"
                                className={`group inline-flex items-center gap-2.5 font-display text-[14px] font-semibold py-[14px] px-7 rounded-full border-[1.5px] transition-all duration-300 hover:border-accent hover:-translate-y-1 ${dark ? 'border-[#262D3A] bg-[#161B22] text-[#ECEEF1]' : 'border-[#E7E8EE] bg-[#FFFFFF] text-[#14151A]'
                                    }`}
                            >
                                View all projects
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full gradient-bg text-white transition-transform duration-300 group-hover:translate-x-0.5">
                                    <FiArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                                </span>
                            </Link>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default Projects;