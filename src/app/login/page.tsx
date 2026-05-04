'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate a slight delay for UX
    await new Promise((r) => setTimeout(r, 600));

    const success = await login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Usuário ou senha incorretos');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-blue px-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white rounded-full blur-[160px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-white rounded-full blur-[160px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-20 h-20 rounded-[28px] bg-white flex items-center justify-center shadow-2xl shadow-black/20 mb-6 overflow-hidden border-4 border-white/20">
             <Image src="/icons/icon-192.png" alt="Fine" width={80} height={80} className="object-cover" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Fine
          </h1>
          <p className="text-xs text-white/70 mt-1 font-black uppercase tracking-[0.2em]">
            SaaS Financeiro
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-[40px] p-8 shadow-2xl shadow-black/20 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-apple-blue/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-apple-blue" />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground uppercase tracking-tight">
                Acesso Seguro
              </h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wide">
                Identifique-se para entrar
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="h-14 rounded-2xl bg-secondary/50 border-0 text-base pl-12 pr-4 placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-apple-blue/30 transition-all font-bold"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="h-14 rounded-2xl bg-secondary/50 border-0 text-base pl-12 pr-12 placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-apple-blue/30 transition-all font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 font-black text-center uppercase tracking-wider"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={!username || !password || isLoading}
              className="w-full h-14 rounded-2xl bg-apple-blue hover:bg-apple-blue-dark text-white font-black text-base shadow-xl shadow-apple-blue/30 transition-all duration-300 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  ENTRAR
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
