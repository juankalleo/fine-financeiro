export interface Wallet {
  currentBalance: number;
  currentIncome: number;
  incomeUpdateDate: string;
}

export interface Reserve {
  id: string;
  name: string;
  amount: number;
  monthlyContribution: number;
  color: string; // Hex or CSS color
  icon?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDay: number;
  active: boolean;
  lastChargedDate?: string;
  icon?: string; // Emoji, text, or URL
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  recurring: boolean;
  recurrenceDay?: number;
  icon?: string;
}

export interface Notification {
  id: string;
  date: string;
  title: string;
  message: string;
  type: 'email_sent' | 'auto_payment' | 'alert';
}

export interface Lancamento {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  scheduledDate: string;
  executed: boolean;
  icon?: string;
}

export interface Record {
  id: string;
  date: string;
  type:
  | 'manual_adjustment'
  | 'subscription_charge'
  | 'bill_payment'
  | 'reserve_deposit'
  | 'income_update'
  | 'balance_update'
  | 'subscription_added'
  | 'subscription_removed'
  | 'bill_added'
  | 'bill_removed'
  | 'reserve_added'
  | 'reserve_removed'
  | 'lancamento_added'
  | 'lancamento_executed'
  | 'lancamento_removed'
  | 'lancamento_reverted';
  description: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
}

export interface AppData {
  wallet: Wallet;
  reserves: Reserve[];
  subscriptions: Subscription[];
  bills: Bill[];
  records: Record[];
  notifications: Notification[];
  lancamentos: Lancamento[];
  lastProcessedDate: string;
  userName: string;
  updatedAt?: string;
}

export type RecordType = Record['type'];

export const RECORD_TYPE_LABELS: { [key in RecordType]: string } = {
  manual_adjustment: 'Ajuste Manual',
  subscription_charge: 'Cobrança de Assinatura',
  bill_payment: 'Pagamento de Conta',
  reserve_deposit: 'Depósito na Reserva',
  income_update: 'Atualização de Renda',
  balance_update: 'Atualização de Saldo',
  subscription_added: 'Assinatura Adicionada',
  subscription_removed: 'Assinatura Removida',
  bill_added: 'Conta Adicionada',
  bill_removed: 'Conta Removida',
  reserve_added: 'Reserva Criada',
  reserve_removed: 'Reserva Removida',
  lancamento_added: 'Lançamento Criado',
  lancamento_executed: 'Lançamento Executado',
  lancamento_removed: 'Lançamento Removido',
  lancamento_reverted: 'Lançamento Revertido',
};

export const RECORD_TYPE_COLORS: { [key in RecordType]: string } = {
  manual_adjustment: 'bg-amber-100 text-amber-700',
  subscription_charge: 'bg-red-100 text-red-700',
  bill_payment: 'bg-orange-100 text-orange-700',
  reserve_deposit: 'bg-emerald-100 text-emerald-700',
  income_update: 'bg-blue-100 text-blue-700',
  balance_update: 'bg-purple-100 text-purple-700',
  subscription_added: 'bg-sky-100 text-sky-700',
  subscription_removed: 'bg-gray-100 text-gray-700',
  bill_added: 'bg-indigo-100 text-indigo-700',
  bill_removed: 'bg-gray-100 text-gray-700',
  reserve_added: 'bg-teal-100 text-teal-700',
  reserve_removed: 'bg-gray-100 text-gray-700',
  lancamento_added: 'bg-indigo-100 text-indigo-700',
  lancamento_executed: 'bg-emerald-100 text-emerald-700',
  lancamento_removed: 'bg-gray-100 text-gray-700',
  lancamento_reverted: 'bg-amber-100 text-amber-700',
};
