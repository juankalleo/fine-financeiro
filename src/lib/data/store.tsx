'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { AppData, Subscription, Bill, Record, Reserve, Notification, Lancamento } from './types';
import { initialData } from './initial-data';
import { toast } from 'sonner';

const STORAGE_KEY = 'fine_data_v2';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function loadLocalData(): AppData {
  if (typeof window === 'undefined') return initialData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...initialData, ...parsed };
    }
  } catch { }
  return initialData;
}

function saveLocalData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { }
}

async function syncToKV(data: AppData) {
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Sync failed', error);
  }
}

async function loadFromKV(): Promise<AppData | null> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && (data.wallet || data.records)) return { ...initialData, ...data } as AppData;
  } catch (error) { }
  return null;
}

type Action =
  | { type: 'SET_DATA'; payload: AppData }
  | { type: 'UPDATE_BALANCE'; payload: { newBalance: number; reason: string } }
  | { type: 'UPDATE_INCOME'; payload: { income: number; updateDate: string } }
  | { type: 'ADD_SUBSCRIPTION'; payload: Omit<Subscription, 'id'> }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'REMOVE_SUBSCRIPTION'; payload: string }
  | { type: 'ADD_BILL'; payload: Omit<Bill, 'id'> }
  | { type: 'UPDATE_BILL'; payload: Bill }
  | { type: 'REMOVE_BILL'; payload: string }
  | { type: 'PAY_BILL'; payload: string }
  | { type: 'ADD_RESERVE'; payload: Omit<Reserve, 'id'> }
  | { type: 'UPDATE_RESERVE'; payload: Reserve }
  | { type: 'REMOVE_RESERVE'; payload: string }
  | { type: 'TRANSACT_RESERVE'; payload: { reserveId: string; amount: number; reason: string } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'date'> }
  | { type: 'PROCESS_AUTO_CHARGES' }
  | { type: 'UPDATE_USERNAME'; payload: string }
  | { type: 'RESET_DATA' }
  | { type: 'ADD_LANCAMENTO'; payload: Omit<Lancamento, 'id'> }
  | { type: 'UPDATE_LANCAMENTO'; payload: Lancamento }
  | { type: 'REMOVE_LANCAMENTO'; payload: string }
  | { type: 'EXECUTE_LANCAMENTO'; payload: string }
  | { type: 'REVERT_LANCAMENTO'; payload: string };

function createRecord(type: Record['type'], description: string, amount: number, prev: number, next: number): Record {
  return { id: generateId(), date: new Date().toISOString(), type, description, amount, previousBalance: prev, newBalance: next };
}

