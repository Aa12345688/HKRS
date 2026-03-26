import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PartItem } from '../components/molecules/PartCard';
import { createApiClient, SyncConfig } from '../lib/api';

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
  { id: 'HKRS-SUS-001', name: 'OHLINS TTX RT 牽瓶避震器', category: '懸吊系統', fitment: ['戰神六代', 'Force 2.0', 'AUGUR'], stock: 12, safeStock: 5, price: 36500, imageUrl: 'https://images.unsplash.com/photo-1615172282427-99392f7a99d4?auto=format&fit=crop&q=80&w=400' },
  { id: 'HKRS-BRK-002', name: 'BREMBO RCS14 直推總泵', category: '煞車系統', fitment: ['全車系通用'], stock: 2, safeStock: 3, price: 8500, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400' },
  { id: 'HKRS-TRN-003', name: 'HKRS 競技型離合器總成', category: '傳動系統', fitment: ['勁戰全系', 'BWS'], stock: 45, safeStock: 10, price: 4200 },
  { id: 'HKRS-ENG-004', name: 'KOSO 63mm 陶瓷汽缸組', category: '引擎零件', fitment: ['三代戰', '四代戰'], stock: 5, safeStock: 2, price: 12800 },
  { id: 'HKRS-ELC-005', name: 'ARACER RC SUPER X 全取代電腦', category: '電控系統', fitment: ['全車系通用'], stock: 8, safeStock: 3, price: 21500 },
  { id: 'HKRS-SUS-006', name: '鯊魚工廠 L35 倒叉系統', category: '懸吊系統', fitment: ['勁戰六代', '水冷BWS'], stock: 3, safeStock: 4, price: 48000 },
];


interface InventoryState {
  parts: PartItem[];
  transactions: Transaction[];
  theme: 'dark' | 'light';
  scanMode: 'auto' | 'manual';
  isSidebarCollapsed: boolean;
  layoutMode: 'auto' | 'mobile' | 'desktop';
  syncConfig: SyncConfig | null;
  isSyncing: boolean;
  
  // Actions
  setSyncConfig: (config: SyncConfig | null) => void;
  fetchFromCloud: () => Promise<void>;
  addPart: (part: PartItem) => Promise<{ success: boolean, message: string }>;
  updateStock: (id: string, amount: number, note?: string) => Promise<boolean>;
  setTheme: (theme: 'dark' | 'light') => void;
  setScanMode: (mode: 'auto' | 'manual') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLayoutMode: (mode: 'auto' | 'mobile' | 'desktop') => void;
  clearTransactions: () => void;
  clearLocalCache: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      parts: INITIAL_PARTS,
      transactions: [],
      theme: 'dark',
      scanMode: 'auto',
      isSidebarCollapsed: false,
      layoutMode: 'auto',
      syncConfig: null,
      isSyncing: false,

      setSyncConfig: (syncConfig) => {
        set({ syncConfig });
        if (syncConfig) get().fetchFromCloud();
      },

      fetchFromCloud: async () => {
        const { syncConfig } = get();
        if (!syncConfig?.url || !syncConfig?.key) return;

        set({ isSyncing: true });
        try {
          const api = createApiClient(syncConfig);
          const [cloudParts, cloudTrans] = await Promise.all([
            api.get('parts'),
            api.get('transactions', '*,timestamp.desc')
          ]);
          
          set({ 
            parts: cloudParts.length > 0 ? cloudParts : INITIAL_PARTS, 
            transactions: cloudTrans || [] 
          });
        } catch (error) {
          console.error('Cloud Fetch Error:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      addPart: async (part) => {
        const state = get();
        const exists = state.parts.some(p => p.id === part.id);
        if (exists) {
          return { success: false, message: `此條碼 ID (${part.id}) 已存在於系統中！` };
        }

        // Local Optimistic Update
        set((state) => ({ parts: [part, ...state.parts] }));

        // Cloud Push
        const { syncConfig } = get();
        if (syncConfig?.url && syncConfig?.key) {
          try {
            const api = createApiClient(syncConfig);
            await api.insert('parts', part);
          } catch (e) {
            console.error('Cloud Sync Error:', e);
          }
        }

        return { success: true, message: '產品新增成功' };
      },
      
      updateStock: async (id, amount, note) => {
        let success = false;
        const state = get();
        const part = state.parts.find(p => p.id === id);
        if (!part) return false;

        const newStock = part.stock + amount;
        if (newStock < 0) return false; // Block negative stock

        const newTransaction: Transaction = {
          id: `tr-${Date.now()}`,
          partId: id,
          partName: part.name,
          type: amount > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(amount),
          timestamp: Date.now(),
          note
        };

        // Local Optimistic Update
        set((state) => ({
          parts: state.parts.map(p => p.id === id ? { ...p, stock: newStock } : p),
          transactions: [newTransaction, ...state.transactions].slice(0, 50)
        }));

        // Cloud Push
        const { syncConfig } = get();
        if (syncConfig?.url && syncConfig?.key) {
          try {
            const api = createApiClient(syncConfig);
            await Promise.all([
              api.upsert('parts', { ...part, stock: newStock }, 'id'),
              api.insert('transactions', newTransaction)
            ]);
            success = true;
          } catch (e) {
            console.error('Cloud Push Error:', e);
            // Revert or show warning? For simplicity, we keep local change.
          }
        } else {
          success = true; // Still "success" locally if no cloud configured
        }

        return success;
      },
      
      setTheme: (theme) => set({ theme }),
      setScanMode: (scanMode) => set({ scanMode }),
      setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      clearTransactions: () => set({ transactions: [] }),
      clearLocalCache: () => {
        localStorage.removeItem('hkrs-inventory-storage');
        set({
          parts: INITIAL_PARTS,
          transactions: [],
          theme: 'dark',
          scanMode: 'auto',
          isSidebarCollapsed: false,
          layoutMode: 'auto',
          syncConfig: null,
          isSyncing: false,
        });
      }
    }),
    {
      name: 'hkrs-inventory-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        scanMode: state.scanMode,
        isSidebarCollapsed: state.isSidebarCollapsed,
        layoutMode: state.layoutMode,
        syncConfig: state.syncConfig
      }),
    }
  )
);
