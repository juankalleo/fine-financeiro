'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatCurrency, formatDateTime } from '@/lib/helpers';
import { Header } from '@/components/layout/header';
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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function RecordsPage() {
  const { data } = useAppData();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<RecordType | 'all'>('all');

  const filteredRecords = useMemo(() => {
    return data.records.filter((record) => {
      const matchesSearch =
        !search ||
        record.description.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        selectedType === 'all' || record.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [data.records, search, selectedType]);

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
      <Header
        title="Registros"
        subtitle={`${data.records.length} movimentações registradas`}
      />

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
              className="h-12 rounded-2xl bg-white border border-border/40 pl-11 focus-visible:ring-2 focus-visible:ring-apple-blue/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {types.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedType === type.key
                    ? 'bg-apple-blue text-white shadow-md shadow-apple-blue/20'
                    : 'bg-white text-muted-foreground hover:text-foreground border border-border/40'
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
          className="bg-white rounded-3xl border border-border/40 overflow-hidden"
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
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      record.amount >= 0 ? 'bg-emerald-50' : 'bg-red-50'
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
                        className={`text-[10px] px-1.5 py-0 h-4 rounded-md ${
                          RECORD_TYPE_COLORS[record.type]
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
                    className={`text-sm font-semibold tabular-nums shrink-0 ${
                      record.amount >= 0
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
