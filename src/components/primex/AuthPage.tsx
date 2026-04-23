'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store';
import {
  Eye, EyeOff, Play, Shield, Zap, Users, Film,
  Heart, MessageCircle, Crown, Star
} from 'lucide-react';

const features = [
  { icon: Film, title: 'Long Videos', desc: '4K quality streaming with adaptive bitrate' },
  { icon: Play, title: 'Short Reels', desc: 'Instagram-style vertical short videos' },
  { icon: Heart, title: 'Private Content', desc: 'Friends-only exclusive content access' },
  { icon: MessageCircle, title: 'Real-time Chat', desc: 'Message friends instantly with WebSocket' },
  { icon: Crown, title: 'Creator Badges', desc: 'Earn badges as your content grows' },
  { icon: Star, title: 'Analytics', desc: 'Track views, engagement & performance' },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { login } = useAppStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.accessToken);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: regPassword }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.accessToken);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-primex-hero relative overflow-hidden">
      {/* Background effects with bg-mesh */}
      <div className="absolute inset-0 bg-mesh overflow-hidden">
        {/* Decorative orbs */}
        <div className="orb-primex absolute top-1/4 left-1/4 float-slow" />
        <div className="orb-primex-sm absolute bottom-1/3 right-1/4 float-medium" />
        <div className="orb-primex-md absolute top-1/2 right-1/3 float-slow" />
        <div className="orb-primex-lg absolute bottom-1/4 left-1/3 float-medium" />
      </div>

      {/* Left panel - Features (desktop only) */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <img src="/primex-logo.png" alt="PrimeX" className="w-14 h-14 rounded-2xl glow-effect shadow-xl object-contain" />
            <h1 className="text-5xl font-bold text-shimmer">PrimeX</h1>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            The Future of <span className="text-gradient-animated">Video & Social</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Watch long videos, scroll reels, connect with friends, and share exclusive content. 
            No subscriptions. No paywalls. Just pure entertainment.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-card-premium p-4 rounded-xl hover-lift card-shine"
              >
                <div className="w-9 h-9 rounded-lg bg-primex/10 flex items-center justify-center mb-2">
                  <f.icon className="w-4 h-4 text-primex" />
                </div>
                <p className="font-medium text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="text-center mb-6 lg:hidden">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-3 mb-3"
            >
              <img src="/primex-logo.png" alt="PrimeX" className="w-12 h-12 rounded-xl glow-effect object-contain" />
              <h1 className="text-4xl font-bold text-shimmer">PrimeX</h1>
            </motion.div>
            <p className="text-gradient-animated text-sm font-medium">
              The ultimate video & social platform
            </p>
          </div>

          {/* Auth Card with glass-card-premium and gradient-border-primex */}
          <div className="glass-card-premium gradient-border-primex p-6 lg:p-8">
            <h2 className="text-xl font-bold mb-1 hidden lg:block">
              {isLogin ? 'Welcome back' : 'Join PrimeX'}
            </h2>
            <p className="text-sm text-muted-foreground mb-5 hidden lg:block">
              {isLogin ? 'Sign in to continue' : 'Create your account to get started'}
            </p>

            {/* Tab Toggle */}
            <div className="flex rounded-xl bg-muted/50 p-1 mb-5">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isLogin ? 'primex-gradient text-white shadow-lg glow-effect' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !isLogin ? 'primex-gradient text-white shadow-lg glow-effect' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm notification-pop"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Email or Username</Label>
                    <Input
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="Enter email or username"
                      className="glass-input h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="glass-input h-11 rounded-xl pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primex transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl btn-primex hover-lift"
                  >
                    {loading ? (
                      <div className="spinner-primex-sm" style={{ borderTopColor: 'white', border: '2px solid rgba(255,255,255,0.3)' }} />
                    ) : 'Sign In'}
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRegister}
                  className="space-y-3"
                >
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="glass-input h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="glass-input h-11 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="glass-input h-11 rounded-xl pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primex transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1.5 block">Confirm Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="glass-input h-11 rounded-xl"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl btn-primex hover-lift"
                  >
                    {loading ? (
                      <div className="spinner-primex-sm" style={{ borderTopColor: 'white', border: '2px solid rgba(255,255,255,0.3)' }} />
                    ) : 'Create Account'}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom badges */}
          <div className="mt-6 grid grid-cols-3 gap-2 lg:hidden">
            <div className="glass-card-premium p-2.5 text-center rounded-xl hover-lift">
              <Shield className="w-4 h-4 mx-auto mb-1 text-primex" />
              <span className="text-[10px] text-muted-foreground">Secure</span>
            </div>
            <div className="glass-card-premium p-2.5 text-center rounded-xl hover-lift">
              <Zap className="w-4 h-4 mx-auto mb-1 text-primex" />
              <span className="text-[10px] text-muted-foreground">Fast</span>
            </div>
            <div className="glass-card-premium p-2.5 text-center rounded-xl hover-lift">
              <Users className="w-4 h-4 mx-auto mb-1 text-primex" />
              <span className="text-[10px] text-muted-foreground">Social</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
