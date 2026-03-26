/**
 * LLM 食譜生成服務 (LLM Recipe Generation Service - Direct Gemini API)
 * 
 * 這個模組負責與 Google Gemini API 進行通訊，
 * 根據用戶提供的食材清單動態生成食譜建議。
 * 支援多模型輪詢與多金鑰自動切換。
 * v2: 食譜圖片改用 100 張圖庫智能匹配。
 */

import { matchRecipeImage } from "../data/recipeImageLibrary";

export interface LLMRecipeRequest {
    ingredients: string[]; // 用戶擁有的食材
    preferences?: string;  // 用戶偏好 (可選)
    language?: 'zh' | 'en'; // 新增：目標語言
    /** 樂觀式 UI 回調：規則篩選完成後立即呼叫此函式，不必等候 AI 審核 */
    onOptimisticResult?: (recipes: LLMRecipe[]) => void;
}

export interface LLMRecipe {
    id: string;
    name: string;
    image: string;
    time: string;
    difficulty: "easy" | "medium" | "hard";
    category: "vegetable" | "fruit" | "meat" | "mixed";
    requiredIngredients: string[];
    description: string;
    matchScore: number;
    steps?: { title: string; description: string }[];
    sustainabilityTip?: string; // 新增：環保減廢小撇步
    substitutionTip?: string;  // 新增：食材替代建議
}

// 支援的模型列表，按優先順序排列 (優先使用最新且穩定的版本)
const GEMINI_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash",
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
];

class LLMService {
    private currentModelIndex = 0;
    private apiKeyIndex = 0;
    private preferredModel: string | null = null;
    private customApiKeys: string[] = [];

    // 記錄每個 key 的冷卻時間 (429 後暫停)
    private keyCooldowns: Record<string, number> = {};
    // 記錄模型是否失效 (404 後略過)
    private modelAvailability: Record<string, boolean> = {};

    private readonly MAX_RETRIES = 2;
    private readonly COOLDOWN_MS = 60000; // 延長冷卻時間至 60s

    setPreferredModel(model: string | null) {
        this.preferredModel = model;
        if (model) {
            const idx = GEMINI_MODELS.indexOf(model);
            if (idx !== -1) this.currentModelIndex = idx;
        }
    }

    getPreferredModel(): string | null {
        return this.preferredModel;
    }

    setCustomApiKeys(keys: string | string[]) {
        if (Array.isArray(keys)) {
            this.customApiKeys = keys.filter(k => k.trim() !== "");
        } else {
            this.customApiKeys = keys.split(",").map(k => k.trim()).filter(k => k !== "");
        }
        // Reset index when keys change
        this.apiKeyIndex = 0;
    }

    private getApiKeys(): string[] {
        // Prioritize custom keys entered via UI
        if (this.customApiKeys.length > 0) {
            return this.customApiKeys;
        }

        const keys = import.meta.env.VITE_LLM_API_KEY || "";
        return keys.split(",").map((k: string) => k.trim()).filter((k: string) => k !== "");
    }

    private isKeyCoolingDown(key: string): boolean {
        const coolUntil = this.keyCooldowns[key];
        return coolUntil ? Date.now() < coolUntil : false;
    }

    private setKeyCooldown(key: string): void {
        this.keyCooldowns[key] = Date.now() + this.COOLDOWN_MS;
    }

