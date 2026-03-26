import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { llmService } from "./llmService";
import { yoloService } from "./yoloService";
import { notificationService } from "./notificationService";

/**
 * 介面 (Interface): 單件掃描食材 (ScannedItem)
 * 用於規範每一個被系統記錄或 YOLO 辨識出來的食材結構。
 */
export interface ScannedItem {
    id: string;
    name: string;
    quantity: number;
    timestamp: number;
    category?: string;
    freshness?: number; // 0-10
    expiryDays?: number; // Days until expiry
    confidence?: number;
    isSpoiled?: boolean;
    box?: number[]; // [x1, y1, x2, y2]
    storageType?: "fridge" | "freezer";
}

export interface WasteRecord {
    date: string;
    amount: number; // in grams or items
    items?: string[]; // 具體浪費的食材名稱清單
}

interface IngredientContextType {
    scannedItems: ScannedItem[];
    recommendedRecipes: any[];
    tempDetections: ScannedItem[];
    selectedIds: string[];
    settings: { 
        notifications: boolean; 
        neuralOptimized: boolean; 
        confidenceThreshold: number; 
        darkMode: boolean;
        dietary: {
            vegetarian: boolean;
            lowCalorie: boolean;
            allergies: string;
        };
        uiScale: number;
        autoScale: boolean;
        customApiKeys: string;
        themeColor: string;
        mainBg: string;
        subBg: string;
        language: 'zh' | 'en';
        isModalOpen: boolean;
    };
    wasteHistory: WasteRecord[];
    savedRecipes: any[];
    addItem: (item: Partial<ScannedItem>, source?: "ai" | "manual") => void;
    updateQuantity: (id: string, delta: number) => void;
    updateItem: (id: string, updates: Partial<ScannedItem>) => void;
    removeItem: (id: string) => void;
    removeIngredient: (id: string) => void;
    toggleSelection: (id: string) => void;
    generateRecipe: () => Promise<void>;
    saveRecipe: (recipe: any) => void;
    unsaveRecipe: (recipeId: string) => void;
    clearAll: () => void;
    clearInventory: () => void;
    clearWasteHistory: () => void;
    resetSettings: () => void;
    setRecipes: (recipes: any[]) => void;
    clearTempDetections: () => void;
    t: (key: string, replacements?: Record<string, string | number>) => string;
    updateSettings: (settings: Partial<IngredientContextType['settings']>) => void;
}