function reducer(state: AppData, action: Action): AppData {
  let newState: AppData;

  switch (action.type) {
    case 'SET_DATA':
      newState = action.payload;
      break;

    case 'UPDATE_BALANCE': {
      const { newBalance, reason } = action.payload;
      const diff = newBalance - state.wallet.currentBalance;
      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: newBalance },
        records: [createRecord('manual_adjustment', reason, diff, state.wallet.currentBalance, newBalance), ...state.records],
      };
      break;
    }

    case 'UPDATE_INCOME': {
      const { income, updateDate } = action.payload;
      newState = {
        ...state,
        wallet: { ...state.wallet, currentIncome: income, incomeUpdateDate: updateDate },
        records: [createRecord('income_update', `Renda: R$ ${income.toFixed(2)}`, 0, state.wallet.currentBalance, state.wallet.currentBalance), ...state.records],
      };
      break;
    }

    case 'ADD_SUBSCRIPTION': {
      const newSub = { ...action.payload, id: generateId() };
      newState = { ...state, subscriptions: [...state.subscriptions, newSub] };
      break;
    }

    case 'UPDATE_SUBSCRIPTION':
      newState = { ...state, subscriptions: state.subscriptions.map(s => s.id === action.payload.id ? action.payload : s) };
      break;

    case 'REMOVE_SUBSCRIPTION':
      newState = { ...state, subscriptions: state.subscriptions.filter(s => s.id !== action.payload) };
      break;

    case 'ADD_BILL': {
      const newBill = { ...action.payload, id: generateId() };
      newState = { ...state, bills: [...state.bills, newBill] };
      break;
    }

    case 'UPDATE_BILL':
      newState = { ...state, bills: state.bills.map(b => b.id === action.payload.id ? action.payload : b) };
      break;

    case 'REMOVE_BILL':
      newState = { ...state, bills: state.bills.filter(b => b.id !== action.payload) };
      break;

    case 'PAY_BILL': {
      const bill = state.bills.find(b => b.id === action.payload);
      if (!bill) return state;
      const nextBal = state.wallet.currentBalance - bill.amount;
      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: nextBal },
        bills: state.bills.map(b => b.id === action.payload ? { ...b, paid: true } : b),
        records: [createRecord('bill_payment', `Pago: ${bill.name}`, -bill.amount, state.wallet.currentBalance, nextBal), ...state.records],
      };
      break;
    }

    case 'ADD_RESERVE':
      newState = { ...state, reserves: [...state.reserves, { ...action.payload, id: generateId() }] };
      break;

    case 'UPDATE_RESERVE':
      newState = { ...state, reserves: state.reserves.map(r => r.id === action.payload.id ? action.payload : r) };
      break;

    case 'REMOVE_RESERVE':
      newState = { ...state, reserves: state.reserves.filter(r => r.id !== action.payload) };
      break;

    case 'TRANSACT_RESERVE': {
      const { reserveId, amount } = action.payload;
      const res = state.reserves.find(r => r.id === reserveId);
      if (!res) return state;
      const nextBal = state.wallet.currentBalance - amount;
      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: nextBal },
        reserves: state.reserves.map(r => r.id === reserveId ? { ...r, amount: r.amount + amount } : r),
        records: [createRecord('reserve_deposit', `Reserva: ${res.name}`, amount, state.wallet.currentBalance, nextBal), ...state.records],
      };
      break;
    }

    case 'ADD_NOTIFICATION':
      newState = { ...state, notifications: [{ ...action.payload, id: generateId(), date: new Date().toISOString() }, ...state.notifications] };
      break;

    case 'ADD_LANCAMENTO': {
      const newLanc = { ...action.payload, id: generateId() };
      let updatedState = { ...state, lancamentos: [...(state.lancamentos || []), newLanc] };
      
      if (newLanc.executed) {
        // If it's already executed upon creation (e.g. "atualizar agora"), update balance immediately
        const effect = newLanc.type === 'income' ? newLanc.amount : -newLanc.amount;
        const nextBal = state.wallet.currentBalance + effect;
        updatedState = {
          ...updatedState,
          wallet: { ...updatedState.wallet, currentBalance: nextBal },
          records: [createRecord('lancamento_executed', `Lançamento: ${newLanc.description}`, effect, state.wallet.currentBalance, nextBal), ...state.records],
        };
      } else {
        updatedState = {
          ...updatedState,
          records: [createRecord('lancamento_added', `Agendado: ${newLanc.description}`, 0, state.wallet.currentBalance, state.wallet.currentBalance), ...state.records],
        };
      }
      newState = updatedState;
      break;
    }

    case 'UPDATE_LANCAMENTO':
      newState = { ...state, lancamentos: (state.lancamentos || []).map(l => l.id === action.payload.id ? action.payload : l) };
      break;

    case 'REMOVE_LANCAMENTO': {
      const lancToRemove = (state.lancamentos || []).find(l => l.id === action.payload);
      if (!lancToRemove) return state;
      
      let updatedStateRemove = { ...state, lancamentos: (state.lancamentos || []).filter(l => l.id !== action.payload) };
      
      if (lancToRemove.executed) {
        const effect = lancToRemove.type === 'income' ? -lancToRemove.amount : lancToRemove.amount;
        const nextBal = state.wallet.currentBalance + effect;
        updatedStateRemove = {
          ...updatedStateRemove,
          wallet: { ...updatedStateRemove.wallet, currentBalance: nextBal },
          records: [createRecord('lancamento_removed', `Excluído: ${lancToRemove.description}`, effect, state.wallet.currentBalance, nextBal), ...state.records],
        };
      }
      
      newState = updatedStateRemove;
      break;
    }

    case 'EXECUTE_LANCAMENTO': {
      const lanc = (state.lancamentos || []).find(l => l.id === action.payload);
      if (!lanc || lanc.executed) return state;
      const effect = lanc.type === 'income' ? lanc.amount : -lanc.amount;
      const nextBal = state.wallet.currentBalance + effect;
      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: nextBal },
        lancamentos: (state.lancamentos || []).map(l => l.id === action.payload ? { ...l, executed: true } : l),
        records: [createRecord('lancamento_executed', `Lançamento: ${lanc.description}`, effect, state.wallet.currentBalance, nextBal), ...state.records],
      };
      break;
    }

    case 'REVERT_LANCAMENTO': {
      const lanc = (state.lancamentos || []).find(l => l.id === action.payload);
      if (!lanc || !lanc.executed) return state;
      const effect = lanc.type === 'income' ? -lanc.amount : lanc.amount;
      const nextBal = state.wallet.currentBalance + effect;
      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: nextBal },
        lancamentos: (state.lancamentos || []).map(l => l.id === action.payload ? { ...l, executed: false } : l),
        records: [createRecord('lancamento_reverted', `Revertido: ${lanc.description}`, effect, state.wallet.currentBalance, nextBal), ...state.records],
      };
      break;
    }

    case 'PROCESS_AUTO_CHARGES': {
      const today = new Date().toISOString().split('T')[0];
      if (state.lastProcessedDate === today) return state;
      // Simplified auto process logic for speed
      newState = { ...state, lastProcessedDate: today };
      break;
    }

    case 'UPDATE_USERNAME':
      newState = { ...state, userName: action.payload };
      break;

    case 'RESET_DATA':
      newState = initialData;
      break;

    default:
      return state;
  }

  saveLocalData(newState);
  syncToKV(newState);
  return newState;
}

interface AppContextType {
  data: AppData;
  dispatch: React.Dispatch<Action>;
  isSyncing: boolean;
  refreshFromCloud: () => Promise<void>;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initialData);
  const [isSyncing, setIsSyncing] = useState(true);

  const refreshFromCloud = useCallback(async () => {
    setIsSyncing(true);
    const kv = await loadFromKV();
    if (kv) {
      dispatch({ type: 'SET_DATA', payload: kv });
      saveLocalData(kv);
    }
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    async function init() {
      const kv = await loadFromKV();
      if (kv) {
        dispatch({ type: 'SET_DATA', payload: { ...initialData, ...kv } });
        saveLocalData({ ...initialData, ...kv });
      } else {
        dispatch({ type: 'SET_DATA', payload: loadLocalData() });
      }
      setIsSyncing(false);
    }
    init();
  }, []);

  return (
    <AppContext.Provider value={{ data, dispatch, isSyncing, refreshFromCloud, exportData: () => JSON.stringify(data), importData: () => false }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppData must be used within an AppProvider');
  return context;
}
