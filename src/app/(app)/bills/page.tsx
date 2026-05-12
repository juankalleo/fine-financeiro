'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, getDaysUntil, formatDate, maskCurrency } from '@/lib/helpers';
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
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  ChevronLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Bill } from '@/lib/data/types';

export default function BillsPage() {
  const router = useRouter();
  const { data, dispatch } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);

  const pendingBills = data.bills.filter((b) => !b.paid);
  const paidBills = data.bills.filter((b) => b.paid);
  const totalPending = pendingBills.reduce((acc, b) => acc + b.amount, 0);

  const handleDelete = (id: string) => {
    dispatch({ type: 'REMOVE_BILL', payload: id });
    toast.success('Conta removida');
  };

  const handlePay = (id: string) => {
    dispatch({ type: 'PAY_BILL', payload: id });
    toast.success('Conta paga com sucesso');
  };

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceDay, setRecurrenceDay] = useState('');
  const [icon, setIcon] = useState('📄');
  const [isCredit, setIsCredit] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentValue, setInstallmentValue] = useState('');

  const resetLocalForm = () => {
    setName('');
    setAmount('');
    setDueDate('');
    setRecurring(false);
    setRecurrenceDay('');
    setIcon('📄');
    setIsAdding(false);
    setIsCredit(false);
    setTotalAmount('');
    setInstallmentValue('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (!name.trim()) return toast.error('Informe o nome');
    if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error('Valor inválido');
    if (!dueDate) return toast.error('Informe a data');

    dispatch({
      type: 'ADD_BILL',
      payload: {
        name: name.trim(),
        amount: parsedAmount,
        dueDate,
        paid: false,
        recurring,
        recurrenceDay: recurring ? parseInt(recurrenceDay) || undefined : undefined,
        icon,
        isCredit,
        totalAmount: isCredit ? parseFloat(totalAmount.replace(',', '.')) : undefined,
        installmentValue: isCredit ? parseFloat(installmentValue.replace(',', '.')) : undefined,
      },
    });
    toast.success('Conta adicionada');
    resetLocalForm();
  };

  return (
    <>
      {/* Hero Section - Dynamic & Expandable */}
      <motion.div
        initial={false}
        animate={{
          marginBottom: isAdding ? '2rem' : '2rem'
        }}
        className="-mx-6 -mt-8 overflow-hidden"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-apple-orange to-amber-500 rounded-b-[40px] px-6 pb-10 pt-safe-plus-40 text-white shadow-2xl shadow-apple-orange/20">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.back()}
                className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10 transition-all ${isAdding ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div className="text-center absolute left-1/2 -translate-x-1/2">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {isAdding ? 'Nova Conta' : 'Contas'}
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
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Pendente</p>
              <h1 className="text-5xl font-black tracking-tighter">
                {formatCurrency(totalPending)}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  {pendingBills.length} pendências para pagar
                </span>
              </div>
            </div>

            <AnimatePresence>
              {!isAdding ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-10 flex justify-center"
                >
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="h-14 px-8 rounded-2xl bg-white text-apple-orange hover:bg-white/90 font-black shadow-xl shadow-black/10 gap-2 text-sm uppercase tracking-tight"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Conta
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
                          placeholder="📄"
                        />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30 flex-1"
                          placeholder="Ex: Energia, Internet..."
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
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Vencimento</Label>
                        <Input
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                          type="date"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between p-3 bg-white/10 rounded-2xl">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/70">Pagamento no Crédito</Label>
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
                      className="flex-1 h-14 rounded-2xl bg-white text-apple-orange hover:bg-white/90 font-black shadow-xl shadow-black/10 uppercase text-xs"
                    >
                      Salvar Conta
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Pending Bills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border/40">
            <h3 className="text-base font-semibold text-foreground">
              Pendentes
            </h3>
          </div>

          <div className="divide-y divide-border/30">
            <AnimatePresence>
              {pendingBills.map((bill, i) => {
                const daysUntil = getDaysUntil(bill.dueDate);
                const isOverdue = daysUntil < 0;
                const isUrgent = daysUntil >= 0 && daysUntil <= 3;
                return (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-secondary/60 flex items-center justify-center text-xl shrink-0">
                      {bill.icon || '📄'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {bill.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isOverdue ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0 h-4 rounded-md"
                          >
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                            Vencida
                          </Badge>
                        ) : isUrgent ? (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-100">
                            <Clock className="w-2.5 h-2.5 mr-0.5" />
                            {daysUntil === 0
                              ? 'Vence hoje'
                              : `${daysUntil}d restantes`}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(bill.dueDate)} • {daysUntil}d
                          </span>
                        )}
                        {bill.recurring && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 rounded-md"
                          >
                            Recorrente
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(bill.amount)}
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePay(bill.id)}
                        className="p-2 rounded-xl hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600 transition-all"
                        title="Marcar como paga"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(bill);
                          setShowForm(true);
                        }}
                        className="p-2 rounded-xl hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(bill.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {pendingBills.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma conta pendente 🎉
              </div>
            )}
          </div>
        </motion.div>

        {/* Paid Bills */}
        {paidBills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border/40">
              <h3 className="text-base font-semibold text-muted-foreground">
                Pagas
              </h3>
            </div>
            <div className="divide-y divide-border/30">
              {paidBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center gap-4 px-6 py-4 opacity-50"
                >
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {bill.name}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      Paga
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground tabular-nums line-through">
                    {formatCurrency(bill.amount)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BillFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        editing={editing}
      />
    </>
  );
}

function BillFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Bill | null;
}) {
  const { dispatch } = useAppData();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceDay, setRecurrenceDay] = useState('');
  const [icon, setIcon] = useState('📄');
  const [isCredit, setIsCredit] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentValue, setInstallmentValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { data } = useAppData();

  const resetForm = () => {
    if (editing) {
      setName(editing.name);
      setAmount(editing.amount.toString());
      setDueDate(editing.dueDate);
      setRecurring(editing.recurring);
      setRecurrenceDay(editing.recurrenceDay?.toString() || '');
      setIcon(editing.icon || '📄');
      setIsCredit(editing.isCredit || false);
      setTotalAmount(editing.totalAmount?.toString() || '');
      setInstallmentValue(editing.installmentValue?.toString() || '');
      setCategoryId(editing.categoryId || '');
    } else {
      setName('');
      setAmount('');
      setDueDate('');
      setRecurring(false);
      setRecurrenceDay('');
      setIcon('📄');
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

    if (!name.trim()) {
      toast.error('Informe o nome');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (!dueDate) {
      toast.error('Informe a data de vencimento');
      return;
    }

    if (editing) {
      dispatch({
        type: 'UPDATE_BILL',
        payload: {
          ...editing,
          name: name.trim(),
          amount: parsedAmount,
          dueDate,
          recurring,
          recurrenceDay: recurring ? parseInt(recurrenceDay) || undefined : undefined,
          icon,
          isCredit,
          totalAmount: isCredit ? parseFloat(totalAmount.replace(/\./g, '').replace(',', '.')) : undefined,
          installmentValue: isCredit ? parseFloat(installmentValue.replace(/\./g, '').replace(',', '.')) : undefined,
        },
      });
      toast.success('Conta atualizada');
    } else {
      dispatch({
        type: 'ADD_BILL',
        payload: {
          name: name.trim(),
          amount: parsedAmount,
          dueDate,
          paid: false,
          recurring,
          recurrenceDay: recurring ? parseInt(recurrenceDay) || undefined : undefined,
          icon,
          isCredit,
          totalAmount: isCredit ? parseFloat(totalAmount.replace(/\./g, '').replace(',', '.')) : undefined,
          installmentValue: isCredit ? parseFloat(installmentValue.replace(/\./g, '').replace(',', '.')) : undefined,
        },
      });
      toast.success('Conta adicionada');
    }

    onOpenChange(false);
  };

  const icons = ['📄', '⚡', '🌐', '📱', '🏠', '🚗', '💧', '🔥', '🏥', '🎓', '🛡️', '📺'];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl border-border/40 p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-apple-orange to-amber-400 px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {editing ? 'Editar Conta' : 'Nova Conta'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Icon Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${icon === ic
                      ? 'bg-accent ring-2 ring-apple-blue scale-110'
                      : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billName">Nome</Label>
            <Input
              id="billName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Energia, Internet..."
              className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="billAmount">Valor (R$)</Label>
              <Input
                id="billAmount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(maskCurrency(e.target.value))}
                placeholder="0,00"
                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billDueDate">Vencimento</Label>
              <Input
                id="billDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billCategory" className="text-sm font-medium">Categoria</Label>
            <select
              id="billCategory"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-secondary/50 border-0 focus:ring-2 focus:ring-apple-blue/30 text-sm appearance-none"
            >
              <option value="">Selecione uma categoria</option>
              {data.categories?.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
            <Label htmlFor="billRecurring" className="text-sm">
              Conta recorrente
            </Label>
            <Switch
              id="billRecurring"
              checked={recurring}
              onCheckedChange={setRecurring}
            />
          </div>

          {recurring && (
            <div className="space-y-2">
              <Label htmlFor="billRecDay">Dia de recorrência (1-31)</Label>
              <Input
                id="billRecDay"
                type="number"
                min="1"
                max="31"
                value={recurrenceDay}
                onChange={(e) => setRecurrenceDay(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
              />
            </div>
          )}

          <div className="space-y-4 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <Label className="text-sm font-medium">Pagamento no Crédito</Label>
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
