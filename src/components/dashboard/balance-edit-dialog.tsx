'use client';

import { useState } from 'react';
import { useAppData } from '@/lib/data/store';
import { formatCurrency } from '@/lib/helpers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BalanceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BalanceEditDialog({
  open,
  onOpenChange,
}: BalanceEditDialogProps) {
  const { data, dispatch } = useAppData();
  const [newBalance, setNewBalance] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(newBalance.replace(',', '.'));
    if (isNaN(value)) {
      toast.error('Valor inválido');
      return;
    }
    if (!reason.trim()) {
      toast.error('Informe o motivo da alteração');
      return;
    }

    dispatch({
      type: 'UPDATE_BALANCE',
      payload: { newBalance: value, reason: reason.trim() },
    });

    toast.success('Saldo atualizado com sucesso');
    setNewBalance('');
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl border-border/40 p-0 overflow-hidden">
        <div className="gradient-blue px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Editar Saldo
            </DialogTitle>
            <DialogDescription className="text-sm text-white/70">
              Saldo atual: {formatCurrency(data.wallet.currentBalance)}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newBalance" className="text-sm font-medium">
              Novo Saldo (R$)
            </Label>
            <Input
              id="newBalance"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="h-12 rounded-xl bg-secondary/50 border-0 text-lg font-semibold focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Motivo da alteração *
            </Label>
            <Input
              id="reason"
              type="text"
              placeholder="Ex: Compras no mercado, recebimento freelance..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
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
              Atualizar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
