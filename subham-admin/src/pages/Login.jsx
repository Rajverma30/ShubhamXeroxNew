/**
 * Admin sign-in. Single account, no registration link — credentials are
 * bootstrapped by the backend seeder and changeable from the profile page.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Logo, Spinner } from '../components/Ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const admin = await login(values);
      toast(`Welcome back, ${admin.name || admin.username}`);
      navigate(searchParams.get('next') || '/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-10">
      {/* backdrop */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-7 text-center">
          <div className="mb-5 flex justify-center"><Logo dark showText={false} className="h-14 w-14" /></div>
          <h1 className="font-display text-2xl font-bold text-white">Subham Xerox</h1>
          <p className="mt-1.5 text-sm text-white/50">Sign in to the admin panel</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
          {serverError && (
            <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/15 px-3.5 py-2.5 text-xs font-medium text-rose-200">
              {serverError}
            </p>
          )}

          <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-white/70">Username</label>
          <div className="relative">
            <FiUser size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              id="username"
              autoComplete="username"
              autoFocus
              {...register('username', { required: 'Username is required' })}
              className="w-full rounded-xl border border-white/15 bg-white/[0.07] py-3 pl-10 pr-3.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-400 focus:bg-white/10"
              placeholder="admin"
            />
          </div>
          {errors.username && <p className="mt-1 text-2xs text-rose-300">{errors.username.message}</p>}

          <label htmlFor="password" className="mb-1.5 mt-4 block text-xs font-semibold text-white/70">Password</label>
          <div className="relative">
            <FiLock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
              className="w-full rounded-xl border border-white/15 bg-white/[0.07] py-3 pl-10 pr-11 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-brand-400 focus:bg-white/10"
              placeholder="••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
            >
              {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-2xs text-rose-300">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-ink-900 transition-all duration-200 hover:bg-white/90 disabled:opacity-60"
          >
            {isSubmitting ? <Spinner size={15} /> : <><FiLogIn size={16} /> Sign in</>}
          </button>
        </form>

        <p className="mt-5 text-center text-2xs leading-relaxed text-white/35">
          Default credentials after seeding are <span className="font-semibold text-white/60">admin / admin</span>.
          <br />Change them from <span className="font-semibold text-white/60">My profile</span> after your first sign-in.
        </p>
      </motion.div>
    </div>
  );
}
