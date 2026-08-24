import { useAuth } from '../../context/AuthContext';

const ProtectedContent = ({ children, fallback }) => {
    const { user } = useAuth();

    if (!user) {
        return fallback || (
            <div className="text-center py-8">
                <p className="font-body text-[#6B7280] dark:text-[#8A92A3]">
                    🔒 Please <a href="/login" className="text-accent hover:underline">login</a> to view this content.
                </p>
            </div>
        );
    }

    return children;
};

export default ProtectedContent;