    /**
     * 底層 API 調用邏輯 (Unified Fetch)
     */
    private async baseRequest(model: string, apiKey: string, body: any): Promise<any> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (response.status === 404) {
                this.modelAvailability[model] = false; // 標記模型無效
                throw { status: 404, message: `Model ${model} not found` };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    message: errorData.error?.message || `API Error ${response.status}`
                };
            }

            return await response.json();
        } catch (e: any) {
            if (!e.status) throw { status: 500, message: e.message || "Network Error" };
            throw e;
        }
    }

    /**
     * 核心排程器：處理轉向、冷卻與失敗重試
     */
    private async scheduledRequest(payloadBuilder: (model: string) => any): Promise<any> {
        const apiKeys = this.getApiKeys();
        if (apiKeys.length === 0) throw { status: 401, message: "No API Keys configured" };

        const testModels = this.preferredModel ? [this.preferredModel, ...GEMINI_MODELS.filter(m => m !== this.preferredModel)] : GEMINI_MODELS;

        for (const model of testModels) {
            if (this.modelAvailability[model] === false) continue; // 跳過已知無效模型

            for (let k = 0; k < apiKeys.length; k++) {
                const keyIdx = (this.apiKeyIndex + k) % apiKeys.length;
                const key = apiKeys[keyIdx];

                if (this.isKeyCoolingDown(key)) continue;

                for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
                    try {
                        console.log(`[LLM] 嘗試 ${model} | Key #${keyIdx + 1}`);
                        const result = await this.baseRequest(model, key, payloadBuilder(model));

                        // 成功，鎖定當前索引以優化下次速度
                        this.apiKeyIndex = keyIdx;
                        return result;
                    } catch (error: any) {
                        console.warn(`[LLM] ${model} 失敗: ${error.message}`);

                        if (error.status === 429) {
                            this.setKeyCooldown(key);
                            break; // 切換 Key
                        }
                        if (error.status === 404) break; // 切換模型
                        if (error.status === 400) break; // 參數錯誤，切換

                        // 其他錯誤（500/網路）重試一次
                        if (attempt === this.MAX_RETRIES - 1) break;
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            }
        }
        throw new Error("All nodes and models exhausted");
    }

    /**
     * 計算食材雜湊值作為快取 Key
     */
    private getCacheKey(ingredients: string[], preferences?: string, language?: string): string {
        const sorted = [...ingredients].sort().join(",");
        return `recipe-cache-${sorted}-${preferences || ""}-${language || "zh"}`;
    }

    async generateRecipes(request: LLMRecipeRequest): Promise<LLMRecipe[]> {
        const cacheKey = this.getCacheKey(request.ingredients, request.preferences, request.language);

        // 1. 嘗試從快取讀取
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                console.log("[LLM] 命中快取，正在載入預存食譜...");
                const parsed = JSON.parse(cached);
                // 快取結果也立即觸發 Optimistic，讓 UI 瞬間響應
                request.onOptimisticResult?.(parsed);
                return parsed;
            }
        } catch (e) {
            console.warn("[LLM] 快取讀取失敗:", e);
        }

        try {
            const data = await this.scheduledRequest((model) => ({
                contents: [{ parts: [{ text: this.getRecipePrompt(request) }] }],
                generationConfig: {
                    temperature: 0.3,
                    responseMimeType: "application/json"
                }
            }));

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Empty AI response");

            const rawRecipes = JSON.parse(text).map((r: any) => {
                const category = r.category || "mixed";
                const rawName = r.name || "";
                const requiredIngredients = this.normalizeArray(r.requiredIngredients || request.ingredients);
                const name = this.sanitizeRecipeName(rawName, requiredIngredients, category, request.language);
                const imageUrl = matchRecipeImage(name, requiredIngredients, category);

                // ✨ 圖片預加載：一拿到 URL 就讓瀏覽器開始偷跑下載
                if (imageUrl) {
                    const img = new Image();
                    img.src = imageUrl;
                }

                return {
                    id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name,
                    image: imageUrl,
                    time: r.time || "20 min",
                    difficulty: r.difficulty || "easy",
                    category,
                    requiredIngredients,
                    description: r.description || (request.language === 'en' ? "Practical recipe suggestions based on current ingredients." : "符合現有食材的實用食譜建議。"),
                    matchScore: r.matchScore || 90,
                    steps: this.normalizeSteps(r.steps),
                    sustainabilityTip: r.sustainabilityTip || "",
                    substitutionTip: r.substitutionTip || ""
                };
            });

            // 2. 規則層篩選（超快速）
            const ruleFiltered = this.applyLocalRules(rawRecipes);
            console.log(`[篩選] 規則層完成: ${rawRecipes.length} → ${ruleFiltered.length} 筆`);

            // 3. ✨ 樂觀式 UI：規則過濾完就先顯示給用戶看，不等後面的 AI 審核
            const optimisticResult = ruleFiltered.length > 0 ? ruleFiltered : rawRecipes;
            request.onOptimisticResult?.(optimisticResult);

            // 4. 背景檢查：AI 食安審核移到背景執行，不阻塞 UI
            this.aiValidateRecipes(ruleFiltered, request.language).then(validated => {
                const finalRecipes = validated.length > 0 ? validated : ruleFiltered;
                console.log(`[背景審核] 完成: ${ruleFiltered.length} → ${finalRecipes.length} 筆，更新快取`);
                // 靜默更新快取，即便用戶這回沒看到，下次載入也會是通過審核的
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(finalRecipes));
                } catch (_) { }
            }).catch(err => {
                console.warn("[背景審核] 失敗:", err);
            });

            // 回傳即時結果
            return optimisticResult;
        } catch (e) {
            console.error("[LLM] 生成食譜最終失敗:", e);
            return this.getLocalFallback(request.ingredients, request.language);
        }
    }

    // ════════════════════════════════════════════════════
    //  Layer 1：本地規則篩選（毫秒級，不耗 API 配額）
    // ════════════════════════════════════════════════════

    /**
     * 危險食材組合黑名單（化學性衝突或食物中毒風險）
     * 格式：[食材A, 食材B] → 兩者同時出現時拒絕
     */
    private readonly DANGEROUS_COMBOS: [string, string][] = [
        ["菠菜", "豆腐"],            // 草酸鈣結石風險（過量才有問題，但常被誤傳—保守提示）
        ["螃蟹", "柿子"],            // 傳統禁忌：單寧酸 + 蛋白質
        ["螃蟹", "石榴"],
        ["海鮮", "啤酒"],            // 痛風風險
        ["羊肉", "西瓜"],            // 傳統中醫禁忌（寒熱衝突）
        ["牛奶", "醋"],              // 使牛奶凝固
        ["蜂蜜", "蔥"],              // 傳統禁忌
        ["鴨蛋", "李子"],
        ["未熟豆", "生食"],          // 豆類生食中毒
        ["Spinach", "Tofu"],
        ["Crab", "Persimmon"],
        ["Seafood", "Beer"]
    ];

    /** 不可食用/不合理的關鍵字（食譜名稱/描述含此詞則過濾） */
    private readonly INEDIBLE_KEYWORDS = [
        "肥皂", "洗潔精", "清潔劑", "藥品", "漂白", "酒精消毒",
        "未煮熟", "生鮮直食", "毒", "有毒", "致癌",
        "貓糧", "狗糧", "飼料", "生豆",
        "soap", "detergent", "bleach", "toxic", "poison", "inedible"
    ];

    /** 最少需要的烹飪步驟數（防止空殼食譜） */
    private readonly MIN_STEPS = 2;
    /** 食譜名稱最短長度 */
    private readonly MIN_NAME_LENGTH = 4;

    private applyLocalRules(recipes: LLMRecipe[]): LLMRecipe[] {
        return recipes.filter(recipe => {
            const nameAndDesc = `${recipe.name} ${recipe.description}`.toLowerCase();
            const ingrs = recipe.requiredIngredients.map(i => i.toLowerCase());

            // ❌ 1. 含不可食關鍵字
            if (this.INEDIBLE_KEYWORDS.some(kw => nameAndDesc.includes(kw))) {
                console.warn(`[規則] 拒絕「${recipe.name}」：含不可食詞彙`);
                return false;
            }

            // ❌ 2. 食譜名稱太短（可能是亂生成）
            if (recipe.name.replace(/\s/g, "").length < this.MIN_NAME_LENGTH) {
                console.warn(`[規則] 拒絕「${recipe.name}」：名稱過短`);
                return false;
            }

            // ❌ 3. 步驟數不足（空殼食譜）
            if (!recipe.steps || recipe.steps.length < this.MIN_STEPS) {
                console.warn(`[規則] 拒絕「${recipe.name}」：步驟不足`);
                return false;
            }

            // ❌ 4. 危險食材組合
            for (const [a, b] of this.DANGEROUS_COMBOS) {
                const hasA = ingrs.some(i => i.includes(a.toLowerCase()));
                const hasB = ingrs.some(i => i.includes(b.toLowerCase()));
                if (hasA && hasB) {
                    console.warn(`[規則] 拒絕「${recipe.name}」：危險組合 ${a}+${b}`);
                    return false;
                }
            }

            // ❌ 5. matchScore 過低（AI 自己認為匹配度差）
            if (recipe.matchScore < 30) {
                console.warn(`[規則] 拒絕「${recipe.name}」：matchScore ${recipe.matchScore} < 30`);
                return false;
            }

            return true;
        });
    }

    // ════════════════════════════════════════════════════
    //  Layer 2：AI 食安審核（呼叫 Gemini 做最終把關）
    // ════════════════════════════════════════════════════

    /**
     * 讓 AI 審核員逐一判斷每道食譜是否符合「一般人可安全食用」的標準。
     * 回傳通過審核的食譜列表。
     */
    private async aiValidateRecipes(recipes: LLMRecipe[], language?: 'zh' | 'en'): Promise<LLMRecipe[]> {
        if (recipes.length === 0) return [];

        const isEnglish = language === 'en';

        const reviewTarget = recipes.map((r, idx) => ({
            index: idx,
            name: r.name,
            ingredients: r.requiredIngredients,
            steps: r.steps?.map(s => s.description).join("；") || "",
            description: r.description
        }));

        const prompt = isEnglish ? `You are a strict food safety reviewer and culinary expert.
Please review each of the following ${recipes.length} recipes and determine if each meets the standard of "normal dishes that are safe for general healthy adults to eat".

Review Recipe List (JSON):
${JSON.stringify(reviewTarget, null, 2)}

**Review Criteria (all must pass to be qualified):**
1. ✅ Ingredient combinations make sense - ingredients are reasonably paired and can be cooked together.
2. ✅ Cooking methods are correct - steps are described reasonably, and food is fully cooked.
3. ✅ No toxicity risk - no known food poisoning or allergen conflicts.
4. ✅ Is a real dish - not a fabricated absurd dish name.
5. ✅ Portions and steps are logical - complete preparation and cooking process.

**Examples of unqualified situations (please reject):**
- Raw food served directly (no heating described).
+- Empty ingredient list or only seasonings.
- Clearly harmful combinations (e.g., excessive salt, acid-base conflicts).
- Recipe description too vague to be executable.
- Not a dish meant for human consumption.

Please return only a JSON Array, containing the indices of the approved recipes:
Format: {"passed": [0, 1, 2], "rejected": [{"index": number, "reason": "reason"}]}`
            : `你是一位嚴格的食品安全審核員與料理專家。
請逐一審核以下 ${recipes.length} 道食譜，判斷每道是否符合「一般健康成人可以安全食用的正常料理」標準。

審核食譜列表（JSON）：
${JSON.stringify(reviewTarget, null, 2)}

**審核標準（全部通過才算合格）：**
1. ✅ 食材組合符合常識 - 這些食材合理搭配、確實能一起烹煮
2. ✅ 烹調方式正確 - 步驟描述合理，食物有完整烹熟
3. ✅ 不含毒性風險 - 無已知食物中毒或過敏原衝突
4. ✅ 是真實存在的料理 - 不是捏造的荒謬菜名
5. ✅ 份量與步驟合乎邏輯 - 有完整的備菜與烹飪流程

**不合格情形範例（請拒絕）：**
- 生食直接上桌（未描述加熱）
- 食材清單為空或只有調味料
- 明顯有害的搭配（如過量鹽、酸鹼衝突等）
- 食譜描述含糊到根本無法執行的程度
- 根本不是屬於人類食用的料理

請僅回傳 JSON Array，包含通過審核的食譜索引號：
格式：{"passed": [0, 1, 2], "rejected": [{"index": 數字, "reason": "理由"}]}`;

        try {
            const data = await this.scheduledRequest(() => ({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,  // 低溫度讓審核更嚴謹
                    responseMimeType: "application/json"
                }
            }));

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                console.warn("[AI審核] 無回應，跳過審核");
                return recipes;
            }

            const result = JSON.parse(text);
            const passedIndices: number[] = result.passed || [];

            // 記錄拒絕原因
            if (result.rejected?.length > 0) {
                result.rejected.forEach((r: { index: number; reason: string }) => {
                    const recipeName = recipes[r.index]?.name || `#${r.index}`;
                    console.warn(`[AI審核] ❌ 拒絕「${recipeName}」- 原因：${r.reason}`);
                });
            }

            const passedRecipes = passedIndices
                .filter(i => i >= 0 && i < recipes.length)
                .map(i => ({
                    ...recipes[i],
                    // ✅ 加上審核通過標記（可在 UI 顯示）
                    description: recipes[i].description
                }));

            console.log(`[AI審核] ✅ 通過 ${passedRecipes.length}/${recipes.length} 道食譜`);
            return passedRecipes;

        } catch (e) {
            console.warn("[AI審核] 審核失敗，保留所有食譜:", e);
            return recipes; // 審核失敗時不影響主流程
        }
    }

    private getRecipePrompt(request: LLMRecipeRequest): string {
        const isEnglish = request.language === 'en';
        let dietaryInfo = "";

        if (request.preferences) {
            try {
                const prefs = JSON.parse(request.preferences);
                const dietaryParts = [];
                if (isEnglish) {
                    if (prefs.vegetarian) dietaryParts.push("Vegetarian");
                    if (prefs.lowCalorie) dietaryParts.push("Low Calorie / Diet");
                    if (prefs.allergies) dietaryParts.push(`Allergies: ${prefs.allergies}`);
                } else {
                    if (prefs.vegetarian) dietaryParts.push("素食 (Vegetarian)");
                    if (prefs.lowCalorie) dietaryParts.push("減脂/低卡 (Low Calorie / Diet)");
                    if (prefs.allergies) dietaryParts.push(`過敏原禁忌：${prefs.allergies}`);
                }

                if (dietaryParts.length > 0) {
                    const prefHeader = isEnglish ? "\n**User Preferences**:\n" : "\n**用戶個人偏好設定**：\n";
                    const prefFooter = isEnglish ? "\nPlease strictly follow the above preferences and constraints." : "\n請務必嚴格遵守上述偏好與過敏限制。";
                    dietaryInfo = `${prefHeader}${dietaryParts.map(p => `- ${p}`).join("\n")}${prefFooter}`;
                }
            } catch (e) {
                console.warn("Failed to parse dietary preferences", e);
            }
        }

        if (isEnglish) {
            return `You are a world-class chef with 30 years of experience.
Based on the ingredients: ${request.ingredients.join(", ")}, generate 3 recipe suggestions in JSON format.${dietaryInfo}

RULES:
1. **Recipe Naming**: Use English. Names should be catchy and appetizing.
   - ✅ Good: "Golden Garlic Butter Shrimp", "Tender Tomato Egg Rice Bowl", "Secret Braised Pork Ribs".
   - ❌ Forbidden: Technology words like "AI", "Recipe", "Option 1".
2. **Style**: Home-style cooking, comforting and practical.
3. **Ingredient Constraints**: Use provided ingredients as much as possible. Basic spices/oil/salt are allowed.
4. **Sustainability**: Provide a \`sustainabilityTip\` (Zero-Waste advice) and a \`substitutionTip\`.
5. **Output**: JSON Array.
Format: [{name, time, difficulty, category, requiredIngredients, description, sustainabilityTip, substitutionTip, steps:[{title, description}], matchScore}]`;
        }

        return `你是一位擁有 30 年經驗、精通台灣家常料理的御廚主廚。
請根據用戶擁有的食材：${request.ingredients.join(", ")}，生成 3 個 JSON 格式的食譜建議。${dietaryInfo}

規則：
1. **食譜命名（最重要！）**：食譜名稱必須使用繁體中文，要口語化、誘人、有食欲感。
   - ✅ 好的名稱範例：「黃金蒜香奶油炒蝦」「嫩滑番茄炒蛋蓋飯」「古早味蔥爆豬肉」「家傳秘制紅燒排骨」「香氣逼人蒜苗炒肉絲」
   - ❌ 嚴格禁止的名稱：含英文字母（如 AI、Stir Fry）、含引號「」或括號()、過於籠統（如「炒菜」「雞肉料理」「食譜一」）
   - 命名格式必須是：[形容詞/技法] + [主要食材] + [烹調方式]，例如「嫩煎胡椒鹽豬排」「古早味三杯雞腿」
   - 名稱長度必須在 6~16 個中文字之間
2. **風格**：必須是「台式家常菜」，讓人想到媽媽的味道，避免法式精緻料理或歐美料理風格。
3. **食材限制**：盡可能只使用提供的食材。除了常見的基礎調味料（油、鹽、醬油、胡椒、糖、蒜、蔥、薑）外，不可隨意添加其他需要額外購買的主菜或配料。
4. **續航與替代**：如果必須使用到某些常用但用戶沒提到的食材（例如雞蛋、洋蔥），請在 \`substitutionTip\` 中說明替代方案。
5. **零浪費智慧 (Zero-Waste)**：你必須針對這道食譜提供一個 \`sustainabilityTip\`，告訴用戶如何減少食材浪費（例如：剩餘菜梗可以熬湯、果皮可以除臭、如何延長食材保存等）。
6. **輸出格式**：必須維持 JSON Array 格式，name 必須是符合上述規範的繁體中文誘人名稱。
格式：[{name, time, difficulty, category, requiredIngredients, description, sustainabilityTip, substitutionTip, steps:[{title, description}], matchScore}]`;
    }

    // ════════════════════════════════════════════════════
    //  食譜名稱修正器（sanitizeRecipeName）
    //  處理 AI 偶爾生成的怪名：英文混雜、引號殘留、過短等
    // ════════════════════════════════════════════════════

    /** 各類別對應的台式烹調動詞備用庫 */
    private readonly COOKING_VERBS: Record<string, string[]> = {
        meat: ["嫩煎", "古早味", "香滷", "蔥爆", "紅燒", "家傳", "三杯", "蒜香"],
        vegetable: ["清炒", "嫩炒", "蒜香", "家常", "涼拌", "爆炒", "燙拌"],
        mixed: ["家常", "古早味", "蔥香", "金黃", "醬燒", "鮮美", "暖心"],
        soup: ["暖胃", "鮮甜", "濃郁", "清甜", "滋補", "古早味"],
        rice: ["黃金", "蛋香", "蒜味", "台式", "家常", "古早味"],
        noodle: ["嫩滑", "醬香", "家常", "古早味", "鮮美", "清爽"],
        seafood: ["鮮甜", "蒜香", "薑蔥", "酥炸", "清蒸", "鹽烤"],
        egg: ["嫩滑", "黃金", "家常", "古早味", "蔥花"],
        fruit: ["清爽", "鮮甜", "繽紛", "夏日"],
        dessert: ["香甜", "綿密", "濃郁", "清涼"],
    };

    /** 各類別的烹調後綴備用庫 */
    private readonly COOKING_SUFFIX: Record<string, string[]> = {
        meat: ["炒肉片", "燉肉", "排骨", "家常菜", "下飯菜"],
        vegetable: ["炒青菜", "蔬菜", "時蔬", "家常菜"],
        mixed: ["家常菜", "下飯菜", "快炒"],
        soup: ["湯", "濃湯", "暖湯", "家常湯"],
        rice: ["炒飯", "蓋飯", "拌飯"],
        noodle: ["炒麵", "湯麵", "拌麵"],
        seafood: ["海鮮", "炒蝦", "蒸魚"],
        egg: ["炒蛋", "蛋料理", "烘蛋"],
        fruit: ["水果", "沙拉", "拼盤"],
        dessert: ["甜點", "布丁", "蛋糕"],
    };

    /**
     * 修正 AI 生成的食譜名稱
     * - 移除引號、括號、英文字母、多餘空白
     * - 若名稱仍不合格，根據食材+類別自動重組一個合理中文名
     */
    private sanitizeRecipeName(rawName: string, ingredients: string[], category: string, language?: string): string {
        if (!rawName) return this.buildFallbackName(ingredients, category, language);

        const isEnglish = language === 'en';

        // Step 1: 移除常見污染字元
        let name = rawName
            .replace(/[「」『』"'【】\[\]()（）《》<>]/g, "")  // 移除各種括號引號
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")     // 移除控制字元
            .replace(/\s+/g, " ")                              // 壓縮空白
            .trim();

        if (!isEnglish) {
            name = name.replace(/[a-zA-Z]+/g, "").replace(/\s+/g, ""); // 中文版移除英文和所有空白
        }

        // Step 2: 移除技術/無意義詞彙頭尾
        const BANNED_PATTERNS = [
            /^(食譜|料理|菜單|推薦|Recipe|Menu)[一二三1-9\d]*/i,
            /^[第]?[一二三四五1-9][道個]/,
            /^(\d+[\.、])/,
        ];
        for (const pattern of BANNED_PATTERNS) {
            name = name.replace(pattern, "").trim();
        }

        // Step 3: 長度檢查
        const cleanLength = isEnglish ? name.length : [...name].length;
        const minLen = isEnglish ? 10 : 4;
        const maxLen = isEnglish ? 50 : 20;

        if (cleanLength < minLen || cleanLength > maxLen || name === "") {
            console.warn(`[命名修正] 名稱「${rawName}」不合格，重新生成`);
            return this.buildFallbackName(ingredients, category, language);
        }

        return name;
    }

    /**
     * 根據食材與類別重新組合一個具備風格名稱
     */
    private buildFallbackName(ingredients: string[], category: string, language?: string): string {
        const isEnglish = language === 'en';
        if (isEnglish) {
            const main = ingredients[0] || "Ingredient";
            return `Delicious ${main} Home-style Dish`;
        }

        const verbs = this.COOKING_VERBS[category] || this.COOKING_VERBS.mixed;
        const suffixes = this.COOKING_SUFFIX[category] || this.COOKING_SUFFIX.mixed;

        const verb = verbs[Math.floor(Math.random() * verbs.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        const mainIngrs = ingredients
            .filter(i => i.trim().length >= 1)
            .slice(0, 2)
            .map(i => i.replace(/[a-zA-Z\s]/g, "").slice(0, 3))
            .filter(i => i.length > 0);

        const ingrPart = mainIngrs.length > 0 ? mainIngrs.join("") : "家常";

        return `${verb}${ingrPart}${suffix}`;
    }

    private cleanJson(text: string): string {
        return text.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    async detectIngredientsFromImage(base64Image: string, language?: string): Promise<any[]> {
        const isEnglish = language === 'en';
        const prompt = isEnglish
            ? "Analyze this photo and identify all ingredients. Return ONLY a JSON Array format: [{name, category, isSpoiled, confidence}]. No explanations."
            : "分析這張照片，辨識所有食材。請僅回傳 JSON Array 格式，包含: [{name, category, isSpoiled, confidence}]。不要有任何解釋文字。";

        const data = await this.scheduledRequest((model) => ({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                ]
            }],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        }));

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error(isEnglish ? "Vision response empty" : "視覺辨識反應為空");

        try {
            const cleaned = this.cleanJson(text);
            const results = JSON.parse(cleaned);
            return results.map((r: any) => ({
                id: `ai-vision-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: r.name,
                quantity: 1,
                category: r.category || (isEnglish ? "Other" : "其他"),
                timestamp: Date.now(),
                confidence: r.confidence || 0.9,
                isSpoiled: r.isSpoiled || false,
                storageType: "fridge"
            }));
        } catch (e) {
            console.error("[LLM] Vision JSON Parse Error:", e, "Raw text:", text);
            throw new Error(isEnglish ? "Failed to parse vision results." : "無法解析識別結果，AI 反應格式不正確。");
        }
    }

    private getLocalFallback(ingredients: string[], language?: string): LLMRecipe[] {
        const isEnglish = language === 'en';
        const main = ingredients[0] || (isEnglish ? "Ingredient" : "食材");

        const templates = isEnglish ? [
            { name: `Classic ${main} Fried Rice`, cat: "mixed" as const },
            { name: `Comforting ${main} Soup`, cat: "vegetable" as const },
            { name: `Fresh ${main} Salad`, cat: "mixed" as const }
        ] : [
            { name: `古早味 ${main} 蒜香炒飯`, cat: "mixed" as const },
            { name: `暖心 ${main} 家常濃湯`, cat: "vegetable" as const },
            { name: `清爽 ${main} 涼拌沙拉`, cat: "mixed" as const }
        ];

        return templates.map((t, idx) => ({
            id: `local-${idx}-${Date.now()}`,
            name: t.name,
            image: matchRecipeImage(t.name, ingredients, t.cat),
            time: "15 min",
            difficulty: "easy" as const,
            category: t.cat,
            requiredIngredients: ingredients,
            description: isEnglish ? `A delicious home-style dish featuring ${main}.` : `以 ${main} 為主角的台式家常料理，快速美味上桌。`,
            matchScore: 90,
            steps: isEnglish ? [
                { title: "Prep", description: `Wash and cut ${main}, prepare garlic.` },
                { title: "Cook", description: "Heat oil, stir-fry ingredients until cooked." },
                { title: "Season", description: "Add salt and seasoning, serve hot." }
            ] : [
                { title: "食材準備", description: `將 ${main} 洗淨切好，蒜頭拍碎備用。` },
                { title: "下鍋烹調", description: "熱鍋下油，依序放入食材拌炒至熟透入味。" },
                { title: "調味起鍋", description: "加入適量鹽巴、醬油調味，起鍋前撒上蔥花提香。" }
            ]
        }));
    }

    getMaskedApiKeys(): string[] {
        return this.getApiKeys().map(key => {
            if (key.length <= 8) return "****";
            return `${key.slice(0, 4)}...${key.slice(-4)}`;
        });
    }

    getKeyStatusList(): { masked: string; coolingDown: boolean; cooldownRemaining: number; isCustom: boolean }[] {
        const customKeys = this.customApiKeys.map(k => k.trim());
        return this.getApiKeys().map(key => {
            const coolingDown = this.isKeyCoolingDown(key);
            const cooldownRemaining = coolingDown
                ? Math.ceil((this.keyCooldowns[key] - Date.now()) / 1000)
                : 0;
            const masked = key.length <= 8 ? "****" : `${key.slice(0, 4)}...${key.slice(-4)}`;
            const isCustom = customKeys.includes(key);
            return { masked, coolingDown, cooldownRemaining, isCustom };
        });
    }

    getActiveKeyInfo(): string | null {
        const apiKeys = this.getApiKeys();
        if (apiKeys.length === 0) return null;
        const key = apiKeys[this.apiKeyIndex];
        return key.length <= 8 ? "****" : `${key.slice(0, 4)}...${key.slice(-4)}`;
    }

    async testConnection(): Promise<{ status: 'online' | 'offline' | 'no_key', model: string, keyCount: number, activeKey: string | null }> {
        const keys = this.getApiKeys();
        if (keys.length === 0) return { status: 'no_key', model: GEMINI_MODELS[0], keyCount: 0, activeKey: null };

        try {
            await this.baseRequest(GEMINI_MODELS[0], keys[0], {
                contents: [{ parts: [{ text: "ping" }] }],
                generationConfig: { maxOutputTokens: 1 }
            });
            return { status: 'online', model: GEMINI_MODELS[0], keyCount: keys.length, activeKey: this.getActiveKeyInfo() };
        } catch (e) {
            console.warn("[LLM] Connection test failed:", e);
            return { status: 'offline', model: GEMINI_MODELS[0], keyCount: keys.length, activeKey: null };
        }
    }

    getAvailableModels() {
        return GEMINI_MODELS;
    }

    private normalizeArray(data: any): string[] {
        if (Array.isArray(data)) return data.map(String);
        if (typeof data === 'string') return data.split(/[,，\s]+/).filter(Boolean);
        return [];
    }

    private normalizeSteps(steps: any): { title: string; description: string }[] {
        if (Array.isArray(steps)) {
            return steps.map(s => ({
                title: String(s.title || "步驟"),
                description: String(s.description || "")
            }));
        }
        if (typeof steps === 'string') {
            return steps.split('\n').filter(Boolean).map(line => ({
                title: "烹飪步驟",
                description: line.trim()
            }));
        }
        return [{ title: "準備", description: "依照直覺進行烹飪。" }];
    }
}

export const llmService = new LLMService();
