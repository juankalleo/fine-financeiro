'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { AppData, Subscription, Bill, Record, Reserve, Notification, Lancamento, Category } from './types';
import { initialData } from './initial-data';
import { toast } from 'sonner';

function getStorageKey(username: string): string {
  return `fine_data_v3_${username}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function migrateOldData(username: string): void {
  if (typeof window === 'undefined') return;
  const v3Key = getStorageKey(username);
  // Only migrate if v3 is empty
  if (localStorage.getItem(v3Key)) return;

  // Try specific old keys first
  const oldKeys = [
    `fine_data_v2_${username}`,
    `fine_data_v1_${username}`,
    `fine_data_${username}`,
  ];

  // Only try admin fallbacks if the user is actually admin
  if (username === 'admin') {
    oldKeys.push(`fine_data_v2_admin`, `fine_data_v1_admin`, `fine_data_admin`, `financeapp_data`, `finance_data`);
  }

  for (const oldKey of oldKeys) {
    const old = localStorage.getItem(oldKey);
    if (old) {
      try {
        const parsed = JSON.parse(old);
        // Ensure it has actual financial data (not just empty object)
        if (parsed && (parsed.wallet || parsed.records || parsed.subscriptions)) {
          console.log(`[Store] Migrating data from ${oldKey} to ${v3Key}`);
          localStorage.setItem(v3Key, old);
          return;
        }
      } catch {}
    }
  }

  // Last resort: scan ALL localStorage keys for any fine_data entry
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('fine_data') && key !== v3Key) {
      const old = localStorage.getItem(key);
      if (old) {
        try {
          const parsed = JSON.parse(old);
          if (parsed && (parsed.wallet || parsed.records || parsed.subscriptions)) {
            console.log(`[Store] Migrating data from scanned key ${key} to ${v3Key}`);
            localStorage.setItem(v3Key, old);
            return;
          }
        } catch {}
      }
    }
  }
}

function loadLocalData(username: string): AppData {
  if (typeof window === 'undefined') return initialData;
  // Run migration first to recover any old data
  migrateOldData(username);
  try {
    const stored = localStorage.getItem(getStorageKey(username));
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...initialData, ...parsed };
    }
  } catch { }
  return initialData;
}

function saveLocalData(data: AppData, username: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(username), JSON.stringify(data));
  } catch { }
}

async function syncToKV(data: AppData, username: string) {
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': username 
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Sync failed', error);
  }
}

async function loadFromKV(username: string): Promise<AppData | null> {
  try {
    const res = await fetch('/api/sync', {
      headers: { 'x-user-id': username }
    });
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
  | { type: 'REVERT_LANCAMENTO'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'UPDATE_CATEGORY'; payload: Category };

function createRecord(
  type: Record['type'],
  description: string,
  amount: number,
  prev: number,
  next: number,
  creditInfo?: { isCredit?: boolean; totalAmount?: number; installmentValue?: number; categoryId?: string }
): Record {
  return {
    id: generateId(),
    date: new Date().toISOString(),
    type,
    description,
    amount,
    previousBalance: prev,
    newBalance: next,
    ...creditInfo
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
        records: [
          createRecord(
            'bill_payment',
            `Pago: ${bill.name}`,
            -bill.amount,
            state.wallet.currentBalance,
            nextBal,
            { isCredit: bill.isCredit, totalAmount: bill.totalAmount, installmentValue: bill.installmentValue, categoryId: bill.categoryId }
          ),
          ...state.records
        ],
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
        const effect = newLanc.type === 'income' ? newLanc.amount : -newLanc.amount;
        const nextBal = state.wallet.currentBalance + effect;
        newState = {
          ...updatedState,
          wallet: { ...updatedState.wallet, currentBalance: nextBal },
          records: [
            createRecord(
              'lancamento_executed',
              `Lançamento: ${newLanc.description}`,
              effect,
              state.wallet.currentBalance,
              nextBal,
              { isCredit: newLanc.isCredit, totalAmount: newLanc.totalAmount, installmentValue: newLanc.installmentValue, categoryId: newLanc.categoryId }
            ),
            ...state.records
          ],
        };
      } else {
        newState = {
          ...state,
          lancamentos: [...(state.lancamentos || []), newLanc],
          records: [
            createRecord(
              'lancamento_added',
              `Agendado: ${newLanc.description}`,
              0,
              state.wallet.currentBalance,
              state.wallet.currentBalance,
              { isCredit: newLanc.isCredit, totalAmount: newLanc.totalAmount, installmentValue: newLanc.installmentValue, categoryId: newLanc.categoryId }
            ),
            ...state.records
          ],
        };
      }
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
        records: [
          createRecord(
            'lancamento_executed',
            `Lançamento: ${lanc.description}`,
            effect,
            state.wallet.currentBalance,
            nextBal,
            { isCredit: lanc.isCredit, totalAmount: lanc.totalAmount, installmentValue: lanc.installmentValue, categoryId: lanc.categoryId }
          ),
          ...state.records
        ],
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
        records: [
          createRecord(
            'lancamento_reverted',
            `Revertido: ${lanc.description}`,
            effect,
            state.wallet.currentBalance,
            nextBal,
            { isCredit: lanc.isCredit, totalAmount: lanc.totalAmount, installmentValue: lanc.installmentValue, categoryId: lanc.categoryId }
          ),
          ...state.records
        ],
      };
      break;
    }

    case 'PROCESS_AUTO_CHARGES': {
      const today = new Date().toISOString().split('T')[0];
      if (state.lastProcessedDate === today) return state;
      newState = { ...state, lastProcessedDate: today };
      break;
    }

    case 'UPDATE_USERNAME':
      newState = { ...state, userName: action.payload };
      break;

    case 'RESET_DATA':
      newState = { ...initialData, userName: state.userName };
      break;

    case 'ADD_CATEGORY':
      newState = {
        ...state,
        categories: [...(state.categories || []), { ...action.payload, id: generateId() }],
      };
      break;

    case 'REMOVE_CATEGORY':
      newState = {
        ...state,
        categories: (state.categories || []).filter(c => c.id !== action.payload),
      };
      break;

    case 'UPDATE_CATEGORY':
      newState = {
        ...state,
        categories: (state.categories || []).map(c => c.id === action.payload.id ? action.payload : c),
      };
      break;

    default:
      return state;
  }

  saveLocalData(newState, state.userName || 'default');
  syncToKV(newState, state.userName || 'default');
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

export function AppProvider({ children, username = 'admin' }: { children: React.ReactNode, username?: string }) {
  const [data, dispatch] = useReducer(reducer, { ...initialData, userName: username });
  const [isSyncing, setIsSyncing] = useState(true);

  const refreshFromCloud = useCallback(async () => {
    setIsSyncing(true);
    const kv = await loadFromKV(username);
    if (kv) {
      dispatch({ type: 'SET_DATA', payload: { ...kv, userName: username } });
      saveLocalData(kv, username);
    }
    setIsSyncing(false);
  }, [username]);

  useEffect(() => {
    async function init() {
      setIsSyncing(true);
      console.log(`[Fine] Initializing session for user: ${username}`);
      
      const kv = await loadFromKV(username);
      let dataToSet: AppData | null = null;

      if (kv && Object.keys(kv).length > 0) {
        dataToSet = { ...initialData, ...kv, userName: kv.userName || username };
      }

      if (!dataToSet) {
        const local = loadLocalData(username);
        dataToSet = { ...local, userName: local.userName || username };
      }

      console.log(`[Fine] Session ready for ${username}. Current balance: ${dataToSet.wallet.currentBalance}`);
      dispatch({ type: 'SET_DATA', payload: dataToSet });
      saveLocalData(dataToSet, username);
      setIsSyncing(false);
    }
    init();
  }, [username]);

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
