import { useState, useEffect } from 'react';
import { FiUpload, FiX, FiUser, FiMail, FiGithub, FiLinkedin, FiMapPin, FiBriefcase, FiCalendar, FiFile, FiEye } from 'react-icons/fi';
import { Input, TextArea } from './Input';
import { PrimaryButton, GhostButton } from './Button';
import toast from 'react-hot-toast';
import api from '../../services/api';
import logError from '../../utils/logError';

const ProfileEditor = () => {
    const [profile, setProfile] = useState({
        name: '',
        title: '',
        location: '',
        education: '',
        aboutHeading: '',
        aboutP1: '',
        aboutP2: '',
        stats: [
            { num: '', lab: '' },
            { num: '', lab: '' },
            { num: '', lab: '' },
        ],
        social: {
            github: '',
            linkedin: '',
            email: '',
        },
        profileImage: '',
        profileImagePublicId: '',
        cvUrl: '',
        cvPublicId: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCV, setUploadingCV] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedCV, setSelectedCV] = useState(null);
    const [cvName, setCvName] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile');
                if (res.data) {
                    setProfile({
                        ...res.data,
                        stats: res.data.stats || [
                            { num: '', lab: '' },
                            { num: '', lab: '' },
                            { num: '', lab: '' },
                        ],
                        social: res.data.social || { github: '', linkedin: '', email: '' },
                    });
                    if (res.data.cvUrl) {
                        const parts = res.data.cvUrl.split('/');
                        setCvName(parts[parts.length - 1] || 'resume.pdf');
                    }
                }
            } catch (error) {
                logError('admin/profile', error);
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleImageUpload = async () => {
        if (!selectedImage) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('profileImage', selectedImage);

        try {
            const res = await api.post('/profile/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile({ ...profile, profileImage: res.data.profileImage });
            toast.success('Profile image updated!');
            setSelectedImage(null);
            setImagePreview(null);
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = async () => {
        if (!profile.profileImage) return;
        try {
            const updated = { ...profile, profileImage: '', profileImagePublicId: '' };
            await api.put('/profile', updated);
            setProfile(updated);
            toast.success('Image removed');
        } catch (error) {
            toast.error('Failed to remove image');
        }
    };

    const handleCVSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Please upload a PDF or Word document');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File must be less than 5MB');
            return;
        }

        setSelectedCV(file);
        setCvName(file.name);
    };

    const handleCVUpload = async () => {
        if (!selectedCV) return;

        setUploadingCV(true);
        const formData = new FormData();
        formData.append('cv', selectedCV);

        try {
            const res = await api.post('/profile/upload-cv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setProfile({ ...profile, cvUrl: res.data.cvUrl });
            toast.success('CV uploaded successfully!');
            setSelectedCV(null);
        } catch (error) {
            toast.error('Failed to upload CV');
        } finally {
            setUploadingCV(false);
        }
    };

    const removeCV = async () => {
        if (!profile.cvUrl) return;
        try {
            const updated = { ...profile, cvUrl: '', cvPublicId: '' };
            await api.put('/profile', updated);
            setProfile(updated);
            setCvName('');
            toast.success('CV removed');
        } catch (error) {
            toast.error('Failed to remove CV');
        }
    };

    const handleStatChange = (index, field, value) => {
        const updated = [...profile.stats];
        updated[index][field] = value;
        setProfile({ ...profile, stats: updated });
    };

    const handleSocialChange = (platform, value) => {
        setProfile({
            ...profile,
            social: { ...profile.social, [platform]: value },
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/profile', profile);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <p className="font-body text-[#6B7280]">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ===== PROFILE IMAGE ===== */}
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                <h3 className="font-display text-lg font-bold mb-4">Profile Image</h3>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-accent to-accent-end flex items-center justify-center shrink-0">
                        {profile.profileImage ? (
                            <img
                                src={profile.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-display text-3xl font-extrabold text-white">
                                {profile.name?.charAt(0) || 'R'}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-3">
                            <label className="cursor-pointer inline-flex items-center gap-2 font-display text-[14px] font-semibold py-2.5 px-5 rounded-full border border-[#E7E8EE] dark:border-[#262D3A] hover:border-accent transition-colors">
                                <FiUpload className="w-4 h-4" strokeWidth={1.5} />
                                Choose Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </label>
                            {selectedImage && (
                                <PrimaryButton onClick={handleImageUpload} disabled={uploadingImage}>
                                    {uploadingImage ? 'Uploading...' : 'Upload'}
                                </PrimaryButton>
                            )}
                            {profile.profileImage && (
                                <GhostButton onClick={removeImage}>
                                    <FiX className="w-4 h-4" strokeWidth={1.5} />
                                    Remove
                                </GhostButton>
                            )}
                        </div>
                        {imagePreview && (
                            <div className="mt-3">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-accent"
                                />
                            </div>
                        )}
                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] mt-2">
                            Recommended: Square image, max 2MB
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== CV UPLOAD ===== */}
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                <h3 className="font-display text-lg font-bold mb-4">CV / Resume</h3>
                <div className="flex flex-wrap items-center gap-4">
                    {profile.cvUrl ? (
                        <>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-[#F2F3F7] dark:bg-[#1B2230]">
                                <FiFile className="w-4 h-4 text-accent" strokeWidth={1.5} />
                                <span className="font-body text-sm font-medium">{cvName || 'Resume'}</span>
                            </div>
                            <a
                                href={profile.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-display text-[14px] font-semibold py-2.5 px-5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300"
                            >
                                <FiEye className="w-4 h-4" strokeWidth={1.5} />
                                View CV
                            </a>
                            <GhostButton onClick={removeCV}>
                                <FiX className="w-4 h-4" strokeWidth={1.5} />
                                Remove
                            </GhostButton>
                        </>
                    ) : (
                        <>
                            <label className="cursor-pointer inline-flex items-center gap-2 font-display text-[14px] font-semibold py-2.5 px-5 rounded-full border border-[#E7E8EE] dark:border-[#262D3A] hover:border-accent transition-colors">
                                <FiUpload className="w-4 h-4" strokeWidth={1.5} />
                                Choose CV
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleCVSelect}
                                    className="hidden"
                                />
                            </label>
                            {selectedCV && (
                                <>
                                    <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">
                                        {cvName}
                                    </span>
                                    <PrimaryButton onClick={handleCVUpload} disabled={uploadingCV}>
                                        {uploadingCV ? 'Uploading...' : 'Upload CV'}
                                    </PrimaryButton>
                                </>
                            )}
                        </>
                    )}
                </div>
                <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] mt-2">
                    Supported formats: PDF, DOC, DOCX. Max size: 5MB
                </p>
            </div>

            {/* ===== PERSONAL INFO ===== */}
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                <h3 className="font-display text-lg font-bold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Name"
                        value={profile.name || ''}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Your name"
                    />
                    <Input
                        label="Title"
                        value={profile.title || ''}
                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        placeholder="e.g., Full-Stack Developer"
                    />
                    <Input
                        label="Location"
                        value={profile.location || ''}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="e.g., Peshawar, Pakistan"
                    />
                    <Input
                        label="Education"
                        value={profile.education || ''}
                        onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                        placeholder="e.g., UET Peshawar — CS Student"
                    />
                </div>
            </div>

            {/* ===== ABOUT SECTION ===== */}
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                <h3 className="font-display text-lg font-bold mb-4">About Section</h3>
                <div className="space-y-4">
                    <Input
                        label="Heading"
                        value={profile.aboutHeading || ''}
                        onChange={(e) => setProfile({ ...profile, aboutHeading: e.target.value })}
                        placeholder="e.g., From Peshawar, building for the world."
                    />
                    <TextArea
                        label="Paragraph 1"
                        value={profile.aboutP1 || ''}
                        onChange={(e) => setProfile({ ...profile, aboutP1: e.target.value })}
                        placeholder="First paragraph about yourself..."
                        rows={3}
                    />
                    <TextArea
                        label="Paragraph 2"
                        value={profile.aboutP2 || ''}
                        onChange={(e) => setProfile({ ...profile, aboutP2: e.target.value })}
                        placeholder="Second paragraph about yourself..."
                        rows={3}
                    />
                </div>
            </div>

            {/* ===== STATS ===== */}
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                <h3 className="font-display text-lg font-bold mb-4">Stats (3 cards)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {profile.stats.map((stat, index) => (
                        <div key={index} className="space-y-2">
                            <Input
                                label={`Stat ${index + 1} - Number`}
                                value={stat.num || ''}
                                onChange={(e) => handleStatChange(index, 'num', e.target.value)}
                                placeholder="e.g., 4+"
                            />
                            <Input
                                label={`Stat ${index + 1} - Label`}
                                value={stat.lab || ''}
                                onChange={(e) => handleStatChange(index, 'lab', e.target.value)}
                                placeholder="e.g., Projects designed"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== SOCIAL LINKS ===== */}
            <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6">
                <h3 className="font-display text-lg font-bold mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="GitHub URL"
                        value={profile.social.github || ''}
                        onChange={(e) => handleSocialChange('github', e.target.value)}
                        placeholder="https://github.com/username"
                    />
                    <Input
                        label="LinkedIn URL"
                        value={profile.social.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                    />
                    <Input
                        label="Email"
                        value={profile.social.email || ''}
                        onChange={(e) => handleSocialChange('email', e.target.value)}
                        placeholder="your@email.com"
                    />
                </div>
            </div>

            {/* ===== SAVE BUTTON ===== */}
            <div className="flex justify-end">
                <PrimaryButton onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save All Changes'}
                </PrimaryButton>
            </div>
        </div>
    );
};

export default ProfileEditor;