'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, formatDateTime } from '@/lib/helpers';
import {
  RECORD_TYPE_LABELS,
  RECORD_TYPE_COLORS,
  type RecordType,
} from '@/lib/data/types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  FileDown,
  ChevronLeft,
  Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';

export default function RecordsPage() {
  const { data } = useAppData();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<RecordType | 'all'>('all');

  // Month/Year selection state - defaults to current month
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-based
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthLabel = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, [selectedMonth, selectedYear]);

  // Generate year options: current year ± 5
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear - 5; y <= currentYear + 1; y++) {
      years.push(y);
    }
    return years;
  }, []);

  const monthOptions = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalIncome = filteredRecords.filter(r => r.amount > 0).reduce((acc, r) => acc + r.amount, 0);
    const totalExpense = filteredRecords.filter(r => r.amount < 0).reduce((acc, r) => acc + Math.abs(r.amount), 0);
    const netTotal = totalIncome - totalExpense;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Financeiro - ${monthLabel} - Fine</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; color: #111; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .header-left h1 { margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: -1px; }
          .header-left p { margin: 5px 0 0 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
          .header-right { text-align: right; }
          .header-right p { margin: 0; font-size: 12px; color: #666; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-box { flex: 1; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
          .summary-box.income { border-left: 4px solid #10b981; }
          .summary-box.expense { border-left: 4px solid #ef4444; }
          .summary-box.net { border-left: 4px solid #3b82f6; }
          .summary-title { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #666; margin-bottom: 8px; }
          .summary-value { font-size: 20px; font-weight: 800; }
          .income .summary-value { color: #10b981; }
          .expense .summary-value { color: #ef4444; }
          table { w-full; width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #000; font-weight: 800; text-transform: uppercase; font-size: 11px; color: #444; }
          td { padding: 12px 8px; border-bottom: 1px solid #eee; }
          .amount { font-weight: 800; text-align: right; }
          .amount.positive { color: #10b981; }
          .amount.negative { color: #ef4444; }
          .type-badge { font-size: 10px; font-weight: 600; padding: 3px 6px; border-radius: 4px; background: #eee; text-transform: uppercase; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; font-weight: 600; text-transform: uppercase; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>Fine</h1>
             <p>Relatório de Movimentações Financeiras — ${monthLabel}</p>
          </div>
          <div class="header-right">
            <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Documento Confidencial</strong></p>
          </div>
        </div>

        <div class="summary">
          <div class="summary-box income">
            <div class="summary-title">Entradas</div>
            <div class="summary-value">+${formatCurrency(totalIncome)}</div>
          </div>
          <div class="summary-box expense">
            <div class="summary-title">Saídas</div>
            <div class="summary-value">-${formatCurrency(totalExpense)}</div>
          </div>
          <div class="summary-box net">
            <div class="summary-title">Saldo Líquido do Período</div>
            <div class="summary-value" style="color: ${netTotal >= 0 ? '#10b981' : '#ef4444'}">${netTotal >= 0 ? '+' : ''}${formatCurrency(netTotal)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th style="text-align: right">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords.map(record => `
              <tr>
                <td>${new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td style="font-weight: 600">${record.description}</td>
                <td><span class="type-badge">${RECORD_TYPE_LABELS[record.type]}</span></td>
                <td class="amount ${record.amount >= 0 ? 'positive' : 'negative'}">
                  ${record.amount >= 0 ? '+' : ''}${formatCurrency(record.amount)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Documento gerado automaticamente pelo sistema Fine. 
        </div>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredRecords = useMemo(() => {
    return data.records.filter((record) => {
      const recordDate = new Date(record.date);
      const matchesMonth = recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === selectedYear;
      const matchesSearch =
        !search ||
        record.description.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        selectedType === 'all' || record.type === selectedType;
      return matchesMonth && matchesSearch && matchesType;
    });
  }, [data.records, search, selectedType, selectedMonth, selectedYear]);

  const types: Array<{ key: RecordType | 'all'; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'manual_adjustment', label: 'Ajustes' },
    { key: 'subscription_charge', label: 'Assinaturas' },
    { key: 'bill_payment', label: 'Contas' },
    { key: 'reserve_deposit', label: 'Reserva' },
    { key: 'income_update', label: 'Renda' },
    { key: 'balance_update', label: 'Saldo' },
  ];

  return (
    <>
      {/* Custom Desktop Header with Back Button and Export */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-safe lg:pt-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center shrink-0 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2 uppercase">
              <span className="text-apple-blue">Registros</span>
            </h1>
            <p className="text-[10px] lg:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-70">
              {filteredRecords.length} movimentações
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month/Year Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 rounded-2xl border border-border/40 p-1">
            <Calendar className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="h-10 min-w-[110px] rounded-xl border-0 bg-transparent focus:ring-0 font-medium text-sm shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="h-10 min-w-[80px] rounded-xl border-0 bg-transparent focus:ring-0 font-medium text-sm shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleExportPDF}
            className="h-12 px-6 rounded-2xl bg-apple-blue hover:bg-apple-blue/90 text-white font-black shadow-xl shadow-apple-blue/20 gap-2 uppercase tracking-tight text-xs"
          >
            <FileDown className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar registros..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-border/40 pl-11 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {types.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${selectedType === type.key
                  ? 'bg-apple-blue text-white shadow-md shadow-apple-blue/20'
                  : 'bg-white dark:bg-zinc-900 text-muted-foreground hover:text-foreground border border-border/40'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Records List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl border border-border/40 overflow-hidden"
        >
          <div className="divide-y divide-border/30">
            {filteredRecords.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum registro encontrado
                </p>
              </div>
            ) : (
              filteredRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.3) }}
                  className="flex items-start gap-3 px-6 py-4 hover:bg-secondary/20 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${record.amount >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                  >
                    {record.amount >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {record.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 h-4 rounded-md ${RECORD_TYPE_COLORS[record.type]
                          }`}
                      >
                        {RECORD_TYPE_LABELS[record.type]}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(record.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                      <span>
                        Antes: {formatCurrency(record.previousBalance)}
                      </span>
                      <span>→</span>
                      <span className="font-medium text-foreground/70">
                        Depois: {formatCurrency(record.newBalance)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-semibold tabular-nums shrink-0 ${record.amount >= 0
                      ? 'text-emerald-600'
                      : 'text-red-500'
                      }`}
                  >
                    {record.amount >= 0 ? '+' : ''}
                    {formatCurrency(record.amount)}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
