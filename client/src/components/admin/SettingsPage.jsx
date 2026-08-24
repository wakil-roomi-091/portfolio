import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    FiLock,
    FiGlobe,
    FiMail,
    FiSliders,
    FiAlertTriangle,
    FiCheck,
    FiMonitor,
    FiSun,
    FiMoon,
} from 'react-icons/fi';
import { Input, TextArea } from './Input';
import { PrimaryButton, GhostButton, DangerButton } from './Button';
import ConfirmDialog from './ConfirmDialog';
import Toggle from './Toggle';
import api from '../../services/api';
import { ACCENT_PRESETS, applyAccent, DEFAULT_ACCENT } from '../../utils/appearance';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const CARD =
    'bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-6';

// Fields that live on the Settings document and share the single Save bar.
const CONFIG_FIELDS = [
    'siteTitle',
    'siteDescription',
    'notificationEmail',
    'emailNotifications',
    'autoReply',
    'defaultTheme',
    'accent',
];

const EMPTY_SETTINGS = {
    siteTitle: '',
    siteDescription: '',
    notificationEmail: '',
    emailNotifications: true,
    autoReply: true,
    defaultTheme: 'system',
    accent: DEFAULT_ACCENT,
};

const THEME_OPTIONS = [
    { value: 'system', label: 'System', icon: FiMonitor },
    { value: 'light', label: 'Light', icon: FiSun },
    { value: 'dark', label: 'Dark', icon: FiMoon },
];

