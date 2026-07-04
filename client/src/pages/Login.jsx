import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../assets/logo.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please enter email and password');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! ☕');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1920&q=80)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#3A312C]/70 via-[#3A312C]/50 to-[#D9A299]/30 backdrop-blur-[2px]" />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{ x: Math.random() * 800, y: Math.random() * 600, opacity: 0 }}
          animate={{
            y: [null, -100, 100],
            opacity: [0, 0.5, 0],
          }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-elevated">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.img
              src={logo}
              alt="CafeFlow"
              className="h-12 mx-auto mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            />
            <h1 className="text-2xl font-bold text-cafe-text font-display">Welcome Back 👋</h1>
            <p className="text-sm text-cafe-text-muted mt-1">Please login to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border border-cafe-bg-secondary rounded-xl text-sm text-cafe-text placeholder:text-cafe-text-muted focus:outline-none focus:ring-2 focus:ring-cafe-accent/40 focus:border-cafe-accent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-cafe-text-light">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-white/60 border border-cafe-bg-secondary rounded-xl text-sm text-cafe-text placeholder:text-cafe-text-muted focus:outline-none focus:ring-2 focus:ring-cafe-accent/40 focus:border-cafe-accent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-cafe-bg-secondary text-cafe-accent focus:ring-cafe-accent/40"
                />
                <span className="text-xs text-cafe-text-light">Remember me</span>
              </label>
              <button type="button" className="text-xs text-cafe-accent hover:underline">
                Forgot Password?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-cafe-accent hover:bg-cafe-accent-hover text-white font-semibold rounded-xl shadow-soft transition-all duration-200 disabled:opacity-60 btn-ripple text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </motion.button>
          </form>

          <p className="text-center text-xs text-cafe-text-muted mt-6">
            © {new Date().getFullYear()} CafeFlow. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
