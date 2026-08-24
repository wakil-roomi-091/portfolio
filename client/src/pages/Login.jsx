import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Return the visitor to wherever they were gated (e.g. the contact form).
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate(from);
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFB] dark:bg-[#0E1117] px-4 pt-20">
      <div className="w-full max-w-md bg-white dark:bg-[#161B22] rounded-2xl border border-[#E7E8EE] dark:border-[#262D3A] p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold">Welcome Back</h1>
          <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-2">
            Sign in to access all features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-display text-sm font-semibold mb-2">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#8A92A3]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-transparent focus:border-accent focus:outline-none transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-display text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#8A92A3]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-transparent focus:border-accent focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full gradient-bg text-white font-display font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Signing in...' : (
              <>
                <FiLogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-center font-body text-sm text-[#6B7280] mt-6">
          Don't have an account?{' '}
          <Link to="/signup" state={{ from }} className="text-accent font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;