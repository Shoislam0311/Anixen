import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import AniXenLogo from '@/components/layout/AniXenLogo';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { register, authLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName || !email || !password) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const success = await register(email, password, displayName);
    if (success) {
      setRegistered(true);
      setDisplayName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <AniXenLogo className="h-10 w-auto" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {registered ? 'Verify Your Email' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        {registered ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <p className="text-gray-300">
              We've sent a verification email to your inbox. Please click the link in the email to verify your account.
            </p>
            <Button
              onClick={() => { setRegistered(false); onSwitchToLogin(); }}
              className="bg-[#ff4444] hover:bg-[#ff3333] text-white"
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-gray-400">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="pl-10 bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
            </div>
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
                  placeholder="Min 6 characters"
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
            <div className="space-y-2">
              <Label className="text-gray-400">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
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
              {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#ff4444] hover:text-[#ff5555] font-medium"
              >
                Sign In
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
