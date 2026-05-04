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
  ArrowRight,
  Bell,
} from 'lucide-react';
import { Reserve } from '@/lib/data/types';
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

      <div className="space-y-6">
        {/* Main Balance Card - Simplified for Mobile */}
        <motion.div {...fadeInUp}>
          <div className="relative overflow-hidden rounded-[40px] gradient-blue p-8 lg:p-12 text-white shadow-2xl shadow-apple-blue/30">
            <div className="card-shine absolute inset-0 rounded-[40px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-black tracking-widest uppercase opacity-70">Saldo Disponível</span>
                </div>
                <button
                  onClick={() => setShowBalanceEdit(true)}
                  className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all border border-white/10"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter">
                  {formatCurrency(data.wallet.currentBalance)}
                </h2>
              </div>
              
              {/* Desktop Only Inline Stats */}
              <div className="hidden lg:grid grid-cols-2 gap-4 mt-10">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 opacity-70" />
                    <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">Renda Mensal</span>
                  </div>
                  <p className="text-2xl font-black">{formatCurrency(data.wallet.currentIncome)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-4 h-4 opacity-70" />
                    <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">Total Reservado</span>
                  </div>
                  <p className="text-2xl font-black">{formatCurrency(totalReserves)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Only Separate Stats Cards */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-border/40 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-apple-blue/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-apple-blue" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Renda Mensal</p>
                <p className="text-xl font-black">{formatCurrency(data.wallet.currentIncome)}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.15 }} className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-border/40 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-apple-green/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-apple-green" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total em Reservas</p>
                <p className="text-xl font-black">{formatCurrency(totalReserves)}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground/30" />
          </motion.div>
        </div>

        {/* Apple Style Quick Stats */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'ASSINATURAS', value: activeSubscriptions.length, sub: `${formatCurrency(totalSubscriptions)}/mês`, color: 'blue', icon: CreditCard, href: '/subscriptions' },
              { label: 'CONTAS', value: pendingBills.length, sub: `${formatCurrency(totalPendingBills)} total`, color: 'orange', icon: Receipt, href: '/bills' },
              { label: 'RESERVAS', value: data.reserves.length, sub: `EM ${data.reserves.length} METAS`, color: 'emerald', icon: PiggyBank, href: '/reserves' },
              { label: 'PRÓXIMA', value: nextSub ? `${nextSub.daysUntil}d` : '--', sub: nextSub?.name || 'Vazio', color: 'purple', icon: CalendarClock, href: '/subscriptions' },
            ].map((stat, i) => (
              <Link key={i} href={stat.href} className="group">
                <div className="h-full bg-white dark:bg-zinc-900 border border-border/40 rounded-[32px] p-6 hover:shadow-xl transition-all group-hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${stat.color === 'blue' ? 'apple-blue' : stat.color === 'orange' ? 'apple-orange' : stat.color === 'emerald' ? 'apple-green' : 'purple-600'}/10`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color === 'blue' ? 'apple-blue' : stat.color === 'orange' ? 'apple-orange' : stat.color === 'emerald' ? 'apple-green' : 'purple-600'}`} />
                    </div>
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
          {/* Recent Records */}
          <motion.div {...fadeInUp} transition={{ delay: 0.25 }}>
             <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-border/40 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-border/40 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Atividade Recente</h3>
                  <Link href="/records" className="text-[10px] font-black text-apple-blue">VER TUDO</Link>
                </div>
                <div className="divide-y divide-border/30 px-2">
                  {recentRecords.map((record) => (
                    <div key={record.id} className="flex items-center gap-4 px-6 py-5 hover:bg-secondary/20 transition-colors rounded-2xl">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${record.amount >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                        {record.amount >= 0 ? <ArrowUpRight className="w-5 h-5 text-emerald-600" /> : <ArrowDownRight className="w-5 h-5 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{record.description}</p>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <span className={`text-base font-black tabular-nums ${record.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {record.amount >= 0 ? '+' : ''}{formatCurrency(record.amount)}
                      </span>
                    </div>
                  ))}
                </div>
             </div>
          </motion.div>

          {/* Activity & Notifications */}
          <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
             <div className="bg-zinc-100 dark:bg-zinc-800/40 rounded-[40px] p-8 border border-dashed border-border/60">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4" /> Centro de Avisos
                  </h3>
                </div>
                <div className="space-y-4">
                  {recentNotifs.length > 0 ? recentNotifs.map(notif => (
                    <div key={notif.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-border/40">
                      <p className="text-[10px] font-black text-apple-blue uppercase tracking-tighter mb-1">{notif.title}</p>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{notif.message}</p>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhum aviso novo</p>
                  )}
                </div>
             </div>
          </motion.div>
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