// Card section header: gradient-soft icon tile + title + one-line description.
const SectionHeader = ({ icon: Icon, title, subtitle, danger = false }) => (
    <div className="flex items-start gap-3.5 mb-5">
        <div
            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/10' : 'gradient-soft'
                }`}
        >
            <Icon
                className={`w-[18px] h-[18px] ${danger ? 'text-[#EF4444]' : 'text-accent'}`}
                strokeWidth={1.75}
            />
        </div>
        <div>
            <h3 className={`font-display text-lg font-bold ${danger ? 'text-[#EF4444]' : ''}`}>
                {title}
            </h3>
            {subtitle && (
                <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] mt-0.5">
                    {subtitle}
                </p>
            )}
        </div>
    </div>
);

const SettingsPage = () => {
    const { applyTheme } = useTheme();
    const { changePassword } = useAuth();
    const [settings, setSettings] = useState(EMPTY_SETTINGS);
    const [initial, setInitial] = useState(EMPTY_SETTINGS);
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings/all');
                const data = { ...EMPTY_SETTINGS, ...res.data };
                setSettings(data);
                setInitial(data);
            } catch {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // If the user previews an accent (selectAccent applies it live, unpersisted)
    // then navigates away WITHOUT saving, restore the last-saved accent so the
    // rest of the app isn't stuck on the preview. This MUST run only on unmount:
    // depending on [initial.accent] would also fire the cleanup right after a
    // successful save (when initial.accent updates) and revert the just-applied
    // accent using the stale previous value — which made the accent appear to
    // apply on every page except this one. A ref holds the latest saved accent
    // so the unmount restore always uses the current committed value.
    const savedAccentRef = useRef(initial.accent);
    useEffect(() => {
        savedAccentRef.current = initial.accent;
    }, [initial.accent]);
    useEffect(() => {
        return () => applyAccent(savedAccentRef.current);
    }, []);

    const isDirty = CONFIG_FIELDS.some((key) => settings[key] !== initial[key]);

    const setField = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

    const selectAccent = (key) => {
        setField('accent', key);
        applyAccent(key); // live preview
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = CONFIG_FIELDS.reduce((acc, key) => {
                acc[key] = settings[key];
                return acc;
            }, {});
            const res = await api.put('/settings', payload);
            const data = { ...EMPTY_SETTINGS, ...res.data };
            const themeChanged = data.defaultTheme !== initial.defaultTheme;
            setSettings(data);
            setInitial(data);
            // Commit the accent site-wide and cache it for the pre-paint script
            // so it survives a reload without flashing the default.
            applyAccent(data.accent, { persist: true });
            // If the default theme changed, apply it immediately (and store it
            // as the preference) so the admin panel and public site reflect it
            // right away instead of only on the next fresh visit.
            if (themeChanged) {
                applyTheme(data.defaultTheme, { persist: true });
            }
            toast.success('Settings saved');
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setSettings(initial);
        applyAccent(initial.accent);
    };

    const handlePasswordChange = async () => {
        if (!password.current) {
            toast.error('Enter your current password');
            return;
        }
        if (password.new.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (password.new !== password.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        setChangingPw(true);
        // Goes through AuthContext, not api directly: the server rotates the
        // session on a password change (killing every other token), and the
        // context is what stores the replacement.
        const result = await changePassword(password.current, password.new);
        setChangingPw(false);

        if (result.success) {
            toast.success(result.message || 'Password updated');
            setPassword({ current: '', new: '', confirm: '' });
        } else {
            toast.error(result.message);
        }
    };

    const handleClearMessages = async () => {
        setClearing(true);
        try {
            await api.delete('/messages');
            toast.success('All messages cleared');
            setConfirmClear(false);
        } catch {
            toast.error('Failed to clear messages');
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return <p className="font-body text-[#6B7280]">Loading settings...</p>;
    }

    return (
        <div>
            {/* Page header */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-3">
                    <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                    <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                        Site Settings
                    </span>
                </div>
                <h1 className="font-display text-[clamp(28px,3.5vw,38px)] font-extrabold tracking-[-0.015em]">
                    Settings
                </h1>
                <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-1">
                    Manage security, site info, notifications, and appearance.
                </p>
            </div>

            <div className="space-y-6">
                {/* Account & Security */}
                <div className={CARD}>
                    <SectionHeader
                        icon={FiLock}
                        title="Account & Security"
                        subtitle="Change the password you use to sign in to the admin panel."
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={password.current}
                            onChange={(e) => setPassword({ ...password, current: e.target.value })}
                            placeholder="••••••••"
                        />
                        <Input
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={password.new}
                            onChange={(e) => setPassword({ ...password, new: e.target.value })}
                            placeholder="••••••••"
                            hint="At least 6 characters"
                        />
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={password.confirm}
                            onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="flex justify-end mt-5">
                        <PrimaryButton
                            onClick={handlePasswordChange}
                            className={changingPw ? 'opacity-60 pointer-events-none' : ''}
                        >
                            {changingPw ? 'Updating...' : 'Update Password'}
                        </PrimaryButton>
                    </div>
                </div>

                {/* Site & SEO */}
                <div className={CARD}>
                    <SectionHeader
                        icon={FiGlobe}
                        title="Site & SEO"
                        subtitle="The title and description used in the browser tab and search results."
                    />
                    <div className="space-y-4">
                        <Input
                            label="Site Title"
                            name="siteTitle"
                            value={settings.siteTitle}
                            onChange={(e) => setField('siteTitle', e.target.value)}
                            placeholder="Roomi — Full-Stack Developer"
                        />
                        <TextArea
                            label="Meta Description"
                            name="siteDescription"
                            rows={3}
                            value={settings.siteDescription}
                            onChange={(e) => setField('siteDescription', e.target.value)}
                            placeholder="A short summary of your portfolio for search engines."
                            hint={`${(settings.siteDescription || '').length}/160 characters recommended`}
                        />
                    </div>
                </div>

                {/* Contact & Notifications */}
                <div className={CARD}>
                    <SectionHeader
                        icon={FiMail}
                        title="Contact & Notifications"
                        subtitle="Where contact-form submissions are delivered."
                    />
                    <div className="space-y-5">
                        <Input
                            label="Notification Email"
                            name="notificationEmail"
                            type="email"
                            value={settings.notificationEmail}
                            onChange={(e) => setField('notificationEmail', e.target.value)}
                            placeholder="you@example.com"
                            hint="Leave blank to use the server's default admin email."
                        />
                        <div className="border-t border-[#E7E8EE] dark:border-[#262D3A] pt-5 space-y-4">
                            <Toggle
                                label="Email me on new messages"
                                hint="Send a notification to your inbox whenever someone submits the form."
                                checked={settings.emailNotifications}
                                onChange={(v) => setField('emailNotifications', v)}
                            />
                            <Toggle
                                label="Send an auto-reply to the sender"
                                hint="Automatically confirm receipt to the person who contacted you."
                                checked={settings.autoReply}
                                onChange={(v) => setField('autoReply', v)}
                            />
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className={CARD}>
                    <SectionHeader
                        icon={FiSliders}
                        title="Appearance"
                        subtitle="The default look for visitors of your public site."
                    />
                    <div className="space-y-6">
                        <div>
                            <p className="font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-2">
                                Default theme
                            </p>
                            <div className="inline-flex items-center gap-1 bg-[#F2F3F7] dark:bg-[#1B2230] rounded-full p-1">
                                {THEME_OPTIONS.map((opt) => {
                                    const active = settings.defaultTheme === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setField('defaultTheme', opt.value)}
                                            className={`inline-flex items-center gap-2 font-display text-[13px] font-semibold py-2 px-4 rounded-full transition-all duration-200 ${active
                                                ? 'gradient-bg text-white shadow-[0_6px_16px_-8px_rgb(var(--accent-rgb)_/_0.6)]'
                                                : 'text-[#6B7280] dark:text-[#8A92A3] hover:text-[#14151A] dark:hover:text-[#ECEEF1]'
                                                }`}
                                        >
                                            <opt.icon className="w-4 h-4" strokeWidth={1.75} />
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="font-display text-[13px] font-semibold text-[#6B7280] dark:text-[#8A92A3] mb-3">
                                Accent color
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                                {Object.entries(ACCENT_PRESETS).map(([key, preset]) => {
                                    const active = settings.accent === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => selectAccent(key)}
                                            title={preset.label}
                                            aria-label={preset.label}
                                            className={`relative w-9 h-9 rounded-full transition-transform duration-200 hover:scale-110 ${active
                                                ? 'ring-2 ring-offset-2 ring-accent ring-offset-white dark:ring-offset-[#161B22]'
                                                : ''
                                                }`}
                                            style={{
                                                background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.end} 100%)`,
                                            }}
                                        >
                                            {active && (
                                                <FiCheck
                                                    className="absolute inset-0 m-auto w-4 h-4 text-white"
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <span className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">
                                    Live preview
                                </span>
                                <span className="inline-flex items-center gap-2 font-display text-[13px] font-semibold py-2 px-4 rounded-full gradient-bg text-white">
                                    <FiCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    Accent
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save bar — only when there are unsaved config changes */}
                {isDirty && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-4">
                        <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] sm:mr-auto flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            You have unsaved changes
                        </span>
                        <div className="flex gap-3">
                            <GhostButton onClick={handleReset}>Reset</GhostButton>
                            <PrimaryButton
                                onClick={handleSave}
                                className={saving ? 'opacity-60 pointer-events-none' : ''}
                            >
                                {saving ? 'Saving...' : 'Save changes'}
                            </PrimaryButton>
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="bg-white dark:bg-[#161B22] border border-red-500/30 rounded-[18px] p-6">
                    <SectionHeader
                        icon={FiAlertTriangle}
                        title="Danger Zone"
                        subtitle="Irreversible actions. Proceed with caution."
                        danger
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-red-500/5 border border-red-500/10 p-4">
                        <div>
                            <p className="font-display text-[14px] font-semibold">
                                Clear all messages
                            </p>
                            <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] mt-0.5">
                                Permanently delete every contact-form message. This cannot be undone.
                            </p>
                        </div>
                        <DangerButton onClick={() => setConfirmClear(true)} className="shrink-0">
                            Clear all
                        </DangerButton>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={confirmClear}
                onClose={() => setConfirmClear(false)}
                onConfirm={handleClearMessages}
                title="Clear all messages?"
                message="This permanently deletes every contact-form message. This action cannot be undone."
                isLoading={clearing}
            />
        </div>
    );
};

export default SettingsPage;
