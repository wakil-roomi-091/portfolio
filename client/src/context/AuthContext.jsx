import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import logError from '../utils/logError';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Only the token is persisted. The user's name/email/role are held in React
    // state and re-fetched from /auth/me on load — keeping PII out of
    // localStorage, where any script on the page (or an XSS payload) can read it.
    useEffect(() => {
        // Clear the `userData` blob written by earlier versions of this app, so
        // existing browsers don't keep a copy of the name and email forever.
        try {
            localStorage.removeItem('userData');
        } catch { /* ignore */ }

        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            return;
        }

        let active = true;
        (async () => {
            try {
                const res = await api.get('/auth/me');
                if (!active) return;
                setUser(res.data);
                setIsAdmin(res.data.role === 'admin');
            } catch (error) {
                if (!active) return;
                // Expired or invalid token — fall back to the logged-out state.
                localStorage.removeItem('authToken');
                delete api.defaults.headers.common['Authorization'];
                if (error?.response?.status !== 401) {
                    logError('auth/restore-session', error);
                }
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            const { token, user: userData } = response.data;

            localStorage.setItem('authToken', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(userData);
            setIsAdmin(userData.role === 'admin');

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user: userData } = response.data;

            localStorage.setItem('authToken', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(userData);
            setIsAdmin(userData.role === 'admin');

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData'); // legacy key — see the effect above
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAdmin(false);
    };

    // Re-reads the account from the server. Used after an action that changes it
    // server-side (confirming an email), since `user` is React state, not a
    // cached copy in storage.
    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            setIsAdmin(res.data.role === 'admin');
            return true;
        } catch (error) {
            logError('auth/refresh', error);
            return false;
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const res = await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });

            // Changing the password invalidates every token issued before it —
            // including the one this tab is holding. The server hands back a
            // fresh one; store it or the very next request would 401.
            const token = res.data?.token;
            if (token) {
                localStorage.setItem('authToken', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            return { success: true, message: res.data?.message };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message || 'Failed to update password'
            };
        }
    };

    // Sends a new confirmation link. The server always mails the address on the
    // account, never one supplied by the caller.
    const resendVerification = async () => {
        try {
            const res = await api.post('/auth/resend-verification');
            return { success: true, message: res.data?.message };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    'Could not send the verification email'
            };
        }
    };

    // Permanently erases the account. The server deletes the User document and
    // anonymizes any contact messages it sent, so nothing personal is left.
    const deleteAccount = async () => {
        try {
            const res = await api.delete('/auth/me');
            logout();
            return { success: true, message: res.data?.message };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message || 'Could not delete your account'
            };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAdmin,
                register,
                login,
                logout,
                refreshUser,
                changePassword,
                resendVerification,
                deleteAccount
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
