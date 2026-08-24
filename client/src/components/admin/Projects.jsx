import { useEffect, useState } from 'react';
import {
    FiPlus, FiEdit2, FiTrash2, FiExternalLink,
    FiGrid, FiUpload, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmDialog from './ConfirmDialog';
import { PrimaryButton } from './Button';
import { Input, TextArea, Select } from './Input';
import Badge from './Badge';
import Modal from './Modal';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        tag: '',
        description: '',
        stack: '',
        demo: '',
        github: '',
        span: 'lg:col-span-6',
        image: '',
        imagePublicId: '',
        images: [], // ✅ Added for multiple images
    });

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            setProjects(res.data);
        } catch (error) {
            toast.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...previews]);
        setSelectedImages([...selectedImages, ...files]);
    };

    const removeImage = (index) => {
        const newPreviews = [...imagePreviews];
        const newFiles = [...selectedImages];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        newFiles.splice(index, 1);
        setImagePreviews(newPreviews);
        setSelectedImages(newFiles);
    };

    const uploadImages = async () => {
        if (selectedImages.length === 0) return null;

        const formData = new FormData();
        selectedImages.forEach((file) => {
            formData.append('images', file);
        });

        try {
            const res = await api.post('/projects/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data.images;
        } catch (error) {
            toast.error('Failed to upload images');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadingImages(true);

        try {
            let uploadedImages = [];
            if (selectedImages.length > 0) {
                const result = await uploadImages();
                if (result) {
                    uploadedImages = result;
                }
            }

            // ✅ Build the data with images array
            const data = {
                ...formData,
                stack: formData.stack.split(',').map((s) => s.trim()).filter((s) => s !== ''),
                // ✅ Store ALL uploaded images as an array
                images: uploadedImages.length > 0
                    ? uploadedImages.map(img => img.url)
                    : (formData.images || []),
                // Keep first image as main for backward compatibility
                image: uploadedImages.length > 0 ? uploadedImages[0].url : formData.image,
                imagePublicId: uploadedImages.length > 0 ? uploadedImages[0].publicId : formData.imagePublicId,
            };

            if (editingProject) {
                await api.put(`/projects/${editingProject._id}`, data);
                toast.success('Project updated successfully!');
            } else {
                await api.post('/projects', data);
                toast.success('Project created successfully!');
            }

            setShowModal(false);
            setEditingProject(null);
            setFormData({
                title: '',
                tag: '',
                description: '',
                stack: '',
                demo: '',
                github: '',
                span: 'lg:col-span-6',
                image: '',
                imagePublicId: '',
                images: [],
            });
            setSelectedImages([]);
            setImagePreviews([]);
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/projects/${deleteTarget}`);
            toast.success('Project deleted successfully!');
            fetchProjects();
        } catch (error) {
            toast.error('Failed to delete project');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            tag: project.tag,
            description: project.description,
            stack: project.stack.join(', '),
            demo: project.demo || '',
            github: project.github || '',
            span: project.span || 'lg:col-span-6',
            image: project.image || '',
            imagePublicId: project.imagePublicId || '',
            images: project.images || [],
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setShowModal(true);
    };

    const coverColors = {
        'cover-1': 'from-accent to-accent-end',
        'cover-2': 'from-[#F472B6] to-[#8B5CF6]',
        'cover-3': 'from-accent-end to-[#34D399]',
        'cover-4': 'from-[#6366F1] to-[#14B8A6]',
    };

    const spanLabels = {
        'lg:col-span-7': 'Wide (7 cols)',
        'lg:col-span-6': 'Medium (6 cols)',
        'lg:col-span-5': 'Narrow (5 cols)',
    };

    return (
        <div>
            {/* ===== PAGE HEADER ===== */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-3">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                Content Management
                            </span>
                        </div>
                        <h1 className="font-display text-[clamp(28px,3.5vw,38px)] font-extrabold tracking-[-0.015em]">
                            Projects
                        </h1>
                        <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-1">
                            Manage the work shown on your portfolio site. {projects.length} project{projects.length !== 1 ? 's' : ''} total.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingProject(null);
                            setFormData({
                                title: '',
                                tag: '',
                                description: '',
                                stack: '',
                                demo: '',
                                github: '',
                                span: 'lg:col-span-6',
                                image: '',
                                imagePublicId: '',
                                images: [],
                            });
                            setSelectedImages([]);
                            setImagePreviews([]);
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 font-display text-[14px] font-semibold py-2.5 px-5 rounded-full gradient-bg text-white shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)_/_0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_-8px_rgb(var(--accent-rgb)_/_0.6)] shrink-0"
                    >
                        <FiPlus className="w-4 h-4" strokeWidth={1.5} />
                        Add Project
                    </button>
                </div>
            </div>

            {/* ===== PROJECTS TABLE ===== */}
            {loading ? (
                <p className="font-body text-[#6B7280]">Loading projects...</p>
            ) : projects.length === 0 ? (
                <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-12 text-center">
                    <FiGrid className="w-12 h-12 mx-auto text-[#6B7280] mb-4" strokeWidth={1.5} />
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">No projects yet. Create your first project above.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E7E8EE] dark:border-[#262D3A] bg-[#F2F3F7] dark:bg-[#1B2230]">
                        <div className="col-span-5 font-display text-[12px] font-semibold uppercase tracking-wide text-[#6B7280] dark:text-[#8A92A3]">
                            Project
                        </div>
                        <div className="col-span-2 font-display text-[12px] font-semibold uppercase tracking-wide text-[#6B7280] dark:text-[#8A92A3] hidden sm:block">
                            Tag
                        </div>
                        <div className="col-span-3 font-display text-[12px] font-semibold uppercase tracking-wide text-[#6B7280] dark:text-[#8A92A3] hidden lg:block">
                            Stack
                        </div>
                        <div className="col-span-1 font-display text-[12px] font-semibold uppercase tracking-wide text-[#6B7280] dark:text-[#8A92A3] hidden xl:block">
                            Span
                        </div>
                        <div className="col-span-5 sm:col-span-2 lg:col-span-1 font-display text-[12px] font-semibold uppercase tracking-wide text-[#6B7280] dark:text-[#8A92A3] text-right">
                            Actions
                        </div>
                    </div>

                    {/* Table Body */}
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#E7E8EE] dark:border-[#262D3A] last:border-b-0 hover:bg-[#FAFAFB] dark:hover:bg-[#0E1117] transition-colors items-center"
                        >
                            {/* Project Info */}
                            <div className="col-span-5 flex items-center gap-3 min-w-0">
                                {project.image ? (
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                                    />
                                ) : (
                                    <div
                                        className={`w-10 h-10 rounded-lg shrink-0 bg-gradient-to-r ${coverColors[project.cover] || 'from-accent to-accent-end'} flex items-center justify-center`}
                                    >
                                        <span className="font-display text-sm font-extrabold text-white">
                                            {project.title.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-display text-sm font-semibold truncate">{project.title}</p>
                                    <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] truncate hidden sm:block">
                                        {project.description?.slice(0, 60)}...
                                    </p>
                                </div>
                            </div>

                            {/* Tag */}
                            <div className="col-span-2 hidden sm:block">
                                <Badge tone="accent">{project.tag}</Badge>
                            </div>

                            {/* Stack */}
                            <div className="col-span-3 hidden lg:flex flex-wrap gap-1.5">
                                {project.stack.slice(0, 3).map((tech) => (
                                    <Badge key={tech} tone="gray" className="text-[10px]">{tech}</Badge>
                                ))}
                                {project.stack.length > 3 && (
                                    <Badge tone="gray" className="text-[10px]">+{project.stack.length - 3}</Badge>
                                )}
                            </div>

                            {/* Span */}
                            <div className="col-span-1 hidden xl:block">
                                <span className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">
                                    {spanLabels[project.span] || 'Medium'}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-5 sm:col-span-2 lg:col-span-1 flex items-center justify-end gap-1">
                                {project.demo && (
                                    <a
                                        href={project.demo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] transition-colors"
                                        title="Live demo"
                                    >
                                        <FiExternalLink className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleEdit(project)}
                                    className="p-2 rounded-lg hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-4 h-4 text-accent-end" strokeWidth={1.5} />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(project._id)}
                                    className="p-2 rounded-lg hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== CREATE/EDIT MODAL ===== */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedImages([]);
                    setImagePreviews([]);
                }}
                title={editingProject ? 'Edit Project' : 'Add New Project'}
                onConfirm={handleSubmit}
                confirmLabel={editingProject ? 'Update' : 'Create'}
                isLoading={uploadingImages}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Project name"
                            required
                        />
                        <Input
                            label="Tag"
                            name="tag"
                            value={formData.tag}
                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                            placeholder="e.g., Flagship Project"
                            required
                        />
                    </div>

                    <TextArea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your project..."
                        rows={3}
                        required
                    />

                    <Input
                        label="Tech Stack (comma separated)"
                        name="stack"
                        value={formData.stack}
                        onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                        placeholder="React, Node.js, MongoDB"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Demo URL"
                            name="demo"
                            value={formData.demo}
                            onChange={(e) => setFormData({ ...formData, demo: e.target.value })}
                            placeholder="https://..."
                        />
                        <Input
                            label="GitHub URL"
                            name="github"
                            value={formData.github}
                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                            placeholder="https://github.com/..."
                        />
                    </div>

                    <Select
                        label="Grid Span"
                        name="span"
                        value={formData.span}
                        onChange={(e) => setFormData({ ...formData, span: e.target.value })}
                        options={[
                            { value: 'lg:col-span-7', label: 'Wide (7 columns)' },
                            { value: 'lg:col-span-6', label: 'Medium (6 columns)' },
                            { value: 'lg:col-span-5', label: 'Narrow (5 columns)' },
                        ]}
                    />

                    {/* ===== IMAGE UPLOAD SECTION ===== */}
                    <div>
                        <label className="block font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-2">
                            Project Images (max 5)
                        </label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer inline-flex items-center gap-2 font-display text-[14px] font-semibold py-2.5 px-5 rounded-full border border-[#E7E8EE] dark:border-[#262D3A] hover:border-accent transition-colors">
                                <FiUpload className="w-4 h-4" strokeWidth={1.5} />
                                Choose Images
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    disabled={uploadingImages}
                                />
                            </label>
                            <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">
                                {selectedImages.length} / 5 selected
                            </span>
                        </div>

                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-20 h-20 rounded-xl object-cover border border-[#E7E8EE] dark:border-[#262D3A]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            <FiX className="w-3.5 h-3.5" strokeWidth={2} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </form>
            </Modal>

            {/* ===== CONFIRM DELETE DIALOG ===== */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete this project?"
                message="This action cannot be undone. This project will be permanently removed from your portfolio."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default AdminProjects;