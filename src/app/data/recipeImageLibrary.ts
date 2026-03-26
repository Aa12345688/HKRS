/**
 * 食譜圖片資料庫 (Recipe Image Library)
 * 
 * 收錄 100 張高品質 Unsplash 食譜圖片，依食物類型關鍵字分類。
 * 生成食譜時會透過 `matchRecipeImage()` 智能挑選最符合的圖片。
 */

export interface RecipeImageEntry {
    id: string;
    url: string;
    keywords: string[]; // 與此圖片相關的食材/料理關鍵字（中英文皆可）
    category: "vegetable" | "fruit" | "meat" | "mixed" | "soup" | "noodle" | "rice" | "dessert" | "seafood" | "egg";
}

export const RECIPE_IMAGE_LIBRARY: RecipeImageEntry[] = [
    // ──────────────────────── 炒飯 / 米飯類 ────────────────────────
    {
        id: "r001",
        url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800",
        keywords: ["炒飯", "蛋炒飯", "fried rice", "rice", "米飯", "白米"],
        category: "rice"
    },
    {
        id: "r002",
        url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800",
        keywords: ["炒飯", "雞肉炒飯", "chicken fried rice", "米", "雞肉"],
        category: "rice"
    },
    {
        id: "r003",
        url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?q=80&w=800",
        keywords: ["白飯", "日式飯", "rice bowl", "丼飯", "米飯"],
        category: "rice"
    },
    {
        id: "r004",
        url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=800",
        keywords: ["壽司", "日式料理", "sushi", "日本", "海苔"],
        category: "rice"
    },
    {
        id: "r005",
        url: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?q=80&w=800",
        keywords: ["燉飯", "燉肉飯", "risotto", "番茄飯", "米"],
        category: "rice"
    },
    {
        id: "r006",
        url: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?q=80&w=800",
        keywords: ["咖哩飯", "咖哩", "curry rice", "curry", "印度"],
        category: "rice"
    },

    // ──────────────────────── 麵條類 ────────────────────────
    {
        id: "r007",
        url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=800",
        keywords: ["拉麵", "日式拉麵", "ramen", "湯麵", "麵"],
        category: "noodle"
    },
    {
        id: "r008",
        url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800",
        keywords: ["義大利麵", "pasta", "義麵", "番茄醬", "義式"],
        category: "noodle"
    },
    {
        id: "r009",
        url: "https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=800",
        keywords: ["炒麵", "stir fry noodle", "炒麵條", "麵"],
        category: "noodle"
    },
    {
        id: "r010",
        url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800",
        keywords: ["烏龍麵", "udon", "日式麵", "湯麵"],
        category: "noodle"
    },
    {
        id: "r011",
        url: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800",
        keywords: ["冷麵", "涼麵", "cold noodle", "麻醬麵", "芝麻麵"],
        category: "noodle"
    },
    {
        id: "r012",
        url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800",
        keywords: ["千層麵", "lasagna", "義大利", "焗烤"],
        category: "noodle"
    },

    // ──────────────────────── 雞肉類 ────────────────────────
    {
        id: "r013",
        url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c4?q=80&w=800",
        keywords: ["雞腿", "烤雞腿", "roast chicken leg", "雞肉", "chicken"],
        category: "meat"
    },
    {
        id: "r014",
        url: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=800",
        keywords: ["雞胸肉", "烤雞", "grilled chicken", "雞", "chicken breast"],
        category: "meat"
    },
    {
        id: "r015",
        url: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?q=80&w=800",
        keywords: ["炸雞", "fried chicken", "雞翅", "雞肉", "crispy"],
        category: "meat"
    },
    {
        id: "r016",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
        keywords: ["雞肉料理", "chicken dish", "家常雞", "宮保雞丁"],
        category: "meat"
    },
    {
        id: "r017",
        url: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?q=80&w=800",
        keywords: ["三杯雞", "雞肉", "台式", "九層塔", "家常"],
        category: "meat"
    },

    // ──────────────────────── 豬肉類 ────────────────────────
    {
        id: "r018",
        url: "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800",
        keywords: ["豬肉", "pork", "豬排", "豬肋排", "烤豬"],
        category: "meat"
    },
    {
        id: "r019",
        url: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=800",
        keywords: ["排骨", "豬排骨", "ribs", "滷排骨", "燉排骨"],
        category: "meat"
    },
    {
        id: "r020",
        url: "https://images.unsplash.com/photo-1614548539924-5c1f205b3747?q=80&w=800",
        keywords: ["豬肉丸", "meatball", "豬絞肉", "肉丸"],
        category: "meat"
    },
    {
        id: "r021",
        url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800",
        keywords: ["紅燒肉", "滷肉", "braised pork", "三層肉", "控肉"],
        category: "meat"
    },

    // ──────────────────────── 牛肉類 ────────────────────────
    {
        id: "r022",
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
        keywords: ["牛肉", "beef", "牛排", "steak", "烤牛"],
        category: "meat"
    },
    {
        id: "r023",
        url: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800",
        keywords: ["漢堡", "burger", "牛肉堡", "漢堡排", "beef burger"],
        category: "meat"
    },
    {
        id: "r024",
        url: "https://images.unsplash.com/photo-1611520189521-4e46b12bdb8f?q=80&w=800",
        keywords: ["牛肉燉", "燉牛肉", "beef stew", "紅酒燉牛", "牛腩"],
        category: "meat"
    },
    {
        id: "r025",
        url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=800",
        keywords: ["沙朗牛排", "ribeye", "牛排餐", "premium beef"],
        category: "meat"
    },

    // ──────────────────────── 海鮮類 ────────────────────────
    {
        id: "r026",
        url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800",
        keywords: ["魚", "fish", "烤魚", "清蒸魚", "煎魚"],
        category: "seafood"
    },
    {
        id: "r027",
        url: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=800",
        keywords: ["蝦", "shrimp", "蒜味蝦", "炒蝦", "prawn"],
        category: "seafood"
    },
    {
        id: "r028",
        url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
        keywords: ["鮭魚", "salmon", "烤鮭魚", "生魚片", "日式魚"],
        category: "seafood"
    },
    {
        id: "r029",
        url: "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800",
        keywords: ["海鮮炒", "海鮮料理", "seafood", "蛤蜊", "透抽"],
        category: "seafood"
    },
    {
        id: "r030",
        url: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=800",
        keywords: ["蛤蠣", "蛤蜊", "clam", "海瓜子", "酒蒸"],
        category: "seafood"
    },
    {
        id: "r031",
        url: "https://images.unsplash.com/photo-1571197119738-a58aaa82dc76?q=80&w=800",
        keywords: ["螃蟹", "crab", "炒蟹", "薑蔥螃蟹"],
        category: "seafood"
    },
    {
        id: "r032",
        url: "https://images.unsplash.com/photo-1615361200141-f45040f367be?q=80&w=800",
        keywords: ["章魚", "花枝", "squid", "octopus", "魷魚"],
        category: "seafood"
    },

    // ──────────────────────── 蛋料理 ────────────────────────
    {
        id: "r033",
        url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800",
        keywords: ["蛋", "egg", "炒蛋", "荷包蛋", "煎蛋"],
        category: "egg"
    },
    {
        id: "r034",
        url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800",
        keywords: ["歐姆蛋", "omelette", "omelet", "蛋捲"],
        category: "egg"
    },
    {
        id: "r035",
        url: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=800",
        keywords: ["班尼迪克蛋", "eggs benedict", "水波蛋", "早餐蛋"],
        category: "egg"
    },
    {
        id: "r036",
        url: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=800",
        keywords: ["蛋料理", "起司蛋", "frittata", "義式蛋"],
        category: "egg"
    },
    {
        id: "r037",
        url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800",
        keywords: ["滷蛋", "溏心蛋", "茶葉蛋", "滷鴨蛋", "醬蛋"],
        category: "egg"
    },

    // ──────────────────────── 蔬菜料理 ────────────────────────
    {
        id: "r038",
        url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800",
        keywords: ["沙拉", "salad", "生菜", "蔬菜", "vegetable"],
        category: "vegetable"
    },
    {
        id: "r039",
        url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800",
        keywords: ["炒蔬菜", "stir fry vegetable", "炒青菜", "清炒", "青菜"],
        category: "vegetable"
    },
    {
        id: "r040",
        url: "https://images.unsplash.com/photo-1574484284002-952d92456975?q=80&w=800",
        keywords: ["烤蔬菜", "焗烤", "roasted vegetable", "彩椒", "烤箱"],
        category: "vegetable"
    },
    {
        id: "r041",
        url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
        keywords: ["花椰菜", "broccoli", "西蘭花", "炒花椰菜"],
        category: "vegetable"
    },
    {
        id: "r042",
        url: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800",
        keywords: ["番茄", "tomato", "西紅柿", "炒蛋番茄", "番茄料理"],
        category: "vegetable"
    },
    {
        id: "r043",
        url: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800",
        keywords: ["菠菜", "spinach", "菠菜料理", "烫青菜"],
        category: "vegetable"
    },
    {
        id: "r044",
        url: "https://images.unsplash.com/photo-1608032364895-84e3e9d36a9c?q=80&w=800",
        keywords: ["地瓜", "sweet potato", "烤地瓜", "薯泥"],
        category: "vegetable"
    },
    {
        id: "r045",
        url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=800",
        keywords: ["馬鈴薯", "potato", "薯條", "薯泥", "炸薯"],
        category: "vegetable"
    },
    {
        id: "r046",
        url: "https://images.unsplash.com/photo-1629385701021-eca1e4a3e1cd?q=80&w=800",
        keywords: ["洋蔥", "onion", "炒洋蔥", "洋蔥料理"],
        category: "vegetable"
    },
    {
        id: "r047",
        url: "https://images.unsplash.com/photo-1534482421-64566f976cfa?q=80&w=800",
        keywords: ["豆腐", "tofu", "嫩豆腐", "麻婆豆腐", "豆腐料理"],
        category: "vegetable"
    },
    {
        id: "r048",
        url: "https://images.unsplash.com/photo-1620206343952-7bbab741c5e7?q=80&w=800",
        keywords: ["茄子", "eggplant", "紅燒茄子", "炒茄子"],
        category: "vegetable"
    },
    {
        id: "r049",
        url: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?q=80&w=800",
        keywords: ["炒高麗菜", "cabbage", "高麗菜", "包心菜"],
        category: "vegetable"
    },
    {
        id: "r050",
        url: "https://images.unsplash.com/photo-1646858621720-36b8b67a37b0?q=80&w=800",
        keywords: ["南瓜", "pumpkin", "南瓜湯", "烤南瓜"],
        category: "vegetable"
    },

    // ──────────────────────── 湯品類 ────────────────────────
    {
        id: "r051",
        url: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800",
        keywords: ["湯", "soup", "雞湯", "清湯", "燉湯"],
        category: "soup"
    },
    {
        id: "r052",
        url: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=800",
        keywords: ["濃湯", "cream soup", "南瓜濃湯", "番茄濃湯"],
        category: "soup"
    },
    {
        id: "r053",
        url: "https://images.unsplash.com/photo-1588566565463-180a5b8f4938?q=80&w=800",
        keywords: ["味噌湯", "miso soup", "日式湯", "豆腐湯"],
        category: "soup"
    },
    {
        id: "r054",
        url: "https://images.unsplash.com/photo-1607301405390-d831c242f59b?q=80&w=800",
        keywords: ["牛肉湯", "beef soup", "紅燒湯", "牛腩湯"],
        category: "soup"
    },
    {
        id: "r055",
        url: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?q=80&w=800",
        keywords: ["玉米湯", "corn soup", "玉米濃湯", "玉米"],
        category: "soup"
    },
    {
        id: "r056",
        url: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=800",
        keywords: ["蔬菜湯", "vegetable soup", "雜菜湯", "羅宋湯"],
        category: "soup"
    },
    {
        id: "r057",
        url: "https://images.unsplash.com/photo-1561638897-1cac08b1d0ae?q=80&w=800",
        keywords: ["酸辣湯", "hot and sour soup", "蛋花湯", "勾芡湯"],
        category: "soup"
    },

    // ──────────────────────── 水果 / 點心 ────────────────────────
    {
        id: "r058",
        url: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=800",
        keywords: ["水果", "fruit", "水果盤", "新鮮水果", "水果拼盤"],
        category: "fruit"
    },
    {
        id: "r059",
        url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800",
        keywords: ["蘋果", "apple", "蘋果料理", "蘋果派", "蘋果沙拉"],
        category: "fruit"
    },
    {
        id: "r060",
        url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=800",
        keywords: ["香蕉", "banana", "香蕉料理", "香蕉奶昔"],
        category: "fruit"
    },
    {
        id: "r061",
        url: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800",
        keywords: ["草莓", "strawberry", "草莓蛋糕", "草莓甜點"],
        category: "fruit"
    },
    {
        id: "r062",
        url: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?q=80&w=800",
        keywords: ["芒果", "mango", "芒果甜點", "芒果冰"],
        category: "fruit"
    },
    {
        id: "r063",
        url: "https://images.unsplash.com/photo-1555521144-0ea9a04a7a0c?q=80&w=800",
        keywords: ["水果沙拉", "fruit salad", "綜合水果", "彩虹水果"],
        category: "fruit"
    },

    // ──────────────────────── 甜點 / 烘焙 ────────────────────────
    {
        id: "r064",
        url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800",
        keywords: ["蛋糕", "cake", "生日蛋糕", "巧克力蛋糕"],
        category: "dessert"
    },
    {
        id: "r065",
        url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800",
        keywords: ["鬆餅", "pancake", "waffle", "早餐甜點"],
        category: "dessert"
    },
    {
        id: "r066",
        url: "https://images.unsplash.com/photo-1559181567-c3190ebb4a2c?q=80&w=800",
        keywords: ["冰淇淋", "ice cream", "雪糕", "甜點"],
        category: "dessert"
    },
    {
        id: "r067",
        url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800",
        keywords: ["布丁", "pudding", "焦糖", "奶酪"],
        category: "dessert"
    },
    {
        id: "r068",
        url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800",
        keywords: ["餅乾", "cookie", "曲奇", "烘焙"],
        category: "dessert"
    },

    // ──────────────────────── 綜合 / 家常料理 ────────────────────────
    {
        id: "r069",
        url: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800",
        keywords: ["家常菜", "home cooking", "家庭料理", "簡單料理"],
        category: "mixed"
    },
    {
        id: "r070",
        url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=800",
        keywords: ["早餐", "breakfast", "吐司", "早午餐"],
        category: "mixed"
    },
    {
        id: "r071",
        url: "https://images.unsplash.com/photo-1529688530647-93a6e1916f5f?q=80&w=800",
        keywords: ["披薩", "pizza", "起司", "義式"],
        category: "mixed"
    },
    {
        id: "r072",
        url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=800",
        keywords: ["健康餐", "healthy", "均衡飲食", "健身餐", "輕食"],
        category: "mixed"
    },
    {
        id: "r073",
        url: "https://images.unsplash.com/photo-1512058454905-6b841e7ad132?q=80&w=800",
        keywords: ["便當", "bento", "日式便當", "午餐盒"],
        category: "mixed"
    },
    {
        id: "r074",
        url: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3b05?q=80&w=800",
        keywords: ["西式料理", "western", "歐式", "排餐"],
        category: "mixed"
    },
    {
        id: "r075",
        url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=800",
        keywords: ["印度", "indian", "咖哩", "香料"],
        category: "mixed"
    },
    {
        id: "r076",
        url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800",
        keywords: ["中式", "chinese", "台式", "家常", "傳統"],
        category: "mixed"
    },
    {
        id: "r077",
        url: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=800",
        keywords: ["素食", "vegan", "vegetarian", "全素"],
        category: "vegetable"
    },
    {
        id: "r078",
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
        keywords: ["烤肉", "barbecue", "bbq", "串燒", "烤串"],
        category: "meat"
    },
    {
        id: "r079",
        url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800",
        keywords: ["披薩", "pizza", "薄餅", "起司"],
        category: "mixed"
    },
    {
        id: "r080",
        url: "https://images.unsplash.com/photo-1551782450-17144efb9c50?q=80&w=800",
        keywords: ["三明治", "sandwich", "潛艇堡", "吐司"],
        category: "mixed"
    },
    {
        id: "r081",
        url: "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?q=80&w=800",
        keywords: ["春捲", "egg roll", "春卷", "炸春捲"],
        category: "mixed"
    },
    {
        id: "r082",
        url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=800",
        keywords: ["餃子", "dumpling", "水餃", "鍋貼", "煎餃"],
        category: "mixed"
    },
    {
        id: "r083",
        url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?q=80&w=800",
        keywords: ["咖哩", "curry", "泰式咖哩", "黃咖哩"],
        category: "mixed"
    },
    {
        id: "r084",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
        keywords: ["大餐", "feast", "豐盛", "晚餐", "dinner"],
        category: "mixed"
    },
    {
        id: "r085",
        url: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=800",
        keywords: ["低脂", "diet", "減脂", "低卡", "瘦身餐"],
        category: "mixed"
    },

    // ──────────────────────── 補充分類 ────────────────────────
    {
        id: "r086",
        url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=800",
        keywords: ["墨西哥", "tacos", "taco", "墨西哥捲"],
        category: "mixed"
    },
    {
        id: "r087",
        url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?q=80&w=800",
        keywords: ["鐵板燒", "teppanyaki", "日式", "牛肉"],
        category: "meat"
    },
    {
        id: "r088",
        url: "https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?q=80&w=800",
        keywords: ["鍋物", "hot pot", "火鍋", "涮涮鍋", "日式鍋"],
        category: "mixed"
    },
    {
        id: "r089",
        url: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?q=80&w=800",
        keywords: ["甜甜圈", "donut", "麵包", "烘焙"],
        category: "dessert"
    },
    {
        id: "r090",
        url: "https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?q=80&w=800",
        keywords: ["蛋糕捲", "roll cake", "瑞士捲", "甜點"],
        category: "dessert"
    },
    {
        id: "r091",
        url: "https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=800",
        keywords: ["肉類料理", "meat dish", "豐盛肉", "燉肉"],
        category: "meat"
    },
    {
        id: "r092",
        url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=800",
        keywords: ["起司", "cheese", "焗烤", "乳酪料理"],
        category: "mixed"
    },
    {
        id: "r093",
        url: "https://images.unsplash.com/photo-1626200926449-43f35052cb4a?q=80&w=800",
        keywords: ["抹茶", "matcha", "日式甜點", "綠茶"],
        category: "dessert"
    },
    {
        id: "r094",
        url: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?q=80&w=800",
        keywords: ["雞湯", "chicken soup", "煲湯", "滋補湯"],
        category: "soup"
    },
    {
        id: "r095",
        url: "https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=800",
        keywords: ["下午茶", "afternoon tea", "茶點", "甜點組合"],
        category: "dessert"
    },
    {
        id: "r096",
        url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
        keywords: ["烤牛肉", "roast beef", "牛肉料理", "厚切"],
        category: "meat"
    },
    {
        id: "r097",
        url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=800",
        keywords: ["沙拉碗", "salad bowl", "健康碗", "穀物碗", "餐碗"],
        category: "vegetable"
    },
    {
        id: "r098",
        url: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=800",
        keywords: ["焗烤", "baked", "起司焗", "gratin", "烤箱料理"],
        category: "mixed"
    },
    {
        id: "r099",
        url: "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800",
        keywords: ["海鮮飯", "seafood rice", "海鮮炒飯", "paella"],
        category: "seafood"
    },
    {
        id: "r100",
        url: "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?q=80&w=800",
        keywords: ["滷味", "braised", "滷菜", "魯味", "鹹水雞"],
        category: "mixed"
    },
];

