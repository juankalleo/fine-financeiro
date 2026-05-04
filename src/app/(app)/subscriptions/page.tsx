'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, getDaysUntilBilling } from '@/lib/helpers';
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
} from 'lucide-react';
import { toast } from 'sonner';
import type { Subscription } from '@/lib/data/types';

export default function SubscriptionsPage() {
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

  return (
    <>
      <Header
        title="Assinaturas"
        subtitle={`${activeSubscriptions.length} ativas • ${formatCurrency(totalMonthly)}/mês`}
      />

      <div className="space-y-6">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Mensal em Assinaturas
              </p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {formatCurrency(totalMonthly)}
              </p>
            </div>
            <Button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="h-11 rounded-xl bg-apple-blue hover:bg-apple-blue-dark text-white shadow-lg shadow-apple-blue/20 gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova
            </Button>
          </div>
        </motion.div>

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

  // Reset form when editing changes
  const resetForm = () => {
    if (editing) {
      setName(editing.name);
      setAmount(editing.amount.toString());
      setBillingDay(editing.billingDay.toString());
      setIcon(editing.icon || '💳');
      setActive(editing.active);
    } else {
      setName('');
      setAmount('');
      setBillingDay('1');
      setIcon('💳');
      setActive(true);
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
    const parsedAmount = parseFloat(amount.replace(',', '.'));
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
                onChange={(e) => setAmount(e.target.value)}
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
