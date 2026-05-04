'use client';

import { useState } from 'react';
import { useAppData } from '@/lib/data/store';
import { formatCurrency } from '@/lib/helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type { Reserve } from '@/lib/data/types';

interface ReserveTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserve: Reserve | null;
}

export function ReserveTransactionDialog({
  open,
  onOpenChange,
  reserve,
}: ReserveTransactionDialogProps) {
  const { dispatch } = useAppData();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserve) return;

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (!reason.trim()) {
      toast.error('Informe o motivo');
      return;
    }

    const finalAmount = type === 'deposit' ? parsedAmount : -parsedAmount;

    dispatch({
      type: 'TRANSACT_RESERVE',
      payload: {
        reserveId: reserve.id,
        amount: finalAmount,
        reason: reason.trim(),
      },
    });

    toast.success(
      `${type === 'deposit' ? 'Depósito' : 'Retirada'} realizado com sucesso`
    );
    setAmount('');
    setReason('');
    onOpenChange(false);
  };

  if (!reserve) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-0 overflow-hidden">
        <div 
          className="px-6 py-5 text-white" 
          style={{ backgroundColor: reserve.color }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Movimentar Reserva</DialogTitle>
            <p className="text-white/80 text-xs">
              {reserve.name} • Saldo atual: {formatCurrency(reserve.amount)}
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex bg-secondary/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'deposit'
                  ? 'bg-white dark:bg-zinc-800 shadow-sm text-apple-blue'
                  : 'text-muted-foreground'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Depósito
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                type === 'withdraw'
                  ? 'bg-white dark:bg-zinc-800 shadow-sm text-red-500'
                  : 'text-muted-foreground'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Retirada
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Valor (R$)
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 rounded-xl bg-secondary/50 border-0 text-lg font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Reserva mensal, Emergência..."
              className="h-12 rounded-xl bg-secondary/50 border-0"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-white shadow-lg"
            style={{ backgroundColor: reserve.color }}
          >
            Confirmar {type === 'deposit' ? 'Depósito' : 'Retirada'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
