import { useEffect, useState } from 'react';
import { FiCheckCircle, FiTrash2, FiMail, FiInbox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmDialog from './ConfirmDialog';
import Badge from './Badge';
import Modal from './Modal';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/messages');
            setMessages(res.data);
        } catch (error) {
            toast.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/messages/${id}/read`);
            toast.success('Marked as read');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await api.delete(`/messages/${deleteTarget}`);
            toast.success('Message deleted');
            fetchMessages();
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleViewMessage = (msg) => {
        setSelectedMessage(msg);
        setViewModalOpen(true);
        if (!msg.isRead) {
            markAsRead(msg._id);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name) => {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const filteredMessages = messages.filter((msg) => {
        if (filter === 'unread') return !msg.isRead;
        if (filter === 'read') return msg.isRead;
        return true;
    });

    const unreadCount = messages.filter((m) => !m.isRead).length;

    const filterTabs = [
        { value: 'all', label: 'All', icon: FiInbox },
        { value: 'unread', label: 'Unread', icon: FiMail, count: unreadCount },
        { value: 'read', label: 'Read', icon: FiMail },
    ];

    return (
        <div>
            {/* ===== PAGE HEADER ===== */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2.5 gradient-soft rounded-full py-[7px] pr-4 pl-2.5 mb-3">
                            <span className="w-[7px] h-[7px] rounded-full gradient-bg" />
                            <span className="font-display text-[13px] font-semibold tracking-[0.16em] uppercase text-accent">
                                Inbox
                            </span>
                        </div>
                        <h1 className="font-display text-[clamp(28px,3.5vw,38px)] font-extrabold tracking-[-0.015em]">
                            Messages
                        </h1>
                        <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-1">
                            View and manage contact form submissions. {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}.
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== FILTER TABS ===== */}
            <div className="flex flex-wrap gap-2 mb-6">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-display text-sm font-semibold transition-all duration-200 ${filter === tab.value
                                ? 'gradient-bg text-white shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)_/_0.5)]'
                                : 'bg-[#F2F3F7] dark:bg-[#1B2230] text-[#6B7280] dark:text-[#8A92A3] hover:bg-[#E7E8EE] dark:hover:bg-[#262D3A]'
                            }`}
                    >
                        <tab.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`ml-1 text-xs ${filter === tab.value ? 'text-white/80' : 'text-accent'
                                }`}>
                                ({tab.count})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ===== MESSAGES LIST ===== */}
            {loading ? (
                <p className="font-body text-[#6B7280]">Loading messages...</p>
            ) : filteredMessages.length === 0 ? (
                <div className="bg-white dark:bg-[#161B22] border border-[#E7E8EE] dark:border-[#262D3A] rounded-[18px] p-12 text-center">
                    <FiMail className="w-12 h-12 mx-auto text-[#6B7280] mb-4" strokeWidth={1.5} />
                    <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">
                        {filter === 'all' && 'No messages yet.'}
                        {filter === 'unread' && 'No unread messages. 🎉'}
                        {filter === 'read' && 'No read messages.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg._id}
                            onClick={() => handleViewMessage(msg)}
                            className={`bg-white dark:bg-[#161B22] rounded-[18px] border p-5 transition-all duration-200 cursor-pointer hover:shadow-md ${msg.isRead
                                    ? 'border-[#E7E8EE] dark:border-[#262D3A]'
                                    : 'border-accent dark:border-accent bg-[#FAFAFB] dark:bg-[#0E1117]'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full gradient-soft flex items-center justify-center shrink-0">
                                    <span className="font-display text-sm font-bold text-accent">
                                        {getInitials(msg.name)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="font-display text-sm font-semibold">{msg.name}</span>
                                        <span className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">
                                            {msg.email}
                                        </span>
                                        {!msg.isRead && (
                                            <Badge tone="green" className="text-[10px]">New</Badge>
                                        )}
                                        <span className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3] ml-auto">
                                            {formatDate(msg.createdAt)}
                                        </span>
                                    </div>
                                    <p className="font-display text-sm font-semibold text-accent mt-0.5">
                                        {msg.subject}
                                    </p>
                                    <p className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3] truncate">
                                        {msg.message}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {!msg.isRead && (
                                        <button
                                            onClick={() => markAsRead(msg._id)}
                                            className="p-2 rounded-lg hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] transition-colors"
                                            title="Mark as read"
                                        >
                                            <FiCheckCircle className="w-4 h-4 text-accent-end" strokeWidth={1.5} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setDeleteTarget(msg._id)}
                                        className="p-2 rounded-lg hover:bg-[#F2F3F7] dark:hover:bg-[#1B2230] transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="w-4 h-4 text-red-500" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== VIEW MESSAGE MODAL ===== */}
            <Modal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                title="Message"
                onConfirm={() => setViewModalOpen(false)}
                confirmLabel="Close"
            >
                {selectedMessage && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="font-display text-lg font-bold">{selectedMessage.name}</span>
                            <span className="font-body text-sm text-[#6B7280] dark:text-[#8A92A3]">
                                {selectedMessage.email}
                            </span>
                            {!selectedMessage.isRead && (
                                <Badge tone="green">New</Badge>
                            )}
                        </div>
                        <p className="font-display text-sm font-semibold text-accent">
                            Subject: {selectedMessage.subject}
                        </p>
                        <div className="bg-[#F2F3F7] dark:bg-[#1B2230] rounded-xl p-4">
                            <p className="font-body text-sm whitespace-pre-wrap">
                                {selectedMessage.message}
                            </p>
                        </div>
                        <p className="font-body text-xs text-[#6B7280] dark:text-[#8A92A3]">
                            Received: {formatDate(selectedMessage.createdAt)}
                        </p>
                    </div>
                )}
            </Modal>

            {/* ===== CONFIRM DELETE DIALOG ===== */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete this message?"
                message="This action cannot be undone. This message will be permanently removed from your inbox."
                isLoading={isDeleting}
            />
        </div>
    );
};

export default AdminMessages;