const UI_TRANSLATIONS: Record<'zh' | 'en', Record<string, string>> = {
    zh: {
        // Nav
        'nav.scan': '掃描',
        'nav.inventory': '庫存',
        'nav.recipes': '食譜',
        'nav.saved': '收藏',
        'nav.profile': '個人',
        
        // General
        'common.confirm': '確認',
        'common.cancel': '取消',
        'common.delete': '刪除',
        'common.edit': '編輯',
        'common.back': '返回',
        'common.loading': '載入中...',
        'common.fresh': '新鮮',
        'common.expired': '已過期',
        'common.spoiled': '偵測損壞',
        'common.days': '天',
        
        // Inventory
        'inventory.fridge': '冷藏庫',
        'inventory.freezer': '冷凍庫',
        'inventory.all': '全部',
        'inventory.veg': '蔬菜',
        'inventory.fruit': '水果',
        'inventory.meat': '肉類',
        'inventory.seafood': '海鮮',
        'inventory.dairy': '乳製品',
        'inventory.grains': '五穀',
        'inventory.other': '其他',
        'inventory.generate': '生成 AI 食譜',
        'inventory.generating': '正在量子合成...',
        'inventory.empty': '存貨區空空如也',
        'inventory.logs': '庫存日誌',
        'inventory.days_left': '保鮮 $1 天',
        'inventory.expiring_soon': '即將到期 ($1天)',
        'inventory.registered': '登錄',
        

        
        // Settings
        'settings.title': '系統設定',
        'settings.language': '系統語言',
        'settings.dark_mode': '深色模式',
        'settings.auto_scale': '自動縮放',
        'settings.ui_scale': '介面縮放',
        'settings.notifications': '食材到期提醒',
        'settings.neural_opt': '清單自動優化',
        'settings.reset': '重設設定',
        'settings.clear_data': '清除所有數據',
        'alert.select_ingredients': '請選擇有效的食材進行合成（損壞食材將自動排除）',
        'alert.stats_updated': '📊 數據統計更新',
        'alert.waste_added': '已將 "$1" 計入今日浪費數據',
        'alert.cleanup': '🧹 系統清理',
        'alert.inventory_cleared': '已清空所有庫存資料',
        'alert.waste_cleared': '已清空所有浪費統計數據',
        'alert.reset': '⚙️ 系統還原',
        'alert.settings_restored': '已將設定還原為初始狀態 (金鑰已保留)',
        'alert.waste_data_title': '📊 數據統計更新',
        'alert.waste_added_msg': '已將 "$1" 計入今日浪費數據',
        'error.provider': 'useIngredients 續在 IngredientProvider 內使用',
        
        // Saved
        'saved.no_recipes': '錯誤：未發現已儲存規程',
        'saved.return_scanner': '返回掃描器',
        'saved.collection': '個人收藏庫',
        
        // Scanner
        'scanner.aim': '請將鏡頭對準食材',
        'scanner.protocol': 'AI 協定：自動神經同步',
        'scanner.list': '掃描清單',
        'scanner.ai_results': 'AI 辨識結果',
        'scanner.clear': '清除全部',
        'scanner.booting': '系統啟動中...',
        'scanner.analyzing': '分析數據中...',
        'scanner.ready': '傳感器就緒',
        'scanner.start': '開始掃描',
        'scanner.stop': '停止掃描',
        'scanner.sensitivity': '辨識靈敏度',
        'scanner.stable': '穩定精準',
        'scanner.balanced': '均衡',
        'scanner.flexible': '靈活偵測',
        'scanner.yolo': '本地 YOLO 辨識',
        'scanner.gemini': '雲端 GEMINI 辨識',
        'scanner.offline': '離線狀態',
        'scanner.linking': '雲端同步中...',
        'scanner.gemini_ready': 'GEMINI 就緒',
        'scanner.good': '良好',
        'scanner.bad': '損壞',
        'scanner.refresh': '重新整理畫面',
        'scanner.cloud_scan': '雲端掃描',
        
        // Recipes
        'recipes.analyzing': '正在分析生物數據...',
        'recipes.synthesizing': '合成烹飪規程',
        'recipes.filtering': '過濾有害物質',
        'recipes.verification': '生物安全檢查',
        'recipes.complete': '掃描完成：規程已核准食用',
        'recipes.no_protocols': '未發現相容規程',
        'recipes.rescan': '請重新掃描目標',
        'recipes.return': '返回傳感器',
        'recipes.match': '匹配度',
        'recipes.eco': '環保',
        'recipes.reco': 'AI 推薦',
        'recipes.cook': '開始烹飪',
        'recipes.servings': '$1 人份',
        'recipes.substitution_advice': 'AI 替換建議',
        'recipes.zero_waste_protocol': '零浪費規程',
        'recipes.reanalyze': '重新分析與合成',
        'recipes.store': '儲存至資料庫',
        'recipes.stored': '已儲存規程',
        'recipes.synced': '已同步至記憶晶片',
        'recipes.view_collection': '查看我的收藏',
        'recipes.requirements': '需求食材',
        'recipes.protocols': '烹飪步驟',
        'recipes.checklist': '食材清單',
        'recipes.prep_progress': '準備進度',
        'recipes.cooking_protocol': '烹飪流程',
        'recipes.alert_new_protocol': 'AI 已生成新規程！',
        'recipes.alert_synthesis_failed': '合成失敗',
        
        // Profile
        'profile.api': '神經節點',
        'profile.dietary': '飲食偏好',
        'profile.theme': '視覺風格',
        'profile.display': '介面縮放',
        'profile.system': '系統設定',
        'profile.data': '數據管理',
        'profile.analytics': '數據分析',
        'profile.analytics_desc': 'Consumption Dashboard',
        'profile.certified': '認證：味覺大師',
        
        // System Config additions
        'settings.current_language': '當前: $lang',
        'common.traditional_chinese': '繁體中文',
        'common.english': 'ENGLISH',
        'settings.settings_configuration': '系統設定與配置',
        'settings.node_status': '節點狀態',
        'settings.google_gemini_api_key': 'Google Gemini API 金鑰',
        'settings.quick_palettes': '快速配色方案',
        'settings.main_bg': '主背景色',
        'settings.sub_bg': '副背景色',
        'settings.atmosphere_sync': '環境光同步',
        'settings.adaptive_zoom': '自動適配縮放',
        'settings.manual_scaling': '手動介面縮放',
        'settings.standard_retina': '標準視網膜',
        'settings.comfortable_reading': '舒適閱讀',
        'settings.super_magnifier': '超級放大鏡',
        'alert.adaptive_zoom_info': '提示：自動適配縮放將根據解析度自動判斷最佳比例。',
        'settings.confidence_threshold': '信心閾值',
        'common.model': '模型',
        'common.none': '無',
        'common.api_key': 'API 金鑰',
        'common.save': '儲存',
        'common.testing': '測試中',
        'common.test_connection': '測試連線',
        'common.connection_status': '連線狀態',
        'common.default_model': '預設模型',
        'common.online': '連線中',
        'common.offline': '離線',
        'common.stable': '穩定',
        'dietary.preferences': '飲食偏好',
        'dietary.allergies': '過敏原',
        'dietary.vegetarian': '素食',
        'dietary.low_calorie': '低卡',
        'dietary.nuts': '堅果',
        'alert.key_updated': '金鑰已更新',
        'alert.system_reloaded': '系統核心已重新掛載',
        'alert.connection_success': '連線成功',
        'alert.connection_failed': '連線失敗',
        'alert.check_network_api_key': '請檢查網路與 API 金鑰',
        'common.waiting': '等待中...',
    },
    en: {
        // Nav
        'nav.scan': 'SCAN',
        'nav.inventory': 'INVY',
        'nav.recipes': 'RECIPE',
        'nav.saved': 'SAVE',
        'nav.profile': 'ME',
        
        // General
        'common.confirm': 'CONFIRM',
        'common.cancel': 'CANCEL',
        'common.delete': 'DELETE',
        'common.edit': 'EDIT',
        'common.back': 'BACK',
        'common.loading': 'LOADING...',
        'common.fresh': 'FRESH',
        'common.expired': 'EXPIRED',
        'common.spoiled': 'SPOILED',
        'common.days': 'DAYS',
        
        // Inventory
        'inventory.fridge': 'FRIDGE',
        'inventory.freezer': 'FREEZER',
        'inventory.all': 'ALL',
        'inventory.veg': 'VEG',
        'inventory.fruit': 'FRUIT',
        'inventory.meat': 'MEAT',
        'inventory.seafood': 'SEAFOOD',
        'inventory.dairy': 'DAIRY',
        'inventory.grains': 'GRAINS',
        'inventory.other': 'OTHER',
        'inventory.generate': 'GEN RECIPE',
        'inventory.generating': 'QUANTUM SYNC...',
        'inventory.empty': 'STOCK AREA EMPTY',
        'inventory.logs': 'INVENTORY LOGS',
        'inventory.days_left': 'FRESH $1 DAYS',
        'inventory.expiring_soon': 'EXPIRING ($1D)',
        'inventory.registered': 'REG',
        
        // Settings
        'settings.title': 'SYSTEM CONFIG',
        'settings.language': 'LANGUAGE',
        'settings.dark_mode': 'DARK MODE',
        'settings.auto_scale': 'AUTO SCALE',
        'settings.ui_scale': 'UI SCALE',
        'settings.notifications': 'EXPIRY ALERTS',
        'settings.neural_opt': 'AUTO-OPTIMIZE',
        'settings.reset': 'RESET SYSTEM',
        'settings.clear_data': 'PURGE ALL DATA',
        'alert.select_ingredients': 'Please select valid ingredients (spoiled items will be excluded)',
        'alert.stats_updated': '📊 Data statistics updated',
        'alert.waste_added': 'Added "$1" to today\'s waste data',
        'alert.cleanup': '🧹 System cleanup',
        'alert.inventory_cleared': 'All inventory data cleared',
        'alert.waste_cleared': 'All waste statistics data cleared',
        'alert.reset': '⚙️ System reset',
        'alert.settings_restored': 'Settings restored to initial state (API keys retained)',
        'alert.waste_data_title': '📊 Data statistics updated',
        'alert.waste_added_msg': 'Added "$1" to today\'s waste data',
        'error.provider': 'useIngredients must be used within an IngredientProvider',

        // Saved
        'saved.no_recipes': 'ERROR: NO SAVED RECIPES FOUND',
        'saved.return_scanner': 'RETURN TO SCANNER',
        'saved.collection': 'COLLECTION',

        // Scanner
        'scanner.aim': 'AIM CAMERA AT SUBJECTS',
        'scanner.protocol': 'AI PROTOCOL: AUTOMATIC NEURAL SYNC',
        'scanner.list': 'SCAN LIST',
        'scanner.ai_results': 'AI RESULTS',
        'scanner.clear': 'CLEAR ALL',
        'scanner.booting': 'BOOTING...',
        'scanner.analyzing': 'ANALYZING...',
        'scanner.ready': 'SCANNER READY',
        'scanner.start': 'START SCAN',
        'scanner.stop': 'STOP SCAN',
        'scanner.sensitivity': 'SENSITIVITY',
        'scanner.stable': 'STRICT',
        'scanner.balanced': 'BALANCED',
        'scanner.flexible': 'SENSITIVE',
        'scanner.yolo': 'YOLO LOCAL',
        'scanner.gemini': 'GEMINI CLOUD',
        'scanner.offline': 'OFFLINE',
        'scanner.linking': 'LINKING...',
        'scanner.gemini_ready': 'GEMINI READY',
        'scanner.good': 'GOOD',
        'scanner.bad': 'BAD',
        'scanner.refresh': 'REFRESH VIEW',
        'scanner.cloud_scan': 'CLOUD SCAN',
        
        // Recipes
        'recipes.analyzing': 'ANALYZING BIO-DATA...',
        'recipes.synthesizing': 'SYNTHESIZING PROTOCOLS',
        'recipes.filtering': 'FILTERING HAZARDS',
        'recipes.verification': 'BIO-SAFETY VERIFICATION',
        'recipes.complete': 'SCAN COMPLETE: PROTOCOLS VERIFIED',
        'recipes.no_protocols': 'NO COMPATIBLE PROTOCOLS',
        'recipes.rescan': 'RE-SCAN SUBJECTS',
        'recipes.return': 'RETURN TO SENSOR',
        'recipes.match': 'MATCH',
        'recipes.eco': 'ECO',
        'recipes.reco': 'AI RECO',
        'recipes.cook': 'COOK',
        'recipes.servings': '$1 SERVING',
        'recipes.substitution_advice': 'AI SUBSTITUTION ADVICE',
        'recipes.zero_waste_protocol': 'ZERO WASTE PROTOCOL',
        'recipes.reanalyze': 'RE-ANALYZE & SYNTHESIZE',
        'recipes.store': 'STORE TO DATABASE',
        'recipes.stored': 'RECIPE STORED',
        'recipes.synced': 'SYNCED TO MEMORY CHIP',
        'recipes.view_collection': 'VIEW COLLECTION',
        'recipes.requirements': 'REQUIREMENTS',
        'recipes.protocols': 'PROTOCOLS',
        'recipes.checklist': 'INGREDIENTS CHECKLIST',
        'recipes.prep_progress': 'PREP PROGRESS',
        'recipes.cooking_protocol': 'COOKING PROTOCOL',
        'recipes.alert_new_protocol': 'AI GENERATED NEW PROTOCOL!',
        'recipes.alert_synthesis_failed': 'SYNTHESIS FAILED',
        
        // Profile
        'profile.api': 'Neural API',
        'profile.dietary': 'Dietary',
        'profile.theme': 'Visual Theme',
        'profile.display': 'Scale',
        'profile.system': 'System',
        'profile.data': 'Data',
        'profile.analytics': 'Analytics',
        'profile.analytics_desc': 'Neural Insights',
        'profile.certified': 'CERTIFIED: TASTEMASTER',
        
        // System Config additions
        'settings.current_language': 'CURRENT: $lang',
        'common.traditional_chinese': 'Traditional Chinese',
        'common.english': 'ENGLISH',
        'settings.settings_configuration': 'Settings & Configuration',
        'settings.node_status': 'NODE STATUS',
        'settings.google_gemini_api_key': 'Google Gemini API KEY',
        'settings.quick_palettes': 'Quick Palettes',
        'settings.main_bg': 'Main BG',
        'settings.sub_bg': 'Sub BG',
        'settings.atmosphere_sync': 'ATMOSPHERE SYNC',
        'settings.adaptive_zoom': 'ADAPTIVE ZOOM',
        'settings.manual_scaling': 'Manual Scaling',
        'settings.standard_retina': 'Standard Retina',
        'settings.comfortable_reading': 'Comfortable Reading',
        'settings.super_magnifier': 'Super Magnifier',
        'alert.adaptive_zoom_info': 'INFO: ADAPTIVE ZOOM WILL AUTOMATICALLY DETERMINE THE BEST RATIO.',
        'settings.confidence_threshold': 'CONFIDENCE THRESHOLD',
        'common.model': 'Model',
        'common.none': 'None',
        'common.api_key': 'API KEY',
        'common.save': 'SAVE',
        'common.testing': 'TESTING',
        'common.test_connection': 'TEST CONNECTION',
        'common.connection_status': 'Connection Status',
        'common.default_model': 'Default Model',
        'common.online': 'Online',
        'common.offline': 'Offline',
        'common.stable': 'Stable',
        'dietary.preferences': 'Preferences',
        'dietary.allergies': 'Allergies',
        'dietary.vegetarian': 'Vegetarian',
        'dietary.low_calorie': 'Low Calorie',
        'dietary.nuts': 'Nuts',
        'alert.key_updated': 'API Key Updated',
        'alert.system_reloaded': 'System Core Reloaded',
        'alert.connection_success': 'Connection Success',
        'alert.connection_failed': 'Connection Failed',
        'alert.check_network_api_key': 'Check Network & API Key',
        'common.waiting': 'WAITING...',
    }
};

