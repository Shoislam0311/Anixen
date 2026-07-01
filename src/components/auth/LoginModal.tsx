import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AniXenLogo from '@/components/layout/AniXenLogo';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const { login, forgotPassword, authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const success = await login(email, password);
    if (success) {
      onClose();
      setEmail('');
      setPassword('');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const success = await forgotPassword(forgotEmail);
    if (success) setForgotSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <AniXenLogo className="h-10 w-auto" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {forgotMode ? 'Reset Password' : 'Welcome Back'}
          </DialogTitle>
        </DialogHeader>

        {forgotMode ? (
          <form onSubmit={handleForgot} className="space-y-4 mt-4">
            {forgotSent ? (
              <div className="text-center py-4">
                <p className="text-green-400">Password reset email sent! Check your inbox.</p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setForgotMode(false); setForgotSent(false); }}
                  className="mt-2 text-[#ff4444] hover:text-[#ff5555]"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-gray-400">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#ff4444] hover:bg-[#ff3333] text-white"
                >
                  {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setForgotMode(false)}
                  className="w-full text-gray-400 hover:text-white"
                >
                  Back to Login
                </Button>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-sm text-[#ff4444] hover:text-[#ff5555]"
              >
                Forgot password?
              </button>
            </div>
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#ff4444] hover:bg-[#ff3333] text-white"
            >
              {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#ff4444] hover:text-[#ff5555] font-medium"
              >
                Get Started
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
