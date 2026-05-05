import { AppData } from './types';

export const initialData: AppData = {
  wallet: {
    currentBalance: 0,
    currentIncome: 0,
    incomeUpdateDate: new Date().toISOString().split('T')[0],
  },
  reserves: [],
  subscriptions: [],
  bills: [],
  records: [],
  notifications: [],
  lancamentos: [],
  lastProcessedDate: new Date().toISOString().split('T')[0],
  userName: 'Usuário',
};
