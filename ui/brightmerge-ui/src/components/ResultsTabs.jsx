// src/components/ResultsTabs.jsx
import React from "react";

export default function ResultsTabs({ active, onChange, previewCount, sendCount }) {
    const Tab = ({ id, label, count }) => {
        const isActive = active === id;
        return (
            <button
                onClick={() => onChange(id)}
                className={[
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm",
                    isActive
                        ? "bg-white border-slate-300 text-slate-900 shadow-sm"
                        : "bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200",
                ].join(" ")}
            >
                <span>{label}</span>
                <span className="inline-flex items-center justify-center min-w-5 h-5 text-xs px-1 rounded-full bg-slate-200">
          {count}
        </span>
            </button>
        );
    };

    return (
        <div className="flex items-center gap-2">
            <Tab id="preview" label="Preview" count={previewCount} />
            <Tab id="send" label="Send" count={sendCount} />
        </div>
    );
}