'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency } from '@/lib/helpers';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
  Cloud,
  Plus,
  Trash2,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data, dispatch, exportData, importData, refreshFromCloud, isSyncing } = useAppData();
  const { username: currentUsername, logout, updateCredentials } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Income
  const [income, setIncome] = useState(data.wallet.currentIncome.toString());
  const [incomeDate, setIncomeDate] = useState(data.wallet.incomeUpdateDate);

  // Profile (UI Display Name)
  const [displayName, setDisplayName] = useState(data.userName);

  // Credentials (Login)
  const [loginUser, setLoginUser] = useState(currentUsername);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync state with data when it loads
  useEffect(() => {
    setDisplayName(data.userName);
    setIncome(data.wallet.currentIncome.toString());
    setIncomeDate(data.wallet.incomeUpdateDate);
  }, [data.userName, data.wallet.currentIncome, data.wallet.incomeUpdateDate]);

  useEffect(() => {
    setLoginUser(currentUsername);
  }, [currentUsername]);

  const handleUpdateIncome = () => {
    const parsed = parseFloat(income.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Valor inválido');
      return;
    }
    dispatch({
      type: 'UPDATE_INCOME',
      payload: { income: parsed, updateDate: incomeDate },
    });
    toast.success('Renda atualizada');
  };

  const handleUpdateDisplayName = () => {
    if (!displayName.trim()) {
      toast.error('Informe seu nome');
      return;
    }
    dispatch({ type: 'UPDATE_USERNAME', payload: displayName.trim() });
    toast.success('Nome de exibição atualizado');
  };

  const handleUpdateAuth = async () => {
    if (!loginUser || !oldPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos de acesso');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As novas senhas não coincidem');
      return;
    }
    
    const result = await updateCredentials(loginUser, oldPassword, newPassword);
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
    a.download = `fine-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Backup exportado');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (importData(content)) {
        toast.success('Dados importados com sucesso');
        window.location.reload();
      } else {
        toast.error('Arquivo de backup inválido');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Apagar todos os dados financeiros? Isso não afetará seu login.')) {
      dispatch({ type: 'RESET_DATA' });
      toast.success('Dados resetados');
    }
  };

  // Categories
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#D1D5DB');

  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }
    dispatch({
      type: 'ADD_CATEGORY',
      payload: {
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor,
      },
    });
    setNewCatName('');
    toast.success('Categoria adicionada');
  };

  const handleRemoveCategory = (id: string) => {
    if (window.confirm('Remover esta categoria? Transações existentes não serão apagadas.')) {
      dispatch({ type: 'REMOVE_CATEGORY', payload: id });
      toast.success('Categoria removida');
    }
  };

  return (
    <>
      <Header title="Ajustes" subtitle="Gerencie seu perfil e segurança" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Display Profile */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <User className="w-6 h-6 text-apple-blue" />
              </div>
              <h3 className="text-lg font-bold">Perfil de Exibição</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Seu Nome no App</Label>
                <div className="flex gap-2">
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30" />
                  <Button onClick={handleUpdateDisplayName} className="h-12 rounded-2xl bg-apple-blue text-white px-6 font-bold">Salvar</Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Income */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-apple-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Renda Mensal</h3>
                <p className="text-xs text-muted-foreground font-medium">Atual: {formatCurrency(data.wallet.currentIncome)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Valor (R$)</Label>
                  <Input type="text" value={income} onChange={(e) => setIncome(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Data Recorrência</Label>
                  <Input type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30" />
                </div>
              </div>
              <Button onClick={handleUpdateIncome} className="w-full h-12 rounded-2xl bg-apple-blue text-white font-bold">Atualizar Renda</Button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {/* Categories Management */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold">Gerenciar Categorias</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-secondary/30 rounded-2xl space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nova Categoria</p>
                <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-end">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase ml-1">Ícone</Label>
                     <Input value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} className="w-12 h-12 p-0 text-center text-xl rounded-xl border-0 bg-white dark:bg-zinc-800" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-bold uppercase ml-1">Nome</Label>
                     <Input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Mercado" className="h-12 rounded-xl border-0 bg-white dark:bg-zinc-800" />
                   </div>
                   <div className="space-y-2 text-center">
                     <Label className="text-[10px] font-bold uppercase block">Cor</Label>
                     <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="w-10 h-10 rounded-full border-0 cursor-pointer overflow-hidden bg-transparent" />
                   </div>
                </div>
                <Button onClick={handleAddCategory} className="w-full h-12 rounded-xl bg-apple-blue text-white font-bold gap-2">
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {data.categories?.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-border/40 group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm" style={{ backgroundColor: `${cat.color}20` }}>
                        {cat.icon}
                      </div>
                      <span className="text-sm font-bold">{cat.name}</span>
                    </div>
                    <button onClick={() => handleRemoveCategory(cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Security / Login */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Segurança de Acesso</h3>
                <p className="text-xs text-muted-foreground font-medium">Login sincronizado na nuvem</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Usuário de Login</Label>
                <Input value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Senha Atual</Label>
                <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Nova Senha</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-0" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirmar Nova Senha</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-12 rounded-2xl bg-secondary/50 border-0" />
              </div>
              <Button onClick={handleUpdateAuth} className="w-full h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold">Salvar Credenciais</Button>
            </div>
          </motion.div>

          {/* Cloud Sync */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Cloud className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold">Gerenciar Dados</h3>
            </div>
            <div className="space-y-3">
              <Button onClick={refreshFromCloud} disabled={isSyncing} variant="outline" className="w-full h-12 rounded-2xl justify-start gap-3 font-bold border-border/60">
                <RotateCcw className={`w-4 h-4 text-apple-blue ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar Nuvem
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleExport} variant="outline" className="h-12 rounded-2xl gap-2 font-bold"><Download className="w-4 h-4" /> Exportar</Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-12 rounded-2xl gap-2 font-bold"><Upload className="w-4 h-4" /> Importar</Button>
              </div>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              <Button onClick={handleReset} variant="outline" className="w-full h-12 rounded-2xl justify-start gap-3 text-red-500 font-bold border-red-100 dark:border-red-900/20 hover:bg-red-50">
                <RotateCcw className="w-4 h-4" /> Resetar Finanças
              </Button>
              <Button onClick={logout} variant="outline" className="w-full h-12 rounded-2xl justify-center gap-2 text-red-500 border-red-50 font-bold mt-4">
                <LogOut className="w-4 h-4" /> Sair da Conta
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
