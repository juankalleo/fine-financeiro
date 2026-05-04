'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { AppData, Subscription, Bill, Record, Reserve, Notification } from './types';
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
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load data from localStorage');
  }
  return initialData;
}

function saveLocalData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error('Failed to save data to localStorage');
  }
}

async function syncToKV(data: AppData) {
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error('Sync failed');
  } catch (error) {
    console.warn('KV Sync failed', error);
  }
}

async function loadFromKV(): Promise<AppData | null> {
  try {
    const res = await fetch('/api/sync');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.wallet) return data as AppData;
  } catch (error) {
    console.warn('Failed to load from KV', error);
  }
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
  | { type: 'RESET_DATA' };

function createRecord(
  type: Record['type'],
  description: string,
  amount: number,
  previousBalance: number,
  newBalance: number
): Record {
  return {
    id: generateId(),
    date: new Date().toISOString(),
    type,
    description,
    amount,
    previousBalance,
    newBalance,
  };
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
      const record = createRecord(
        'manual_adjustment',
        reason,
        diff,
        state.wallet.currentBalance,
        newBalance
      );
      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: newBalance },
        records: [record, ...state.records],
      };
      break;
    }

    case 'UPDATE_INCOME': {
      const { income, updateDate } = action.payload;
      const record = createRecord(
        'income_update',
        `Renda atualizada para R$ ${income.toFixed(2)}`,
        income - state.wallet.currentIncome,
        state.wallet.currentBalance,
        state.wallet.currentBalance
      );
      newState = {
        ...state,
        wallet: {
          ...state.wallet,
          currentIncome: income,
          incomeUpdateDate: updateDate,
        },
        records: [record, ...state.records],
      };
      break;
    }

    case 'ADD_SUBSCRIPTION': {
      const newSub: Subscription = { ...action.payload, id: generateId() };
      newState = {
        ...state,
        subscriptions: [...state.subscriptions, newSub],
        records: [createRecord('subscription_added', `Assinatura "${newSub.name}" adicionada`, 0, state.wallet.currentBalance, state.wallet.currentBalance), ...state.records],
      };
      break;
    }

    case 'UPDATE_SUBSCRIPTION':
      newState = { ...state, subscriptions: state.subscriptions.map(s => s.id === action.payload.id ? action.payload : s) };
      break;

    case 'REMOVE_SUBSCRIPTION':
      newState = { ...state, subscriptions: state.subscriptions.filter(s => s.id !== action.payload) };
      break;

    case 'ADD_BILL': {
      const newBill: Bill = { ...action.payload, id: generateId() };
      newState = {
        ...state,
        bills: [...state.bills, newBill],
        records: [createRecord('bill_added', `Conta "${newBill.name}" adicionada`, 0, state.wallet.currentBalance, state.wallet.currentBalance), ...state.records],
      };
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
      const newBalance = state.wallet.currentBalance - bill.amount;
      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: newBalance },
        bills: state.bills.map(b => b.id === action.payload ? { ...b, paid: true } : b),
        records: [createRecord('bill_payment', `Pagamento "${bill.name}"`, -bill.amount, state.wallet.currentBalance, newBalance), ...state.records],
      };
      break;
    }

    case 'ADD_RESERVE': {
      const newReserve: Reserve = { ...action.payload, id: generateId() };
      newState = {
        ...state,
        reserves: [...state.reserves, newReserve],
        records: [createRecord('reserve_added', `Reserva "${newReserve.name}" criada`, 0, state.wallet.currentBalance, state.wallet.currentBalance), ...state.records],
      };
      break;
    }

    case 'UPDATE_RESERVE':
      newState = { ...state, reserves: state.reserves.map(r => r.id === action.payload.id ? action.payload : r) };
      break;

    case 'REMOVE_RESERVE':
      newState = { ...state, reserves: state.reserves.filter(r => r.id !== action.payload) };
      break;

    case 'TRANSACT_RESERVE': {
      const { reserveId, amount, reason } = action.payload;
      const reserve = state.reserves.find(r => r.id === reserveId);
      if (!reserve) return state;

      const newReserveAmount = reserve.amount + amount;
      const record = createRecord(
        'reserve_deposit',
        `${amount >= 0 ? 'Depósito' : 'Retirada'} em ${reserve.name}: ${reason}`,
        amount,
        state.wallet.currentBalance,
        state.wallet.currentBalance
      );

      const newWalletBalance = state.wallet.currentBalance - amount;

      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: newWalletBalance },
        reserves: state.reserves.map(r => r.id === reserveId ? { ...r, amount: newReserveAmount } : r),
        records: [record, ...state.records],
      };
      break;
    }

    case 'ADD_NOTIFICATION': {
      const newNotif: Notification = {
        ...action.payload,
        id: generateId(),
        date: new Date().toISOString(),
      };
      newState = {
        ...state,
        notifications: [newNotif, ...state.notifications],
      };
      break;
    }

    case 'PROCESS_AUTO_CHARGES': {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const currentDay = today.getDate();

      if (state.lastProcessedDate === todayStr) return state;

      let balance = state.wallet.currentBalance;
      const newRecords: Record[] = [];
      const newNotifs: Notification[] = [];
      let updatedSubs = [...state.subscriptions];
      let updatedBills = [...state.bills];
      let updatedReserves = [...state.reserves];

      // Process subscriptions
      updatedSubs = updatedSubs.map((sub) => {
        if (sub.active && sub.billingDay === currentDay) {
          const lastCharged = sub.lastChargedDate;
          const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
          if (!lastCharged || !lastCharged.startsWith(currentMonth)) {
            const prevBal = balance;
            balance -= sub.amount;
            newRecords.push(createRecord('subscription_charge', `Cobrança automática "${sub.name}"`, -sub.amount, prevBal, balance));
            newNotifs.push({
              id: generateId(),
              date: new Date().toISOString(),
              title: 'Assinatura Paga',
              message: `A assinatura ${sub.name} de ${sub.amount.toFixed(2)} foi descontada automaticamente.`,
              type: 'auto_payment',
            });
            return { ...sub, lastChargedDate: todayStr };
          }
        }
        return sub;
      });

      // Process reserves contribution (on day 1)
      if (currentDay === 1) {
        updatedReserves = updatedReserves.map(reserve => {
          if (reserve.monthlyContribution > 0) {
            const prevBal = balance;
            balance -= reserve.monthlyContribution;
            const newAmount = reserve.amount + reserve.monthlyContribution;
            newRecords.push(createRecord('reserve_deposit', `Depósito mensal: ${reserve.name}`, -reserve.monthlyContribution, prevBal, balance));
            return { ...reserve, amount: newAmount };
          }
          return reserve;
        });
      }

      newState = {
        ...state,
        wallet: { ...state.wallet, currentBalance: balance },
        subscriptions: updatedSubs,
        bills: updatedBills,
        reserves: updatedReserves,
        records: [...newRecords, ...state.records],
        notifications: [...newNotifs, ...state.notifications],
        lastProcessedDate: todayStr,
      };
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

  newState = { ...newState, updatedAt: new Date().toISOString() };
  saveLocalData(newState);
  syncToKV(newState);
  return newState;
}

