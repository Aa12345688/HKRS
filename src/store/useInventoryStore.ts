import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PartItem } from '../components/molecules/PartCard';

export interface Transaction {
  id: string;
  partId: string;
  partName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  timestamp: number;
  note?: string;
}

const INITIAL_PARTS: PartItem[] = [
  {
    id: 'HKRS-SUS-001',
    name: 'Ohlins TTX RT 牽瓶避震器',
    category: '懸吊系統',
    fitment: ['勁戰六代', 'Force 2.0', 'AUGUR'],
    stock: 12,
    safeStock: 5,
    price: 36500,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'HKRS-BRK-002',
    name: 'Brembo RCS14 直推總泵',
    category: '煞車系統',
    fitment: ['全車系通用'],
    stock: 2,
    safeStock: 3,
    price: 8500,
  }
];

interface InventoryState {
  parts: PartItem[];
  transactions: Transaction[];
  theme: 'dark' | 'light';
  scanMode: 'auto' | 'manual';
  
  // Actions
  addPart: (part: PartItem) => { success: boolean, message: string };
  updateStock: (id: string, amount: number, note?: string) => boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  setScanMode: (mode: 'auto' | 'manual') => void;
  clearTransactions: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      parts: INITIAL_PARTS,
      transactions: [],
      theme: 'dark',
      scanMode: 'auto',

      addPart: (part) => {
        const state = get();
        const exists = state.parts.some(p => p.id === part.id);
        if (exists) {
          return { success: false, message: `此條碼 ID (${part.id}) 已存在於系統中！` };
        }
        set((state) => ({ parts: [part, ...state.parts] }));
        return { success: true, message: '產品新增成功' };
      },
      
      updateStock: (id, amount, note) => {
        let success = false;
        set((state) => {
          const part = state.parts.find(p => p.id === id);
          if (!part) return state;

          const newStock = part.stock + amount;
          if (newStock < 0) return state; // Block negative stock

          success = true;
          const newParts = state.parts.map(p => p.id === id ? { ...p, stock: newStock } : p);
          
          const newTransaction: Transaction = {
            id: `tr-${Date.now()}`,
            partId: id,
            partName: part.name,
            type: amount > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(amount),
            timestamp: Date.now(),
            note
          };

          return { 
            parts: newParts, 
            transactions: [newTransaction, ...state.transactions].slice(0, 100) // Keep last 100
          };
        });
        return success;
      },
      
      setTheme: (theme) => set({ theme }),
      setScanMode: (scanMode) => set({ scanMode }),
      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'hkrs-inventory-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          try {
            const res = await fetch(`/api/sync?t=${Date.now()}`);
            if (res.ok) {
              const text = await res.text();
              return text || null;
            }
          } catch (e) {}
          return localStorage.getItem(name);
        },
        setItem: async (name: string, value: string) => {
          try {
            fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: value,
            }).catch(() => {});
          } catch (e) {}
          localStorage.setItem(name, value);
        },
        removeItem: async (name: string) => localStorage.removeItem(name)
      }))
    }
  )
);
