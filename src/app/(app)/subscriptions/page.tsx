'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, getDaysUntilBilling, formatDate, maskCurrency } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Subscription } from '@/lib/data/types';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { data, dispatch } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  const activeSubscriptions = data.subscriptions.filter((s) => s.active);
  const inactiveSubscriptions = data.subscriptions.filter((s) => !s.active);
  const totalMonthly = activeSubscriptions.reduce(
    (acc, s) => acc + s.amount,
    0
  );

  const handleDelete = (id: string) => {
    dispatch({ type: 'REMOVE_SUBSCRIPTION', payload: id });
    toast.success('Assinatura removida');
  };

  const handleEdit = (sub: Subscription) => {
    setEditing(sub);
    setShowForm(true);
  };

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState('1');
  const [icon, setIcon] = useState('💳');
  const [isCredit, setIsCredit] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentValue, setInstallmentValue] = useState('');

  const resetLocalForm = () => {
    setName('');
    setAmount('');
    setBillingDay('1');
    setIcon('💳');
    setIsAdding(false);
    setIsCredit(false);
    setTotalAmount('');
    setInstallmentValue('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    const parsedDay = parseInt(billingDay);

    if (!name.trim()) return toast.error('Informe o nome');
    if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error('Valor inválido');
    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) return toast.error('Dia inválido');

    dispatch({
      type: 'ADD_SUBSCRIPTION',
      payload: {
        name: name.trim(),
        amount: parsedAmount,
        billingDay: parsedDay,
        icon,
        active: true,
        isCredit,
        totalAmount: isCredit ? parseFloat(totalAmount.replace(',', '.')) : undefined,
        installmentValue: isCredit ? parseFloat(installmentValue.replace(',', '.')) : undefined,
      },
    });
    toast.success('Assinatura adicionada');
    resetLocalForm();
  };

  return (
    <>
      {/* Hero Section - Dynamic & Expandable */}
      <motion.div
        initial={false}
        animate={{
          height: isAdding ? 'auto' : 'auto',
          marginBottom: isAdding ? '2rem' : '2rem'
        }}
        className="-mx-6 -mt-8 overflow-hidden"
      >
        <div className="relative bg-gradient-to-br from-apple-blue to-sky-600 rounded-b-[40px] px-6 pb-10 pt-safe-plus-40 text-white shadow-2xl shadow-apple-blue/20">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />

          <div className="relative z-10">
            {/* Header Top Row */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.back()}
                className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all ${isAdding ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="text-center absolute left-1/2 -translate-x-1/2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {isAdding ? 'Nova Assinatura' : 'Assinaturas'}
                </p>
                <p className="text-xs font-bold">{formatDate(new Date().toISOString())}</p>
              </div>

              <button
                onClick={() => isAdding ? resetLocalForm() : null}
                className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all ${!isAdding ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Gasto Mensal</p>
              <h1 className="text-5xl font-black tracking-tighter">
                {formatCurrency(totalMonthly)}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  {activeSubscriptions.length} serviços ativos
                </span>
              </div>
            </div>

            <AnimatePresence>
              {!isAdding ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-8 flex justify-center"
                >
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="h-14 px-8 rounded-2xl bg-white text-apple-blue hover:bg-white/90 font-black shadow-xl shadow-black/10 gap-2 text-sm uppercase tracking-tight"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Assinatura
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleAddSubmit}
                  className="overflow-hidden mt-8 space-y-6"
                >
                  <div className="h-px bg-white/10 w-full mb-6" />

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Serviço</Label>
                      <div className="flex gap-2">
                        <Input
                          value={icon}
                          onChange={(e) => setIcon(e.target.value)}
                          className="w-14 h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-2xl focus:ring-white/30"
                          placeholder="🎬"
                        />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30 flex-1"
                          placeholder="Ex: Netflix, Spotify..."
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Valor (R$)</Label>
                        <Input
                          value={amount}
                          onChange={(e) => setAmount(maskCurrency(e.target.value))}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                          placeholder="0,00"
                          inputMode="decimal"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Dia Cobrança</Label>
                        <Input
                          value={billingDay}
                          onChange={(e) => setBillingDay(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                          placeholder="1"
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/70">Assinatura no Crédito</Label>
                        <input
                          type="checkbox"
                          checked={isCredit}
                          onChange={(e) => setIsCredit(e.target.checked)}
                          className="w-5 h-5 rounded-lg bg-white/10 border-white/20 text-apple-blue focus:ring-apple-blue/30"
                        />
                      </div>

                      {isCredit && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Valor Total</Label>
                            <Input
                              value={totalAmount}
                              onChange={(e) => setTotalAmount(maskCurrency(e.target.value))}
                              className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                              placeholder="0,00"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Valor da Parcela</Label>
                            <Input
                              value={installmentValue}
                              onChange={(e) => setInstallmentValue(maskCurrency(e.target.value))}
                              className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                              placeholder="0,00"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      variant="ghost"
                      className="flex-1 h-14 rounded-2xl text-white hover:bg-white/10 font-bold uppercase text-xs"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-14 rounded-2xl bg-white text-apple-blue hover:bg-white/90 font-black shadow-xl shadow-black/10 uppercase text-xs"
                    >
                      Salvar Assinatura
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Active Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-semibold text-foreground">Ativas</h3>
          </div>

          <div className="divide-y divide-border/30">
            <AnimatePresence>
              {activeSubscriptions.map((sub, i) => {
                const daysUntil = getDaysUntilBilling(sub.billingDay);
                const isUrgent = daysUntil <= 5;
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-secondary/60 flex items-center justify-center text-xl shrink-0">
                      {sub.icon || '💳'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {sub.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isUrgent ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0 h-4 rounded-md"
                          >
                            <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                            {daysUntil === 0
                              ? 'Hoje'
                              : `${daysUntil}d restantes`}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Dia {sub.billingDay} • {daysUntil}d
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(sub.amount)}
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {activeSubscriptions.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma assinatura ativa
              </div>
            )}
          </div>
        </motion.div>

        {/* Inactive Subscriptions */}
        {inactiveSubscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border/40">
              <h3 className="text-base font-semibold text-muted-foreground">
                Inativas
              </h3>
            </div>
            <div className="divide-y divide-border/30">
              {inactiveSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 px-6 py-4 opacity-50"
                >
                  <div className="w-11 h-11 rounded-2xl bg-secondary/40 flex items-center justify-center text-xl shrink-0">
                    {sub.icon || '💳'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {sub.name}
                    </p>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Cancelada
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {formatCurrency(sub.amount)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <SubscriptionFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        editing={editing}
      />
    </>
  );
}

function SubscriptionFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Subscription | null;
}) {
  const { dispatch } = useAppData();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingDay, setBillingDay] = useState('1');
  const [icon, setIcon] = useState('💳');
  const [active, setActive] = useState(true);
  const [isCredit, setIsCredit] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentValue, setInstallmentValue] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Reset form when editing changes
  const resetForm = () => {
    if (editing) {
      setName(editing.name);
      setAmount(editing.amount.toString());
      setBillingDay(editing.billingDay.toString());
      setIcon(editing.icon || '💳');
      setActive(editing.active);
      setIsCredit(editing.isCredit || false);
      setTotalAmount(editing.totalAmount?.toString() || '');
      setInstallmentValue(editing.installmentValue?.toString() || '');
      setCategoryId(editing.categoryId || '');
    } else {
      setName('');
      setAmount('');
      setBillingDay('1');
      setIcon('💳');
      setActive(true);
      setIsCredit(false);
      setTotalAmount('');
      setInstallmentValue('');
      setCategoryId('');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => resetForm());

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    const parsedDay = parseInt(billingDay);

    if (!name.trim()) {
      toast.error('Informe o nome');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) {
      toast.error('Dia inválido (1-31)');
      return;
    }

    if (editing) {
      dispatch({
        type: 'UPDATE_SUBSCRIPTION',
        payload: {
          ...editing,
          name: name.trim(),
          amount: parsedAmount,
          billingDay: parsedDay,
          icon,
          active,
          isCredit,
          totalAmount: isCredit ? parseFloat(totalAmount.replace(/\./g, '').replace(',', '.')) : undefined,
          installmentValue: isCredit ? parseFloat(installmentValue.replace(/\./g, '').replace(',', '.')) : undefined,
          categoryId: categoryId || undefined,
        },
      });
      toast.success('Assinatura atualizada');
    } else {
      dispatch({
        type: 'ADD_SUBSCRIPTION',
        payload: {
          name: name.trim(),
          amount: parsedAmount,
          billingDay: parsedDay,
          icon,
          active: true,
          isCredit,
          totalAmount: isCredit ? parseFloat(totalAmount.replace(/\./g, '').replace(',', '.')) : undefined,
          installmentValue: isCredit ? parseFloat(installmentValue.replace(/\./g, '').replace(',', '.')) : undefined,
          categoryId: categoryId || undefined,
        },
      });
      toast.success('Assinatura adicionada');
    }

    onOpenChange(false);
  };

  const icons = ['💳', '🎬', '🎵', '☁️', '🤖', '📺', '🎮', '📖', '🏋️', '🔒', '📧', '💼'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl border-border/40 p-0 overflow-hidden">
        <div className="gradient-blue px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {editing ? 'Editar Assinatura' : 'Nova Assinatura'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Icon Picker */}
          <div className="space-y-2">
            <Label htmlFor="subIcon" className="text-sm font-medium">Ícone (Emoji, Texto ou URL)</Label>
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-2xl shrink-0">
                {icon.startsWith('http') ? <img src={icon} alt="" className="w-full h-full object-cover rounded-xl" /> : icon}
              </div>
              <Input
                id="subIcon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ex: 🎬 ou Netflix"
                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subName" className="text-sm font-medium">
              Nome
            </Label>
            <Input
              id="subName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Netflix, Spotify..."
              className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="subAmount" className="text-sm font-medium">
                Valor (R$)
              </Label>
              <Input
                id="subAmount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(maskCurrency(e.target.value))}
                placeholder="0,00"
                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subDay" className="text-sm font-medium">
                Dia de Cobrança
              </Label>
              <Input
                id="subDay"
                type="number"
                min="1"
                max="31"
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
              />
            </div>
          </div>
          <div className="space-y-4 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <Label className="text-sm font-medium">Assinatura no Crédito</Label>
              <input
                type="checkbox"
                checked={isCredit}
                onChange={(e) => setIsCredit(e.target.checked)}
                className="w-5 h-5 rounded-lg border-border/40 text-apple-blue focus:ring-apple-blue/30"
              />
            </div>

            {isCredit && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase ml-1">Valor Total</Label>
                  <Input
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(maskCurrency(e.target.value))}
                    className="h-11 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase ml-1">Parcela</Label>
                  <Input
                    value={installmentValue}
                    onChange={(e) => setInstallmentValue(maskCurrency(e.target.value))}
                    className="h-11 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
                    placeholder="0,00"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-apple-blue hover:bg-apple-blue-dark text-white shadow-lg shadow-apple-blue/20"
            >
              {editing ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
