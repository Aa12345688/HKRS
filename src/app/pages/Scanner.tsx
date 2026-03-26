import React from "react";
import { useIngredients } from "../services/IngredientContext";
import { useCamera } from "../hooks/useCamera";
import { CameraView } from "../components/scanner/CameraView";
import { DetectionSummary } from "../components/inventory_management/DetectionSummary";

export function Scanner() {
    const { videoRef } = useCamera();
    const { t } = useIngredients();

    return (
        <div className="pb-28">
            <div className="flex flex-col items-center justify-center px-6 pt-6 pb-3">
                <CameraView videoRef={videoRef} />
                <DetectionSummary />
                <p className="text-center text-primary arcade-glow text-[10px] mt-8 px-10 leading-loose uppercase tracking-[0.2em] font-black opacity-90">
                    {t('scanner.aim')}<br />{t('scanner.protocol')}
                </p>
            </div>
        </div>
    );
}