/**
 * 上下文宣告 (Context Context): IngredientContext
 * 用來實現跨元件共享狀態 (Global State)，避免 Props Drilling。
 */
const IngredientContext = createContext<IngredientContextType | undefined>(undefined);

/**
 * 狀態池提供者 (Provider): IngredientProvider
 * 必須包在應用程式的最外層 (如 App.tsx)，它持有並管理所有核心業務資料：
 * 1. 冰箱內所有庫存 (scannedItems)
 * 2. 暫存辨識清單 (tempDetections)
 * 3. 系統全域設定 (settings)
 * 4. 食譜庫 (recommendedRecipes)
 */
export function IngredientProvider({ children }: { children: ReactNode }) {
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [recommendedRecipes, setRecommendedRecipes] = useState<any[]>([]);
    const [tempDetections, setTempDetections] = useState<ScannedItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [settings, setSettings] = useState({ 
        notifications: true, 
        neuralOptimized: true, 
        confidenceThreshold: 0.25, 
        darkMode: true,
        dietary: {
            vegetarian: false,
            lowCalorie: false,
            allergies: ""
        },
        uiScale: 1.0,
        autoScale: true,
        customApiKeys: "",
        themeColor: "#00ff88",
        mainBg: "#0f2e24",
        subBg: "#1a4d3d",
        language: "zh" as "zh" | "en",
        isModalOpen: false
    });
    const [savedRecipes, setSavedRecipes] = useState<any[]>([]);

    const [wasteHistory, setWasteHistory] = useState<WasteRecord[]>([]);

    // Load from localStorage on mount & Pre-warm YOLO
    useEffect(() => {
        yoloService.prewarm(); // 全域預熱模型
        
        const saved = localStorage.getItem("scannedIngredients");
        const savedRecs = localStorage.getItem("recommendedRecipes");
        const savedSettings = localStorage.getItem("appSettings");
        const savedBookmarked = localStorage.getItem("savedRecipes");
        const savedWaste = localStorage.getItem("wasteHistory");
        
        if (saved) try { setScannedItems(JSON.parse(saved)); } catch (e) { setScannedItems([]); }
        if (savedRecs) try { setRecommendedRecipes(JSON.parse(savedRecs)); } catch (e) { setRecommendedRecipes([]); }
        if (savedSettings) {
            try { 
                const parsed = JSON.parse(savedSettings);
                // Migration: Ensure dietary settings exist
                if (!parsed.dietary) {
                    parsed.dietary = { vegetarian: false, lowCalorie: false, allergies: "" };
                }
                if (parsed.uiScale === undefined) parsed.uiScale = 1.0;
                if (parsed.autoScale === undefined) parsed.autoScale = true;
                if (parsed.customApiKeys === undefined) parsed.customApiKeys = "";
                if (parsed.themeColor === undefined || parsed.themeColor === "var(--primary-default)") parsed.themeColor = "#00ff88";
                if (parsed.mainBg === undefined) parsed.mainBg = "#0f2e24";
                if (parsed.subBg === undefined) parsed.subBg = "#1a4d3d";
                if (parsed.language === undefined) parsed.language = "zh";
                setSettings(parsed); 
            } catch (e) { }
        }
        if (savedBookmarked) try { setSavedRecipes(JSON.parse(savedBookmarked)); } catch (e) { setSavedRecipes([]); }
        if (savedWaste) {
            try { 
                const parsed = JSON.parse(savedWaste);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setWasteHistory(parsed); 
                } else {
                    setWasteHistory([]);
                }
            } catch (e) { setWasteHistory([]); }
        } else {
            setWasteHistory([]);
        }
    }, []);

    // Notification check effect
    useEffect(() => {
        if (settings.notifications && scannedItems.length > 0) {
            // 延遲一點執行，避免剛載入時太突兀
            const timer = setTimeout(() => {
                notificationService.checkAndNotify(scannedItems, settings);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [scannedItems, settings.notifications]);

    // Sync custom API keys to LLM service
    useEffect(() => {
        if (settings.customApiKeys !== undefined) {
            llmService.setCustomApiKeys(settings.customApiKeys);
        }
    }, [settings.customApiKeys]);

    /** 同步狀態至本地端 localStorage，實現離線存取與關閉保留 (Data Persistence) */
    useEffect(() => {
        localStorage.setItem("scannedIngredients", JSON.stringify(scannedItems));
    }, [scannedItems]);

    useEffect(() => {
        localStorage.setItem("recommendedRecipes", JSON.stringify(recommendedRecipes));
    }, [recommendedRecipes]);

    useEffect(() => {
        localStorage.setItem("appSettings", JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
    }, [savedRecipes]);

    useEffect(() => {
        localStorage.setItem("wasteHistory", JSON.stringify(wasteHistory));
    }, [wasteHistory]);

    /**
     * 新增單一食材進入庫存
     * 實施「智慧批次合併邏輯」：
     * 1. 只有當食材名稱、儲存位置相同，且登錄時間相差在 1 小時內時，才會進行合併。
     * 2. 超過 1 小時的新增將視為「新採購批次」，獨立顯示以確保食品安全。
     */
    const addItem = (item: Partial<ScannedItem>, source: "ai" | "manual" = "ai") => {
        const now = Date.now();
        const BATCH_THRESHOLD = 3600000; // 1 小時 (毫秒)
        const uniqueId = item.id || `${now}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newItem: ScannedItem = {
            id: uniqueId,
            name: item.name || "未知食材",
            quantity: item.quantity || 1,
            timestamp: item.timestamp || now,
            category: item.category || "其他",
            storageType: item.storageType || "fridge",
            expiryDays: item.expiryDays !== undefined ? item.expiryDays : 7,
            ...item
        };

        setScannedItems(prev => {
            // 尋找符合合併條件的既存項目：名稱相同、品質相同、位置相同、且時間在一小時內
            const existing = prev.find(i => 
                i.name.toLowerCase() === newItem.name.toLowerCase() && 
                i.isSpoiled === newItem.isSpoiled && 
                i.storageType === newItem.storageType &&
                Math.abs(now - (i.timestamp || now)) < BATCH_THRESHOLD
            );

            if (existing) {
                return prev.map(i =>
                    i.id === existing.id
                        ? { ...i, quantity: i.quantity + newItem.quantity, timestamp: now } // 更新數量並刷新時間（同批次）
                        : i
                );
            }
            return [...prev, newItem]; // 不同批次，獨立新增
        });

        // 同步更新暫存辨識清單 (僅限 AI 模式)
        if (source === "ai") {
            setTempDetections(prev => {
                const existing = prev.find(i => 
                    i.name.toLowerCase() === newItem.name.toLowerCase() && 
                    i.isSpoiled === newItem.isSpoiled && 
                    i.storageType === newItem.storageType &&
                    Math.abs(now - (i.timestamp || now)) < BATCH_THRESHOLD
                );
                
                if (existing) {
                    return prev.map(i =>
                        i.id === existing.id
                            ? { ...i, quantity: i.quantity + newItem.quantity, timestamp: now }
                            : i
                    );
                }
                return [...prev, newItem];
            });
        }

        // Auto-select ONLY IF NOT SPOILED
        if (!newItem.isSpoiled) {
            setSelectedIds(prev => {
                const existingItem = scannedItems.find(i => i.name.toLowerCase() === newItem.name.toLowerCase() && i.isSpoiled === newItem.isSpoiled && i.storageType === newItem.storageType);
                const targetId = existingItem ? existingItem.id : uniqueId;
                return prev.includes(targetId) ? prev : [...prev, targetId];
            });
        }
    };

    const clearTempDetections = () => setTempDetections([]);

    const updateQuantity = (id: string, delta: number) => {
        const updater = (prev: ScannedItem[]) =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
            ).filter(item => item.quantity > 0);

        setScannedItems(updater);
        setTempDetections(updater);
    };

    const updateItem = (id: string, updates: Partial<ScannedItem>) => {
        setScannedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
        setTempDetections(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const removeItem = (id: string) => {
        if (!id) return;
        
        const itemToRemove = scannedItems.find(i => i.id === id);
        
        if (itemToRemove) {
            const now = Date.now();
            const daysPassed = Math.floor((now - (itemToRemove.timestamp || now)) / (1000 * 60 * 60 * 24));
            const expiryDays = itemToRemove.expiryDays !== undefined ? itemToRemove.expiryDays : 7;
            const daysLeft = expiryDays - daysPassed;
            
            // 判定條件：已標記損壞、天數到期、或手動設為 0
            const isWaste = itemToRemove.isSpoiled || daysLeft <= 0 || expiryDays <= 0;
            
            if (isWaste) {
                // 發送即時通知，告知數據已錄入
                notificationService.send(t('alert.waste_data_title'), t('alert.waste_added_msg', { 1: itemToRemove.name }));

                setWasteHistory(prev => {
                    const today = new Date();
                    // 格式：YYYY-MM-DD (精確到本地日期)
                    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    
                    const newHistory = [...prev];
                    const existingIdx = newHistory.findIndex(h => h.date === dateStr);
                    
                    if (existingIdx !== -1) {
                        const existing = newHistory[existingIdx];
                        newHistory[existingIdx] = {
                            ...existing,
                            amount: (Number(existing.amount) || 0) + 1,
                            items: Array.from(new Set([...(existing.items || []), itemToRemove.name]))
                        };
                    } else {
                        newHistory.push({
                            date: dateStr,
                            amount: 1,
                            items: [itemToRemove.name]
                        });
                        newHistory.sort((a, b) => a.date.localeCompare(b.date));
                    }
                    return newHistory;
                });
            }
        }

        setScannedItems(prev => prev.filter(item => item.id !== id));
        setTempDetections(prev => prev.filter(item => item.id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    };

    const removeIngredient = removeItem;

    const generateRecipe = async () => {
        const selectedIngredients = scannedItems
            .filter(item => selectedIds.includes(item.id) && !item.isSpoiled)
            .map(item => item.name);

        if (selectedIngredients.length === 0) {
            throw new Error("請選擇有效的食材進行合成（損壞食材將自動排除）");
        }

        const recipes = await llmService.generateRecipes({ 
            ingredients: selectedIngredients,
            preferences: JSON.stringify(settings.dietary),
            language: settings.language as 'zh' | 'en'
        });
        setRecommendedRecipes(recipes);
    };

    const toggleSelection = (id: string) => {
        const item = scannedItems.find(i => i.id === id);
        if (item?.isSpoiled) return; // Cannot select spoiled items
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const clearAll = () => {
        localStorage.clear();
        setScannedItems([]);
        setRecommendedRecipes([]);
        setTempDetections([]);
        setSavedRecipes([]);
        setWasteHistory([]);
        setSelectedIds([]);
        window.location.reload();
    };

    const clearInventory = () => {
        localStorage.removeItem("scannedIngredients");
        localStorage.removeItem("tempDetections");
        setScannedItems([]);
        setTempDetections([]);
        notificationService.send(t('alert.cleanup'), t('alert.inventory_cleared'));
    };

    const clearWasteHistory = () => {
        localStorage.removeItem("wasteHistory");
        setWasteHistory([]);
        notificationService.send(t('alert.cleanup'), t('alert.waste_cleared'));
    };

    const resetSettings = () => {
        const defaults = { 
            notifications: true, 
            neuralOptimized: true, 
            confidenceThreshold: 0.25, 
            darkMode: true,
            dietary: { vegetarian: false, lowCalorie: false, allergies: "" },
            uiScale: 1.0,
            autoScale: true,
            customApiKeys: settings.customApiKeys, 
            themeColor: "#00ff88",
            mainBg: "#0f2e24",
            subBg: "#1a4d3d",
            language: "zh" as "zh" | "en",
            isModalOpen: false
        };
        setSettings(defaults);
        localStorage.setItem("appSettings", JSON.stringify(defaults));
        notificationService.send(t('alert.reset'), t('alert.settings_restored'));
    };



    const updateSettings = (newSettings: Partial<IngredientContextType['settings']>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const saveRecipe = (recipe: any) => {
        setSavedRecipes(prev => {
            if (prev.find(r => r.id === recipe.id)) return prev;
            return [...prev, recipe];
        });
    };

    const unsaveRecipe = (recipeId: string) => {
        setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
    };

    const t = (key: string, replacements?: Record<string, string | number>): string => {
        const lang = (settings.language as 'zh' | 'en') || 'zh';
        let str = UI_TRANSLATIONS[lang]?.[key] || key;
        if (replacements) {
            Object.keys(replacements).forEach(k => {
                str = str.replace(new RegExp(`\\$${k}`, 'g'), String(replacements[k]));
            });
        }
        return str;
    };

    return (
        <IngredientContext.Provider value={{
            scannedItems,
            recommendedRecipes,
            tempDetections,
            selectedIds,
            settings,
            wasteHistory,
            addItem,
            updateQuantity,
            updateItem,
            removeItem,
            removeIngredient,
            toggleSelection,
            generateRecipe,
            saveRecipe,
            unsaveRecipe,
            savedRecipes,
            clearAll,
            clearInventory,
            clearWasteHistory,
            resetSettings,
            setRecipes: setRecommendedRecipes,
            clearTempDetections,
            updateSettings,
            t
        }}>
            {children}
        </IngredientContext.Provider>
    );
}

export function useIngredients() {
    const context = useContext(IngredientContext);
    if (context === undefined) {
        throw new Error("useIngredients must be used within an IngredientProvider");
    }
    return context;
}
