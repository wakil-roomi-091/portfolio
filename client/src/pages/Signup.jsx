import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(name, email, password);
    
    if (result.success) {
      toast.success('Account created — check your inbox to confirm your email');
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
          <h1 className="font-display text-3xl font-extrabold">Create Account</h1>
          <p className="font-body text-[#6B7280] dark:text-[#8A92A3] mt-2">
            Join to connect with me
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-display text-sm font-semibold mb-2">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#8A92A3]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E8EE] dark:border-[#262D3A] bg-transparent focus:border-accent focus:outline-none transition-colors"
                placeholder="Your Name"
                required
              />
            </div>
          </div>

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
                placeholder="your@email.com"
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
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full gradient-bg text-white font-display font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating account...' : (
              <>
                <FiLogIn className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-center font-body text-sm text-[#6B7280] mt-6">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="text-accent font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;