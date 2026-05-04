'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency } from '@/lib/helpers';
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
} from 'lucide-react';
import { toast } from 'sonner';
import type { Reserve } from '@/lib/data/types';
import { ReserveTransactionDialog } from '@/components/reserves/reserve-transaction-dialog';

export default function ReservesPage() {
  const { data, dispatch } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reserve | null>(null);
  const [selectedForTransaction, setSelectedForTransaction] = useState<Reserve | null>(null);

  const totalReserves = data.reserves.reduce((acc, r) => acc + r.amount, 0);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta reserva?')) {
      dispatch({ type: 'REMOVE_RESERVE', payload: id });
      toast.success('Reserva removida');
    }
  };

  return (
    <>
      <Header
        title="Minhas Reservas"
        subtitle={`Total acumulado: ${formatCurrency(totalReserves)}`}
      />

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 p-6 flex-1 mr-4">
            <p className="text-sm text-muted-foreground font-medium">Patrimônio em Reservas</p>
            <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(totalReserves)}</p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="h-14 w-14 rounded-2xl bg-apple-blue hover:bg-apple-blue-dark text-white shadow-lg shadow-apple-blue/20"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {data.reserves.map((reserve, i) => (
                <div 
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
    <Dialog open={open} onOpenChange={(val) => { if(val) resetForm(); onOpenChange(val); }}>
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
