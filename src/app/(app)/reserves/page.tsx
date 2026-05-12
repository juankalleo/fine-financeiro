'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, formatDate } from '@/lib/helpers';
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
import {
  Plus,
  Pencil,
  Trash2,
  PiggyBank,
  ChevronRight,
  ChevronLeft,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Reserve } from '@/lib/data/types';
import { ReserveTransactionDialog } from '@/components/reserves/reserve-transaction-dialog';

export default function ReservesPage() {
  const router = useRouter();
  const { data, dispatch } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reserve | null>(null);
  const [selectedForTransaction, setSelectedForTransaction] = useState<Reserve | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [monthly, setMonthly] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [icon, setIcon] = useState('💰');

  const resetLocalForm = () => {
    setName('');
    setAmount('');
    setMonthly('');
    setColor('#007AFF');
    setIcon('💰');
    setIsAdding(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Dê um nome para a reserva');

    const payload = {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      monthlyContribution: parseFloat(monthly) || 0,
      color,
      icon,
    };

    dispatch({ type: 'ADD_RESERVE', payload });
    toast.success('Reserva criada com sucesso');
    resetLocalForm();
  };

  const totalReserves = data.reserves.reduce((acc, r) => acc + r.amount, 0);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      dispatch({ type: 'REMOVE_RESERVE', payload: id });
      toast.success('Reserva removida');
    }
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
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-apple-blue rounded-b-[40px] px-6 pb-10 pt-safe-plus-40 text-white shadow-2xl shadow-indigo-600/20 transition-all duration-500">
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
                  {isAdding ? 'Nova Reserva' : 'Reservas'}
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
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Patrimônio Acumulado</p>
              <h1 className="text-5xl font-black tracking-tighter">
                {formatCurrency(totalReserves)}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  {data.reserves.length} objetivos em foco
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
                    className="h-14 px-8 rounded-2xl bg-white text-indigo-600 hover:bg-white/90 font-black shadow-xl shadow-black/10 gap-2 text-sm uppercase tracking-tight"
                  >
                    <Plus className="w-5 h-5" />
                    Nova Reserva
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  onSubmit={handleAddSubmit}
                  className="overflow-hidden mt-8 space-y-6"
                >
                  <div className="h-px bg-white/10 w-full mb-6" />

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Objetivo</Label>
                      <div className="flex gap-2">
                        <Input
                          value={icon}
                          onChange={(e) => setIcon(e.target.value)}
                          className="w-14 h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-2xl focus:ring-white/30"
                          placeholder="💰"
                        />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30 flex-1"
                          placeholder="Ex: Viagem, Carro..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Saldo Inicial</Label>
                        <Input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Contribuição/mês</Label>
                        <Input
                          value={monthly}
                          onChange={(e) => setMonthly(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                          placeholder="0,00"
                        />
                      </div>
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
                      className="flex-1 h-14 rounded-2xl bg-white text-indigo-600 hover:bg-white/90 font-black shadow-xl shadow-black/10 uppercase text-xs"
                    >
                      Criar Reserva
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {data.reserves.map((reserve, i) => (
              <div
                key={reserve.id}
                onClick={() => setSelectedForTransaction(reserve)}
                className="group relative bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 p-5 overflow-hidden transition-all hover:shadow-lg cursor-pointer"
              >
                <div
                  className="absolute top-0 left-0 w-1.5 h-full"
                  style={{ backgroundColor: reserve.color }}
                />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${reserve.color}15`, color: reserve.color }}
                    >
                      {reserve.icon || '💰'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{reserve.name}</h3>
                      <p className="text-[10px] text-muted-foreground">Contribuição: {formatCurrency(reserve.monthlyContribution)}/mês</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditing(reserve); setShowForm(true); }} className="p-2 hover:bg-secondary rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(reserve.id); }} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold tabular-nums">{formatCurrency(reserve.amount)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: reserve.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </AnimatePresence>

          {data.reserves.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border/40 rounded-3xl">
              <PiggyBank className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Você ainda não criou nenhuma reserva.</p>
              <Button variant="link" onClick={() => setShowForm(true)}>Criar minha primeira reserva</Button>
            </div>
          )}
        </div>
      </div>

      <ReserveFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        editing={editing}
      />
      <ReserveTransactionDialog
        open={!!selectedForTransaction}
        onOpenChange={(open) => !open && setSelectedForTransaction(null)}
        reserve={selectedForTransaction}
      />
    </>
  );
}

function ReserveFormDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (open: boolean) => void; editing: Reserve | null }) {
  const { dispatch } = useAppData();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [monthly, setMonthly] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [icon, setIcon] = useState('💰');

  const resetForm = () => {
    if (editing) {
      setName(editing.name);
      setAmount(editing.amount.toString());
      setMonthly(editing.monthlyContribution.toString());
      setColor(editing.color);
      setIcon(editing.icon || '💰');
    } else {
      setName('');
      setAmount('');
      setMonthly('');
      setColor('#007AFF');
      setIcon('💰');
    }
  };

  useState(() => resetForm());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Dê um nome para a reserva');

    const payload = {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      monthlyContribution: parseFloat(monthly) || 0,
      color,
      icon,
    };

    if (editing) {
      dispatch({ type: 'UPDATE_RESERVE', payload: { ...editing, ...payload } });
      toast.success('Reserva atualizada');
    } else {
      dispatch({ type: 'ADD_RESERVE', payload });
      toast.success('Reserva criada com sucesso');
    }
    onOpenChange(false);
  };

  const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF2D55', '#5856D6', '#FFCC00', '#8E8E93'];

  return (
    <Dialog open={open} onOpenChange={(val) => { if (val) resetForm(); onOpenChange(val); }}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden">
        <div className="px-6 py-5 border-b" style={{ backgroundColor: `${color}10` }}>
          <DialogTitle style={{ color }}>{editing ? 'Editar Reserva' : 'Nova Reserva'}</DialogTitle>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-2 mb-2">
            {colors.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-black dark:ring-white scale-110' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Nome da Reserva</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Viagem, Carro Novo, Emergência..." className="rounded-xl h-11" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Saldo Inicial</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Contribuição Mensal</Label>
              <Input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="0.00" className="rounded-xl h-11" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Ícone (Emoji ou Texto)</Label>
            <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="💰" className="rounded-xl h-11" />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-white shadow-lg" style={{ backgroundColor: color }}>
            {editing ? 'Salvar Alterações' : 'Criar Reserva'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
