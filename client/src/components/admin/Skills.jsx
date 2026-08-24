import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiStar, FiFolder, FiTag, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PrimaryButton } from './Button';
import { Select } from './Input';
import ConfirmDialog from './ConfirmDialog';
import api from '../../services/api';
import logError from '../../utils/logError';

const SkillsManager = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [isAdding, setIsAdding] = useState(false);

    const skillOptions = {
        frontend: [
            'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte',
            'Tailwind CSS', 'CSS3', 'HTML5', 'JavaScript', 'TypeScript',
            'Redux', 'Zustand', 'Framer Motion', 'GSAP', 'Vite',
            'Webpack', 'Babel', 'Sass', 'Styled Components', 'Bootstrap',
            'Material UI', 'Chakra UI', 'shadcn/ui', 'Storybook', 'Figma',
        ],
        backend: [
            'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask',
            'Spring Boot', 'Laravel', 'Ruby on Rails', 'Go', 'Rust',
            'GraphQL', 'REST APIs', 'Socket.IO', 'WebSockets', 'JWT',
            'OAuth', 'Passport.js', 'Firebase', 'Supabase', 'Postman',
            'Swagger', 'Jest', 'Mocha', 'Chai', 'Supertest',
        ],
        database: [
            'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis',
            'Elasticsearch', 'Firebase Firestore', 'DynamoDB', 'Cassandra', 'Neo4j',
            'Mongoose', 'Prisma', 'Sequelize', 'TypeORM', 'Knex',
            'SQLAlchemy', 'MongoDB Atlas', 'Supabase', 'PlanetScale', 'Neon',
        ],
        devops: [
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
            'Vercel', 'Netlify', 'Railway', 'Render', 'Heroku',
            'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD',
            'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'Prometheus',
            'Grafana', 'Cloudinary', 'S3', 'Lambda', 'EC2',
        ],
        design: [
            'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
            'InDesign', 'After Effects', 'Premiere Pro', 'Lightroom', 'Procreate',
            'UI Design', 'UX Design', 'Wireframing', 'Prototyping', 'User Research',
            'Design Systems', 'Typography', 'Color Theory', 'Accessibility', 'Responsive Design',
        ],
        other: [
            'TypeScript', 'JavaScript', 'Python', 'Java', 'C++',
            'PHP', 'Ruby', 'Swift', 'Kotlin', 'Rust',
            'Go', 'Bash', 'PowerShell', 'Perl', 'R',
            'MATLAB', 'Dart', 'Flutter', 'React Native', 'Electron',
        ],
    };

    const categories = [
        { value: 'frontend', label: 'Frontend Development', icon: FiTag, color: 'blue' },
        { value: 'backend', label: 'Backend Development', icon: FiTag, color: 'green' },
        { value: 'database', label: 'Database & Storage', icon: FiTag, color: 'yellow' },
        { value: 'devops', label: 'DevOps & Tools', icon: FiTag, color: 'purple' },
        { value: 'design', label: 'Design & UI/UX', icon: FiTag, color: 'pink' },
        { value: 'other', label: 'Other Tools', icon: FiFolder, color: 'gray' },
    ];

    const fetchSkills = async () => {
        try {
            const res = await api.get('/skills');
            setSkills(res.data || []);
        } catch (error) {
            toast.error('Failed to fetch skills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const existingSkillNames = skills
        .filter((s) => s.category === selectedCategory)
        .map((s) => s.name.toLowerCase());

    const availableSkills = selectedCategory
        ? (skillOptions[selectedCategory] || []).filter(
            (skill) => !existingSkillNames.includes(skill.toLowerCase())
        )
        : [];

    const handleAddSkills = async () => {
        if (!selectedCategory) {
            toast.error('Please select a category');
            return;
        }
        if (selectedSkills.length === 0) {
            toast.error('Please select at least one skill');
            return;
        }

        setIsAdding(true);
        let addedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        try {
            for (const skillName of selectedSkills) {
                // ✅ Check if skill already exists in current state
                const alreadyExists = skills.some(
                    (s) => s.name.toLowerCase() === skillName.toLowerCase()
                );

                if (alreadyExists) {
                    duplicateCount++;
                    continue;
                }

                try {
                    const res = await api.post('/skills', {
                        name: skillName,
                        category: selectedCategory,
                    });
                    setSkills((prev) => [...prev, res.data]);
                    addedCount++;
                } catch (error) {
                    if (error.response?.status === 400) {
                        duplicateCount++;
                    } else {
                        errorCount++;
                        logError('admin/skills:add', error);
                    }
                }
            }

            setSelectedSkills([]);

            if (addedCount > 0 && duplicateCount > 0) {
                toast.success(`${addedCount} skill(s) added. ${duplicateCount} duplicate(s) skipped.`);
            } else if (addedCount > 0) {
                toast.success(`${addedCount} skill(s) added successfully!`);
            } else if (duplicateCount > 0) {
                toast.error(`${duplicateCount} skill(s) already exist and were skipped.`);
            } else if (errorCount > 0) {
                toast.error(`Failed to add ${errorCount} skill(s).`);
            } else {
                toast.error('No skills were added.');
            }
        } catch (error) {
            toast.error('Failed to add skills');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/skills/${deleteTarget.id}`);
            setSkills(skills.filter((s) => s._id !== deleteTarget.id));
            toast.success('Skill deleted');
        } catch (error) {
            toast.error('Failed to delete skill');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const toggleSkillSelection = (skillName) => {
        setSelectedSkills((prev) =>
            prev.includes(skillName)
                ? prev.filter((s) => s !== skillName)
                : [...prev, skillName]
        );
    };

    const getCategoryColor = (category) => {
        const colors = {
            frontend: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
            backend: 'border-green-500/30 bg-green-500/10 text-green-500',
            database: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500',
            devops: 'border-purple-500/30 bg-purple-500/10 text-purple-500',
            design: 'border-pink-500/30 bg-pink-500/10 text-pink-500',
            other: 'border-gray-500/30 bg-gray-500/10 text-gray-500',
        };
        return colors[category] || colors.other;
    };

    if (loading) {
        return <p className="font-body text-[#6B7280]">Loading skills...</p>;
    }

    const groupedSkills = skills.reduce((acc, skill) => {
        const category = skill.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {});

    return (
        <div>
            {/* ===== PAGE HEADER ===== */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-3">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                Skills Management
                            </span>
                        </div>
                        <h1 className="font-display text-[clamp(28px,3.5vw,38px)] font-extrabold tracking-[-0.015em]">
                            Skills
                        </h1>
                        <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-1">
                            Manage the tech stack shown on your portfolio site. {skills.length} skill{skills.length !== 1 ? 's' : ''} listed.
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== ADD SKILLS SECTION ===== */}
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6 mb-6">
                <h3 className="font-display text-sm font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-4">
                    Add Skills by Category
                </h3>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-64">
                        <Select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setSelectedSkills([]);
                            }}
                            placeholder="Select category..."
                            options={[
                                { value: '', label: 'Select category...' },
                                ...categories.map((c) => ({
                                    value: c.value,
                                    label: c.label,
                                    color: c.color,
                                    icon: c.icon,
                                })),
                            ]}
                        />
                    </div>
                    <div className="flex-1">
                        {selectedCategory && (
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] min-h-[50px] max-h-[150px] overflow-y-auto">
                                {availableSkills.length === 0 ? (
                                    <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">
                                        {existingSkillNames.length > 0
                                            ? 'All skills in this category have been added ✅'
                                            : 'No skills available for this category'}
                                    </span>
                                ) : (
                                    availableSkills.map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkillSelection(skill)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-display font-medium transition-all duration-200 border ${selectedSkills.includes(skill)
                                                    ? 'border-accent bg-accent/10 text-accent'
                                                    : 'border-[#E7E8EE] dark:border-[#262D3A] hover:border-accent text-[#6B7280] dark:text-[#8A92A3] hover:text-accent'
                                                }`}
                                        >
                                            {skill}
                                            {selectedSkills.includes(skill) && (
                                                <FiCheck className="inline ml-1 w-3.5 h-3.5" strokeWidth={2} />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <PrimaryButton
                        onClick={handleAddSkills}
                        disabled={!selectedCategory || selectedSkills.length === 0 || isAdding}
                        className="shrink-0"
                    >
                        <FiPlus className="w-4 h-4" strokeWidth={1.5} />
                        {isAdding ? 'Adding...' : `Add ${selectedSkills.length} Skill(s)`}
                    </PrimaryButton>
                </div>
            </div>

            {/* ===== SKILLS LIST BY CATEGORY ===== */}
            {skills.length === 0 ? (
                <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-12 text-center">
                    <FiStar className="w-12 h-12 mx-auto text-[#6B7280] mb-4" strokeWidth={1.5} />
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">
                        No skills added yet. Select a category and add skills above.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedSkills).map(([category, categorySkills]) => {
                        const categoryInfo = categories.find((c) => c.value === category);
                        const label = categoryInfo?.label || 'Other';
                        const Icon = categoryInfo?.icon || FiFolder;
                        const colorClass = getCategoryColor(category);

                        return (
                            <div key={category} className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] overflow-hidden">
                                <div className="px-6 py-3 border-b border-[#E7E8EE] dark:border-[#262D3A] bg-[#F2F3F7] dark:bg-[#1B2230] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-4 h-4 text-accent" />
                                        <span className="font-display text-sm font-semibold">{label}</span>
                                        <span className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">
                                            ({categorySkills.length})
                                        </span>
                                    </div>
                                    <span className={`text-xs font-display font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
                                        {category}
                                    </span>
                                </div>
                                <div className="p-4 flex flex-wrap gap-2">
                                    {categorySkills.map((skill) => (
                                        <div
                                            key={skill._id}
                                            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-[#E7E8EE] dark:border-[#262D3A] hover:border-accent transition-all duration-200"
                                        >
                                            <span className="font-display text-sm font-medium">{skill.name}</span>
                                            <button
                                                onClick={() => setDeleteTarget({ id: skill._id, name: skill.name })}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30"
                                            >
                                                <FiTrash2 className="w-3.5 h-3.5 text-red-500" strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== CONFIRM DELETE DIALOG ===== */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title={`Delete "${deleteTarget?.name}"?`}
                message="This will remove this skill from your portfolio. Are you sure?"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default SkillsManager;