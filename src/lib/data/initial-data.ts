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
  categories: [
    { id: 'cat-1', name: 'Mercado', icon: '🛒', color: '#FCD34D' },
    { id: 'cat-2', name: 'Saúde', icon: '🏥', color: '#F87171' },
    { id: 'cat-3', name: 'Lazer', icon: '🎟️', color: '#60A5FA' },
    { id: 'cat-4', name: 'Transporte', icon: '🚗', color: '#9CA3AF' },
    { id: 'cat-5', name: 'Alimentação', icon: '🍔', color: '#FB923C' },
    { id: 'cat-6', name: 'Contas Fixas', icon: '📄', color: '#4ADE80' },
    { id: 'cat-7', name: 'Educação', icon: '🎓', color: '#818CF8' },
    { id: 'cat-8', name: 'Beleza', icon: '✨', color: '#F472B6' },
    { id: 'cat-9', name: 'Assinaturas', icon: '💳', color: '#A78BFA' },
    { id: 'cat-10', name: 'Outros', icon: '📦', color: '#D1D5DB' },
  ],
  lastProcessedDate: new Date().toISOString().split('T')[0],
  userName: 'Usuário',
};
