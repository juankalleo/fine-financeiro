'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, formatDate, getDaysUntilBilling } from '@/lib/helpers';
import { Header } from '@/components/layout/header';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Receipt,
  CalendarClock,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { RECORD_TYPE_LABELS, RECORD_TYPE_COLORS, Reserve } from '@/lib/data/types';
import { BalanceEditDialog } from '@/components/dashboard/balance-edit-dialog';
import { ReserveTransactionDialog } from '@/components/reserves/reserve-transaction-dialog';
import Link from 'next/link';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function DashboardPage() {
  const { data } = useAppData();
  const [showBalanceEdit, setShowBalanceEdit] = useState(false);
  const [selectedReserve, setSelectedReserve] = useState<Reserve | null>(null);

  const activeSubscriptions = data.subscriptions.filter((s) => s.active);
  const totalSubscriptions = activeSubscriptions.reduce((acc, s) => acc + s.amount, 0);
  const pendingBills = data.bills.filter((b) => !b.paid);
  const totalPendingBills = pendingBills.reduce((acc, b) => acc + b.amount, 0);
  const totalReserves = data.reserves.reduce((acc, r) => acc + r.amount, 0);
  const totalMonthlyReserves = data.reserves.reduce((acc, r) => acc + r.monthlyContribution, 0);

  const nextSub = activeSubscriptions
    .map((s) => ({ ...s, daysUntil: getDaysUntilBilling(s.billingDay) }))
    .sort((a, b) => a.daysUntil - b.daysUntil)[0];

  const recentRecords = data.records.slice(0, 5);
  const recentNotifs = data.notifications.slice(0, 3);

  return (
    <>
      <Header />

      <div className="space-y-8">
        {/* Premium Wallet Card */}
        <motion.div {...fadeInUp}>
          <div className="relative overflow-hidden rounded-[32px] gradient-blue p-8 lg:p-10 text-white shadow-2xl shadow-apple-blue/30">
            <div className="card-shine absolute inset-0 rounded-[32px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white/80" />
                  </div>
                  <span className="text-sm font-bold tracking-wide uppercase opacity-70">Saldo Disponível</span>
                </div>
                <button
                  onClick={() => setShowBalanceEdit(true)}
                  className="flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl px-4 py-2 transition-all border border-white/10"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Ajustar
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-5xl lg:text-6xl font-black tracking-tighter">
                  {formatCurrency(data.wallet.currentBalance)}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-bold opacity-70 uppercase">Renda Mensal</span>
                  </div>
                  <p className="text-2xl font-black">{formatCurrency(data.wallet.currentIncome)}</p>
                  <p className="text-[10px] opacity-50 mt-1 font-bold">PRÓXIMO CICLO EM {formatDate(data.wallet.incomeUpdateDate).toUpperCase()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-4 h-4 opacity-70" />
                    <span className="text-xs font-bold opacity-70 uppercase">Total em Reservas</span>
                  </div>
                  <p className="text-2xl font-black">{formatCurrency(totalReserves)}</p>
                  <p className="text-[10px] text-emerald-300 font-bold mt-1">+{formatCurrency(totalMonthlyReserves)}/MÊS AUTOMÁTICO</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Apple Style Quick Stats */}
        <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.1 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'ASSINATURAS', value: activeSubscriptions.length, sub: `${formatCurrency(totalSubscriptions)}/mês`, color: 'blue', icon: CreditCard, href: '/subscriptions' },
              { label: 'CONTAS', value: pendingBills.length, sub: `${formatCurrency(totalPendingBills)} total`, color: 'orange', icon: Receipt, href: '/bills' },
              { label: 'RESERVAS', value: data.reserves.length, sub: `EM ${data.reserves.length} METAS`, color: 'emerald', icon: PiggyBank, href: '/reserves' },
              { label: 'PRÓXIMA', value: nextSub ? `${nextSub.daysUntil}d` : '--', sub: nextSub?.name || 'Vazio', color: 'purple', icon: CalendarClock, href: '/subscriptions' },
            ].map((stat, i) => (
              <Link key={i} href={stat.href} className="group">
                <div className="h-full bg-white dark:bg-zinc-900 border border-border/40 rounded-3xl p-5 hover:shadow-xl transition-all group-hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${stat.color === 'blue' ? 'apple-blue' : stat.color === 'orange' ? 'apple-orange' : stat.color === 'emerald' ? 'apple-green' : 'purple-600'}/10`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color === 'blue' ? 'apple-blue' : stat.color === 'orange' ? 'apple-orange' : stat.color === 'emerald' ? 'apple-green' : 'purple-600'}`} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-foreground mt-1">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 truncate">{stat.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reserves Section */}
          <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.15 }}>
            <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <PiggyBank className="w-4 h-4" /> Minhas Reservas
               </h3>
               <Link href="/reserves" className="text-xs font-black text-apple-blue hover:underline">GERENCIAR</Link>
            </div>
            <div className="space-y-3">
              {data.reserves.map(reserve => (
                <button 
                  key={reserve.id} 
                  onClick={() => setSelectedReserve(reserve)}
                  className="w-full text-left bg-white dark:bg-zinc-900 rounded-3xl p-4 border border-border/40 hover:border-apple-blue/30 transition-all flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                    {reserve.icon || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{reserve.name}</p>
                    <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div className="h-full" style={{ width: '60%', backgroundColor: reserve.color }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-foreground">{formatCurrency(reserve.amount)}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">META 60%</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Activity & Notifications */}
          <div className="space-y-8">
             <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.2 }}>
                <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-border/40 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Registros Recentes</h3>
                    <Link href="/records" className="text-[10px] font-black text-apple-blue">VER TUDO</Link>
                  </div>
                  <div className="divide-y divide-border/30">
                    {recentRecords.map((record) => (
                      <div key={record.id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${record.amount >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                          {record.amount >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{record.description}</p>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <span className={`text-sm font-black tabular-nums ${record.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {record.amount >= 0 ? '+' : ''}{formatCurrency(record.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
             </motion.div>

             <motion.div {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.25 }}>
                <div className="bg-zinc-100 dark:bg-zinc-800/40 rounded-[32px] p-6 border border-dashed border-border/60">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <Bell className="w-4 h-4" /> Centro de Avisos
                     </h3>
                   </div>
                   <div className="space-y-3">
                     {recentNotifs.map(notif => (
                       <div key={notif.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-border/40">
                         <p className="text-[10px] font-black text-apple-blue uppercase tracking-tighter mb-1">{notif.title}</p>
                         <p className="text-xs text-muted-foreground font-medium leading-relaxed">{notif.message}</p>
                       </div>
                     ))}
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>

      <BalanceEditDialog open={showBalanceEdit} onOpenChange={setShowBalanceEdit} />
      <ReserveTransactionDialog 
        open={!!selectedReserve} 
        onOpenChange={(open) => !open && setSelectedReserve(null)} 
        reserve={selectedReserve} 
      />
    </>
  );
}
