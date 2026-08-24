import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading = false }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title || 'Delete this item?'}
            onConfirm={onConfirm}
            confirmLabel="Delete"
            isDanger={true}
            isLoading={isLoading}
        >
            <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">
                {message || 'This action cannot be undone. Are you sure you want to delete this item?'}
            </p>
        </Modal>
    );
};

export default ConfirmDialog;