interface AppContextType {
  data: AppData;
  dispatch: React.Dispatch<Action>;
  isSyncing: boolean;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  refreshFromCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initialData);
  const [isSyncing, setIsSyncing] = useState(true);
  const isFirstLoad = useRef(true);

  const refreshFromCloud = useCallback(async () => {
    setIsSyncing(true);
    const kvData = await loadFromKV();
    if (kvData) {
      dispatch({ type: 'SET_DATA', payload: kvData });
      saveLocalData(kvData);
      toast.success('Dados sincronizados com a nuvem');
    } else {
      toast.error('Não foi possível sincronizar com a nuvem');
    }
    setIsSyncing(false);
  }, []);

  useEffect(() => {
    async function init() {
      setIsSyncing(true);
      const local = loadLocalData();
      const kvData = await loadFromKV();
      
      // Smart Sync Logic
      if (kvData) {
        const kvDate = new Date(kvData.updatedAt || 0).getTime();
        const localDate = new Date(local.updatedAt || 0).getTime();
        
        // If local is the same as initial data, ALWAYS take KV
        const isLocalInitial = JSON.stringify(local.wallet) === JSON.stringify(initialData.wallet) && local.records.length === 0;

        if (isLocalInitial || kvDate >= localDate) {
          dispatch({ type: 'SET_DATA', payload: kvData });
          saveLocalData(kvData);
        } else {
          dispatch({ type: 'SET_DATA', payload: local });
          syncToKV(local);
        }
      } else {
        dispatch({ type: 'SET_DATA', payload: local });
      }
      
      setIsSyncing(false);
      isFirstLoad.current = false;
    }
    init();
  }, []);

  useEffect(() => {
    if (!isSyncing) {
      dispatch({ type: 'PROCESS_AUTO_CHARGES' });
    }
  }, [data.wallet.incomeUpdateDate, isSyncing]);

  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data]);
  const importData = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr) as AppData;
      if (parsed.wallet && parsed.subscriptions) {
        dispatch({ type: 'SET_DATA', payload: parsed });
        return true;
      }
      return false;
    } catch { return false; }
  }, []);

  return (
    <AppContext.Provider value={{ data, dispatch, isSyncing, exportData, importData, refreshFromCloud }}>
      {isSyncing && (
        <div className="fixed top-4 right-4 z-[100]">
          <div className="bg-apple-blue text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
            Sincronizando Nuvem...
          </div>
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppData must be used within an AppProvider');
  return context;
}
