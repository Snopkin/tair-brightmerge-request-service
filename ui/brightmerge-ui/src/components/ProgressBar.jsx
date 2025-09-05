// src/components/ProgressBar.jsx
import React from "react";

export default function ProgressBar({ value = 0, label }) {
    const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">{label ?? "Sending…"}</span>
                <span className="text-xs text-slate-500">{pct}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-600 transition-[width] duration-200 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}