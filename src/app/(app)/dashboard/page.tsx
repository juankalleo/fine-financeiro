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
  ChevronRight,
  Plus,
  FileText,
} from 'lucide-react';
import { Reserve } from '@/lib/data/types';
import { BalanceEditDialog } from '@/components/dashboard/balance-edit-dialog';
import { ReserveTransactionDialog } from '@/components/reserves/reserve-transaction-dialog';
import { MobileHeaderActions } from '@/components/layout/mobile-header-actions';
import Link from 'next/link';
import Image from 'next/image';

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
      <div className="space-y-6">
        {/* Main Balance Card - New Blue Mobile Design - Edge to Edge */}
        <motion.div {...fadeInUp} className="-mx-6 -mt-0 lg:mt-0">
          <div className="relative overflow-hidden rounded-b-[40px] lg:rounded-[40px] bg-apple-blue px-6 py-8 lg:p-12 text-white shadow-2xl shadow-apple-blue/30 pt-safe-plus-10 lg:pt-12">
            <div className="relative z-10">
              {/* Mobile Top Header (Inside Card) */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <div>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">{formatDate(new Date().toISOString())}</p>
                </div>
                <MobileHeaderActions variant="dark" />
              </div>

              <div className="flex items-center justify-between mb-6 lg:flex hidden">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black tracking-widest uppercase opacity-80">Patrimônio Total</span>
                </div>
                <button
                  onClick={() => setShowBalanceEdit(true)}
                  className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all border border-white/10"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4 text-center">
                <span className="text-[10px] font-black tracking-widest uppercase opacity-60 mb-1 block lg:hidden">Patrimônio Total</span>
                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter">
                  {formatCurrency(data.wallet.currentBalance)}
                </h2>
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                  <span className="text-[10px] font-bold text-white/90">+{formatCurrency(data.wallet.currentIncome)} este mês</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                  <span className="text-[9px] font-black opacity-70 uppercase tracking-widest block mb-0.5">Receitas</span>
                  <p className="text-sm font-black">{formatCurrency(data.wallet.currentIncome)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                  <span className="text-[9px] font-black opacity-70 uppercase tracking-widest block mb-0.5">Despesas</span>
                  <p className="text-sm font-black">{formatCurrency(totalPendingBills + totalSubscriptions)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-center border border-white/10">
                  <span className="text-[9px] font-black opacity-70 uppercase tracking-widest block mb-0.5">Saldo</span>
                  <p className="text-sm font-black">{formatCurrency(data.wallet.currentBalance)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Minhas Contas Section */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black tracking-tight">Minhas Contas</h3>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
            {/* Salário Card */}
            <div className="min-w-[130px] bg-apple-green text-white rounded-[28px] p-4 shadow-lg shadow-apple-green/20 flex flex-col justify-between aspect-square shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium opacity-90 mb-1">Salário</p>
                <p className="text-lg font-black">{formatCurrency(data.wallet.currentIncome)}</p>
              </div>
            </div>

            {/* Reservas Cards */}
            {data.reserves.map(reserve => (
              <div key={reserve.id} className="min-w-[130px] bg-white dark:bg-zinc-900 border border-border/40 rounded-[28px] p-4 flex flex-col justify-between aspect-square shrink-0 shadow-sm relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest bg-secondary px-2 py-1 rounded-md text-muted-foreground">
                  Reserva
                </div>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${reserve.color}20` }}
                >
                  <PiggyBank className="w-5 h-5" style={{ color: reserve.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-1 truncate">{reserve.name}</p>
                  <p className="text-lg font-black text-foreground">{formatCurrency(reserve.amount)}</p>
                </div>
              </div>
            ))}

            {/* Lançamentos Pendentes Cards */}
            {data.lancamentos?.filter(l => !l.executed).map(lanc => (
              <div key={lanc.id} className="min-w-[130px] bg-white dark:bg-zinc-900 border border-border/40 rounded-[28px] p-4 flex flex-col justify-between aspect-square shrink-0 shadow-sm relative overflow-hidden">
                <div className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                  Pendente
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${lanc.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  {lanc.icon ? (
                    <span className="text-xl">{lanc.icon}</span>
                  ) : (
                    <FileText className={`w-5 h-5 ${lanc.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`} />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-1 truncate">{lanc.description}</p>
                  <p className="text-lg font-black text-foreground">{formatCurrency(lanc.amount)}</p>
                </div>
              </div>
            ))}

            {/* Adicionar Conta/Lancamento */}
            <Link href="/lancamentos">
              <div className="min-w-[130px] bg-secondary/50 hover:bg-secondary border border-dashed border-border/60 rounded-[28px] p-4 flex flex-col items-center justify-center aspect-square shrink-0 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center mb-2 shadow-sm">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground text-center">Novo<br />Lançamento</p>
              </div>
            </Link>
          </div>
        </motion.div>

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
