'use client';

import { useState } from 'react';
import { useAppData } from '@/lib/data/store';
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
import { maskCurrency } from '@/lib/helpers';

interface LancamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LancamentoDialog({
  open,
  onOpenChange,
}: LancamentoDialogProps) {
  const { dispatch } = useAppData();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [updateNow, setUpdateNow] = useState(true);
  const [icon, setIcon] = useState('💰');
  const [showOnHome, setShowOnHome] = useState(false);
  const [isCredit, setIsCredit] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [installmentValue, setInstallmentValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { data } = useAppData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(value) || value <= 0) {
      toast.error('Valor inválido');
      return;
    }
    if (!description.trim()) {
      toast.error('Informe a descrição');
      return;
    }

    dispatch({
      type: 'ADD_LANCAMENTO',
      payload: {
        description: description.trim(),
        amount: value,
        type,
        scheduledDate: updateNow ? new Date().toISOString() : new Date(scheduledDate).toISOString(),
        executed: updateNow,
        icon,
        showOnHome,
        installmentValue: isCredit ? parseFloat(installmentValue.replace(/\./g, '').replace(',', '.')) : undefined,
        categoryId: categoryId || undefined,
      },
    });

    toast.success(updateNow ? 'Lançamento registrado com sucesso' : 'Lançamento agendado com sucesso');
    setDescription('');
    setAmount('');
    setType('expense');
    setUpdateNow(true);
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setShowOnHome(false);
    setIsCredit(false);
    setTotalAmount('');
    setInstallmentValue('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-3xl border-border/40 p-0 overflow-hidden">
        <div className="gradient-blue px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              Anexar Lançamento
            </DialogTitle>
            <DialogDescription className="text-sm text-white/70">
              Adicione uma nova receita ou despesa.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
             <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                className={`h-11 rounded-xl ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                onClick={() => setType('income')}
             >
                Receita
             </Button>
             <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                className={`h-11 rounded-xl ${type === 'expense' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                onClick={() => setType('expense')}
             >
                Despesa
             </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Conta de luz, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon" className="text-sm font-medium">
              Ícone / Emoji
            </Label>
            <div className="flex gap-2">
               <Input
                id="icon"
                type="text"
                placeholder="💰"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-12 h-12 text-center text-xl rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30 p-0"
              />
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
                {['💰', '💸', '🏦', '🛍️', '🍔', '🚗', '🏠', '💳', '⚡', '📶'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${icon === emoji ? 'bg-apple-blue/20 scale-110 shadow-sm' : 'hover:bg-secondary'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
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
              onChange={(e) => setAmount(maskCurrency(e.target.value))}
              className="h-12 rounded-xl bg-secondary/50 border-0 text-lg font-semibold focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
            <select
              id="category"
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

          <div className="space-y-4 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <Label className="text-sm font-medium">Exibir na tela inicial</Label>
              <input
                type="checkbox"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
                className="w-5 h-5 rounded-lg border-border/40 text-apple-blue focus:ring-apple-blue/30"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <Label className="text-sm font-medium">Compra no Crédito</Label>
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

          <div className="space-y-2 pt-2 border-t border-border/40">
             <Label className="text-sm font-medium">Quando deseja atualizar o saldo?</Label>
             <div className="grid grid-cols-2 gap-3">
               <Button
                  type="button"
                  variant={updateNow ? 'default' : 'outline'}
                  className={`h-11 rounded-xl ${updateNow ? 'bg-apple-blue text-white hover:bg-apple-blue/90' : ''}`}
                  onClick={() => setUpdateNow(true)}
               >
                  Agora
               </Button>
               <Button
                  type="button"
                  variant={!updateNow ? 'default' : 'outline'}
                  className={`h-11 rounded-xl ${!updateNow ? 'bg-apple-blue text-white hover:bg-apple-blue/90' : ''}`}
                  onClick={() => setUpdateNow(false)}
               >
                  Agendar
               </Button>
             </div>
          </div>

          {!updateNow && (
             <div className="space-y-2 pt-2">
               <Label htmlFor="date" className="text-sm font-medium">
                 Data Programada
               </Label>
               <Input
                 id="date"
                 type="date"
                 value={scheduledDate}
                 onChange={(e) => setScheduledDate(e.target.value)}
                 className="h-12 rounded-xl bg-secondary/50 border-0 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
               />
             </div>
          )}

          <div className="flex gap-3 pt-4">
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
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
