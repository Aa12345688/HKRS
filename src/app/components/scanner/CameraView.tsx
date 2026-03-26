/// <reference types="vite/client" />
import { RefObject, useState, useEffect, useRef } from "react";
import { Camera, Loader2, RefreshCw, Sparkles, Brain } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";
import { llmService } from "../../services/llmService";
import { yoloService } from "../../services/yoloService";
import { notificationService } from "../../services/notificationService";
import { hapticService } from "../../services/hapticService";

// 使用 global 宣告來告訴 TypeScript 我們的 ort 在 window 上
declare global {
    interface Window {
        ort: any;
    }
}

interface CameraViewProps {
    videoRef: RefObject<HTMLVideoElement | null>;
}

/**
 * 攝影機掃描視圖 (CameraView - ONNX 離線版)
 */
export function CameraView({ videoRef }: CameraViewProps) {
    const { addItem, clearTempDetections, settings, t, tempDetections } = useIngredients();
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<"local" | "cloud">("local");
    const [currentBoxes, setCurrentBoxes] = useState<any[]>([]);
    const [modelLoaded, setModelLoaded] = useState(false);
    const sessionRef = useRef<any>(null);

    // 類別名稱對照表 (由 yoloService 統一管理)
    const CLASS_NAMES = yoloService.CLASS_NAMES;

    // 初始化：檢查 yoloService 狀態
    useEffect(() => {
        if (yoloService.isLoaded()) {
            setModelLoaded(true);
            sessionRef.current = yoloService.getSession();
        } else {
            // 如果尚未預熱完成，則持續輪詢
            const timer = setInterval(() => {
                if (yoloService.isLoaded()) {
                    setModelLoaded(true);
                    sessionRef.current = yoloService.getSession();
                    clearInterval(timer);
                }
            }, 500);
            return () => clearInterval(timer);
        }

        // 偵測網路狀態並自動切換模式
        const handleOffline = () => {
            if (scanMode === "cloud") {
                setScanMode("local");
                notificationService.send(t('common.offline'), t('scanner.offline'));
            }
        };
        window.addEventListener('offline', handleOffline);
        return () => window.removeEventListener('offline', handleOffline);
    }, [scanMode, t]);

    const handleScan = async () => {
        hapticService.medium(); // 觸感震動回饋
        if (scanMode === "local") {
            await handleLocalScan();
        } else {
            await handleGeminiScan();
        }
    };

    const handleLocalScan = async () => {
        if (!videoRef.current || !sessionRef.current) return;
        setIsScanning(true);
        setCurrentBoxes([]);
        clearTempDetections();

        try {
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 640;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0, 640, 640);

            const imgData = ctx.getImageData(0, 0, 640, 640);
            const input = new Float32Array(3 * 640 * 640);
            for (let i = 0; i < 640 * 640; i++) {
                input[i] = imgData.data[i * 4] / 255.0;
                input[i + 640 * 640] = imgData.data[i * 4 + 1] / 255.0;
                input[i + 2 * 640 * 640] = imgData.data[i * 4 + 2] / 255.0;
            }
            const tensor = new window.ort.Tensor("float32", input, [1, 3, 640, 640]);

            const feeds = { [sessionRef.current.inputNames[0]]: tensor };
            const results = await sessionRef.current.run(feeds);
            const outputView = results[sessionRef.current.outputNames[0]];
            const output = outputView.data as Float32Array;
            const dims = outputView.dims;

            const detections: any[] = [];
            const CONF_THRESHOLD = settings.confidenceThreshold;

            const isTransposed = dims[1] > dims[2];
            const numAnchors = isTransposed ? dims[1] : dims[2];
            const numChannels = isTransposed ? dims[2] : dims[1];

            for (let i = 0; i < numAnchors; i++) {
                let maxConf = 0;
                let classId = -1;

                for (let c = 0; c < CLASS_NAMES.length; c++) {
                    const idx = isTransposed ? i * numChannels + (c + 4) : (c + 4) * numAnchors + i;
                    const conf = output[idx];
                    if (conf > maxConf) {
                        maxConf = conf;
                        classId = c;
                    }
                }

                if (maxConf > CONF_THRESHOLD) {
                    const cx = output[isTransposed ? i * numChannels : i];
                    const cy = output[isTransposed ? i * numChannels + 1 : numAnchors + i];
                    const w = output[isTransposed ? i * numChannels + 2 : numAnchors * 2 + i];
                    const h = output[isTransposed ? i * numChannels + 3 : numAnchors * 3 + i];

                    detections.push({
                        name: CLASS_NAMES[classId],
                        confidence: maxConf,
                        box: [(cx - w / 2) / 640, (cy - h / 2) / 640, (cx + w / 2) / 640, (cy + h / 2) / 640],
                        isSpoiled: CLASS_NAMES[classId].toLowerCase().includes("rotten"),
                        category: CLASS_NAMES[classId].includes("apple") || CLASS_NAMES[classId].includes("orange") || CLASS_NAMES[classId].includes("banana") ? (settings.language === 'en' ? "Fruit" : "水果") : (CLASS_NAMES[classId].includes("cabbage") || CLASS_NAMES[classId].includes("spinach") ? (settings.language === 'en' ? "Vegetable" : "蔬菜") : (CLASS_NAMES[classId].includes("meat") ? (settings.language === 'en' ? "Meat" : "肉類") : (settings.language === 'en' ? "Other" : "其他")))
                    });
                }
            }

            const nmsDetections: any[] = [];
            const sortedDetections = detections.sort((a, b) => b.confidence - a.confidence);
            for (const det of sortedDetections) {
                let keep = true;
                for (const kept of nmsDetections) {
                    const interX1 = Math.max(det.box[0], kept.box[0]);
                    const interY1 = Math.max(det.box[1], kept.box[1]);
                    const interX2 = Math.min(det.box[2], kept.box[2]);
                    const interY2 = Math.min(det.box[3], kept.box[3]);
                    const interArea = Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1);
                    const areaA = (det.box[2] - det.box[0]) * (det.box[3] - det.box[1]);
                    const areaB = (kept.box[2] - kept.box[0]) * (kept.box[3] - kept.box[1]);
                    const iou = interArea / (areaA + areaB - interArea);
                    if (iou > 0.5) { keep = false; break; }
                }
                if (keep) {
                    nmsDetections.push(det);
                    if (nmsDetections.length >= 10) break;
                }
            }

            if (nmsDetections.length === 0) {
                notificationService.send(t('scanner.ready'), t('scanner.aim'));
            } else {
                setCurrentBoxes(nmsDetections);
                nmsDetections.forEach(det => addItem(det));
            }
        } catch (error) {
            console.warn("Local Scan Error:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleGeminiScan = async () => {
        if (!videoRef.current) return;
        setIsScanning(true);
        setCurrentBoxes([]);
        clearTempDetections();

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0);

            const base64Image = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
            const results = await llmService.detectIngredientsFromImage(base64Image, settings.language);

            if (results.length === 0) {
                notificationService.send(t('scanner.ready'), t('scanner.aim'));
            } else {
                hapticService.light(); 
                results.forEach(item => addItem(item, "ai"));
                notificationService.send(t('scanner.ready'), `${t('scanner.gemini_ready')}: ${results.length}`);
            }
        } catch (error: any) {
            console.error("Gemini Scan Error:", error);
            notificationService.send(t('common.error_provider'), error.message || "Error");
        } finally {
            setIsScanning(false);
        }
    };

    const handleClear = () => {
        clearTempDetections();
        setCurrentBoxes([]);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm">
            <div className="relative w-full">
                <div className="flex bg-card p-1 mb-4 border-2 border-primary self-center w-fit mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setScanMode("local")}
                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === "local" ? 'bg-primary text-background' : 'text-primary/60 hover:text-primary'}`}
                    >
                        <Brain size={14} />
                        {t('scanner.yolo')}
                    </button>
                    <button
                        onClick={() => setScanMode("cloud")}
                        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === "cloud" ? 'bg-primary text-background' : 'text-primary/60 hover:text-primary'}`}
                    >
                        <Sparkles size={14} />
                        {t('scanner.gemini')}
                    </button>
                </div>

                <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-card border-2 ${!navigator.onLine && scanMode === "cloud" ? 'border-red-500' : !modelLoaded && scanMode === "local" ? 'border-red-400' : isScanning ? 'border-amber-400' : 'border-primary'} px-4 py-1.5 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-colors duration-500`}>
                    <div className={`w-2 h-2 ${!navigator.onLine && scanMode === "cloud" ? 'bg-red-500 animate-pulse' : !modelLoaded && scanMode === "local" ? 'bg-red-400' : isScanning ? 'bg-amber-400 animate-pulse' : 'bg-primary'}`} />
                    <span className={`text-[10px] font-black tracking-widest ${!navigator.onLine && scanMode === "cloud" ? 'text-red-500' : !modelLoaded && scanMode === "local" ? 'text-red-400' : isScanning ? 'text-amber-400' : 'text-primary'} uppercase`}>
                        {!navigator.onLine && scanMode === "cloud" ? t('scanner.offline') : scanMode === "cloud" ? (isScanning ? t('scanner.linking') : t('scanner.gemini_ready')) : (!modelLoaded ? t('scanner.booting') : isScanning ? t('scanner.analyzing') : t('scanner.ready'))}
                    </span>
                </div>

                <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-black border-4 border-white/20 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] group">
                    {isScanning && scanMode === "local" && (
                        <div className="animate-scan-laser" />
                    )}
                    
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-all duration-700 ${isScanning ? 'scale-105 brightness-110' : 'scale-100 brightness-100'}`}
                    />

                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {currentBoxes.map((boxData, idx) => boxData.box && (
                            <div
                                key={`box-${idx}`}
                                className="absolute"
                                style={{
                                    left: `${boxData.box[0] * 100}%`,
                                    top: `${boxData.box[1] * 100}%`,
                                    width: `${(boxData.box[2] - boxData.box[0]) * 100}%`,
                                    height: `${(boxData.box[3] - boxData.box[1]) * 100}%`,
                                    borderColor: boxData.isSpoiled ? '#ff4d4d' : 'var(--primary)',
                                    borderWidth: '4px',
                                    borderStyle: 'solid',
                                    borderRadius: '0px'
                                }}
                            >
                                <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded-t-md text-[8px] font-black uppercase whitespace-nowrap ${boxData.isSpoiled ? 'bg-red-500 text-white' : 'bg-primary text-background'}`}>
                                    {boxData.isSpoiled ? t('scanner.bad') : t('scanner.good')} | {boxData.name} | {Math.round((boxData.confidence || 0) * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent pointer-events-none" />

                    {isScanning && (
                        <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center">
                            <div className="w-full h-[2px] bg-amber-400 shadow-[0_0_15px_#fbbf24] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                    )}
                </div>
            </div>

            {tempDetections.length > 0 && (
                <div className="w-full flex justify-end px-2 mb-2 mt-4">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border-2 border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase"
                    >
                        <RefreshCw size={12} />
                        {t('scanner.refresh')}
                    </button>
                </div>
            )}

            <div className="w-full mt-8 space-y-3 px-2">
                <button
                    onClick={handleScan}
                    disabled={isScanning || (scanMode === "local" && !modelLoaded)}
                    className="w-full pixel-button bg-primary text-background py-4 font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isScanning ? <Loader2 size={24} className="animate-spin" /> : scanMode === "cloud" ? <Sparkles size={24} strokeWidth={3} /> : <Camera size={24} strokeWidth={3} />}
                    <span className="truncate">{isScanning ? t('scanner.linking') : scanMode === "cloud" ? t('scanner.cloud_scan') : t('scanner.start')}</span>
                </button>
            </div>
        </div>
    );
}
