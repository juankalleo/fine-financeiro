'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { Header } from '@/components/layout/header';
import { LancamentoDialog } from '@/components/lancamentos/lancamento-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function LancamentosPage() {
  const { data, dispatch } = useAppData();
  const [showDialog, setShowDialog] = useState(false);
  const lancamentos = data.lancamentos || [];

  const handleExecute = (id: string) => {
    dispatch({ type: 'EXECUTE_LANCAMENTO', payload: id });
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_LANCAMENTO', payload: id });
  };

  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('💰');

  const resetLocalForm = () => {
    setDescription('');
    setAmount('');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setType('expense');
    setIcon('💰');
    setIsAdding(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (!description.trim()) return toast.error('Informe a descrição');
    if (isNaN(parsedAmount) || parsedAmount <= 0) return toast.error('Valor inválido');

    dispatch({
      type: 'ADD_LANCAMENTO',
      payload: {
        description: description.trim(),
        amount: parsedAmount,
        scheduledDate,
        type,
        icon,
        executed: false,
      },
    });
    toast.success('Lançamento agendado');
    resetLocalForm();
  };

  const scheduledCount = lancamentos.filter(l => !l.executed).length;

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
        <div className="relative overflow-hidden bg-gradient-to-br from-apple-blue to-sky-700 rounded-b-[40px] px-6 pb-10 pt-[calc(env(safe-area-inset-top)+40px)] text-white shadow-2xl shadow-apple-blue/20 transition-all duration-500">
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
                  {isAdding ? 'Novo Lançamento' : 'Lançamentos'}
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
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Lançamentos Agendados</p>
              <h1 className="text-5xl font-black tracking-tighter">
                {scheduledCount}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  Próximas movimentações
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
                    className="h-14 px-8 rounded-2xl bg-white text-apple-blue hover:bg-white/90 font-black shadow-xl shadow-black/10 gap-2 text-sm uppercase tracking-tight"
                  >
                    <Plus className="w-5 h-5" />
                    Novo Lançamento
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
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Descrição</Label>
                      <div className="flex gap-2">
                        <Input
                          value={icon}
                          onChange={(e) => setIcon(e.target.value)}
                          className="w-14 h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 text-center text-2xl focus:ring-white/30"
                          placeholder="💰"
                        />
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30 flex-1"
                          placeholder="Ex: Salário, Aluguel..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Valor (R$)</Label>
                        <Input
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-70 ml-1 text-white">Data Agendada</Label>
                        <Input
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40 font-bold focus:ring-white/30"
                          type="date"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 p-1 bg-white/10 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'expense' ? 'bg-red-500 text-white' : 'text-white/60 hover:bg-white/5'}`}
                      >
                        Despesa
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase transition-all ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-white/60 hover:bg-white/5'}`}
                      >
                        Receita
                      </button>
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
                      Agendar
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

        <motion.div {...fadeInUp} className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 overflow-hidden shadow-sm">
          {lancamentos.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
               <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                 <CalendarClock className="w-8 h-8 text-muted-foreground" />
               </div>
               <h3 className="text-lg font-bold mb-2">Nenhum lançamento</h3>
               <p className="text-sm text-muted-foreground max-w-[250px]">
                 Registre ou agende seus recebimentos e despesas futuras aqui.
               </p>
               <Button onClick={() => setShowDialog(true)} variant="outline" className="mt-6 rounded-xl h-11 border-border/60">
                 Criar primeiro lançamento
               </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/30 px-2">
               {lancamentos.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()).map(lanc => (
                 <div key={lanc.id} className="flex items-center gap-4 px-6 py-5 hover:bg-secondary/20 transition-colors rounded-2xl">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${lanc.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      {lanc.icon ? (
                        <span className="text-xl">{lanc.icon}</span>
                      ) : (
                        lanc.type === 'income' ? <ArrowUpRight className="w-5 h-5 text-emerald-600" /> : <ArrowDownRight className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{lanc.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">
                          {formatDate(lanc.scheduledDate)}
                        </span>
                        {!lanc.executed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 font-bold uppercase tracking-widest">
                            Agendado
                          </span>
                        )}
                        {lanc.executed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Efetivado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-base font-black tabular-nums ${lanc.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {lanc.type === 'income' ? '+' : '-'}{formatCurrency(lanc.amount)}
                      </span>
                      <div className="flex gap-1 mt-1">
                        {!lanc.executed && (
                          <button
                            onClick={() => handleExecute(lanc.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                            title="Efetivar agora"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(lanc.id)}
                          className="p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </motion.div>

      <LancamentoDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}
