'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { Header } from '@/components/layout/header';
import { LancamentoDialog } from '@/components/lancamentos/lancamento-dialog';
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <>
      <Header />

      <div className="space-y-6 pb-24 lg:pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">Lançamentos</h1>
          <Button
            onClick={() => setShowDialog(true)}
            className="h-10 rounded-xl bg-apple-blue hover:bg-apple-blue-dark text-white shadow-lg shadow-apple-blue/20 gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Anexar</span>
          </Button>
        </div>

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
      </div>

      <LancamentoDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}