/**
 * 智能食譜圖片匹配
 * 根據食譜名稱、食材列表、類別，從 100 張圖片庫中挑出最合適的圖片。
 * 
 * @param recipeName - AI 生成的食譜名稱（繁中）
 * @param ingredients - 使用的食材列表
 * @param category - 食譜類別 (vegetable/meat/mixed...)
 * @returns 最符合的圖片 URL
 */
export function matchRecipeImage(
    recipeName: string,
    ingredients: string[],
    category: string
): string {
    const nameLC = recipeName.toLowerCase();
    const ingrLC = ingredients.map(i => i.toLowerCase()).join(" ");
    const combined = `${nameLC} ${ingrLC}`;

    // 計算每個圖片的關鍵字匹配分數
    const scored = RECIPE_IMAGE_LIBRARY.map(entry => {
        let score = 0;
        
        // 類別匹配加基礎分
        if (entry.category === category || 
            (category === "mixed" && ["mixed", "meat", "vegetable"].includes(entry.category))) {
            score += 1;
        }

        // 關鍵字匹配
        for (const kw of entry.keywords) {
            const kwLC = kw.toLowerCase();
            if (combined.includes(kwLC)) {
                // 精確匹配加更高分
                score += kwLC.length > 2 ? 3 : 1;
            }
        }

        return { entry, score };
    });

    // 按分數排序，若並列則隨機選一張（增加多樣性）
    const topMatches = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score);

    if (topMatches.length > 0) {
        // 從分數前三中隨機選一張，增加變化性
        const top3 = topMatches.slice(0, 3);
        const selected = top3[Math.floor(Math.random() * top3.length)];
        return selected.entry.url;
    }

    // fallback：依類別回傳預設圖片
    return getFallbackImage(category);
}

/**
 * 依類別取得備用圖片
 */
function getFallbackImage(category: string): string {
    const fallbacks: Record<string, string> = {
        vegetable: RECIPE_IMAGE_LIBRARY[37].url, // 沙拉
        meat:      RECIPE_IMAGE_LIBRARY[13].url, // 烤雞
        mixed:     RECIPE_IMAGE_LIBRARY[68].url, // 家常菜
        soup:      RECIPE_IMAGE_LIBRARY[50].url, // 湯
        noodle:    RECIPE_IMAGE_LIBRARY[6].url,  // 拉麵
        rice:      RECIPE_IMAGE_LIBRARY[0].url,  // 炒飯
        fruit:     RECIPE_IMAGE_LIBRARY[57].url, // 水果
        dessert:   RECIPE_IMAGE_LIBRARY[63].url, // 蛋糕
        seafood:   RECIPE_IMAGE_LIBRARY[25].url, // 魚
        egg:       RECIPE_IMAGE_LIBRARY[32].url, // 蛋
    };
    return fallbacks[category] || RECIPE_IMAGE_LIBRARY[68].url;
}
