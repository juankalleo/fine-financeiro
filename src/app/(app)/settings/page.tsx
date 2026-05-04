'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency } from '@/lib/helpers';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  User,
  Shield,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data, dispatch, exportData, importData } = useAppData();
  const { logout, updatePassword } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Income
  const [income, setIncome] = useState(data.wallet.currentIncome.toString());
  const [incomeDate, setIncomeDate] = useState(data.wallet.incomeUpdateDate);

  // Name
  const [userName, setUserName] = useState(data.userName);

  // Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateIncome = () => {
    const parsed = parseFloat(income.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (!incomeDate) {
      toast.error('Informe a data de atualização');
      return;
    }
    dispatch({
      type: 'UPDATE_INCOME',
      payload: { income: parsed, updateDate: incomeDate },
    });
    toast.success('Renda atualizada');
  };

  const handleUpdateName = () => {
    if (!userName.trim()) {
      toast.error('Informe seu nome');
      return;
    }
    dispatch({ type: 'UPDATE_USERNAME', payload: userName.trim() });
    toast.success('Nome atualizado');
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos de senha');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    const result = updatePassword(oldPassword, newPassword);
    if (result.success) {
      toast.success(result.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(result.message);
    }
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeapp-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (importData(content)) {
        toast.success('Dados importados com sucesso');
        // Reset form values
        window.location.reload();
      } else {
        toast.error('Arquivo inválido');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza? Todos os dados serão apagados e restaurados aos valores iniciais.')) {
      dispatch({ type: 'RESET_DATA' });
      toast.success('Dados restaurados');
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <Header title="Ajustes" subtitle="Gerencie suas preferências" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <User className="w-6 h-6 text-apple-blue" />
              </div>
              <h3 className="text-lg font-bold">Perfil</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Seu Nome
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                  />
                  <Button
                    onClick={handleUpdateName}
                    className="h-12 rounded-2xl bg-apple-blue hover:bg-apple-blue-dark text-white px-6 font-bold"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Income Settings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-apple-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Renda Mensal</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Atual: {formatCurrency(data.wallet.currentIncome)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Valor (R$)
                  </Label>
                  <Input
                    id="income"
                    type="text"
                    inputMode="decimal"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incomeDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Próxima Atualização
                  </Label>
                  <Input
                    id="incomeDate"
                    type="date"
                    value={incomeDate}
                    onChange={(e) => setIncomeDate(e.target.value)}
                    className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                  />
                </div>
              </div>
              <Button
                onClick={handleUpdateIncome}
                className="w-full h-12 rounded-2xl bg-apple-blue hover:bg-apple-blue-dark text-white shadow-xl shadow-apple-blue/20 font-bold"
              >
                Atualizar Renda
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Security / Password */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Segurança</h3>
                <p className="text-xs text-muted-foreground font-medium">Alterar sua senha de acesso</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPass" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Senha Atual</Label>
                <Input
                  id="oldPass"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPass" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nova Senha</Label>
                <Input
                  id="newPass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPass" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                />
              </div>
              <Button
                onClick={handleChangePassword}
                className="w-full h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition-opacity"
              >
                Alterar Senha
              </Button>
            </div>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Gerenciar Dados</h3>
                <p className="text-xs text-muted-foreground font-medium">Backup e restauração</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full h-12 rounded-2xl justify-start gap-3 font-bold border-border/60"
              >
                <Download className="w-4 h-4 text-apple-blue" />
                Exportar Backup (JSON)
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-12 rounded-2xl justify-start gap-3 font-bold border-border/60"
              >
                <Upload className="w-4 h-4 text-apple-green" />
                Importar Backup (JSON)
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-12 rounded-2xl justify-start gap-3 text-red-500 font-bold border-red-100 dark:border-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <RotateCcw className="w-4 h-4" />
                Resetar Todos os Dados
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="h-10 lg:hidden" />
    </>
  );
}
