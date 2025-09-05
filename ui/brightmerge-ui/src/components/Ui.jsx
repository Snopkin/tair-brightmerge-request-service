// src/components/Ui.jsx
import React from "react";

export const Badge = ({ children, tone = "indigo" }) => {
    const tones = {
        indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
        amber: "bg-amber-50 text-amber-800 border-amber-200",
        red: "bg-red-50 text-red-700 border-red-200",
        gray: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${tones[tone] || tones.gray}`}>
      {children}
    </span>
    );
};

export const Field = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-900">{value ?? "—"}</span>
    </div>
);

export const Alert = ({ tone = "red", title, children, onClose }) => {
    const tones = {
        red: "bg-red-50 border-red-200 text-red-800",
        amber: "bg-amber-50 border-amber-200 text-amber-900",
        green: "bg-emerald-50 border-emerald-200 text-emerald-900",
        gray: "bg-gray-50 border-gray-200 text-gray-800",
    };
    return (
        <div className={`rounded-xl border p-3 ${tones[tone]}`}>
            <div className="flex items-start gap-3">
                <div className="font-semibold">{title}</div>
                <div className="ml-auto">
                    {onClose && (
                        <button className="text-sm opacity-80 hover:opacity-100" onClick={onClose}>
                            ✕
                        </button>
                    )}
                </div>
            </div>
            {children && <div className="mt-1 text-sm">{children}</div>}
        </div>
    );
};

export const Button = ({ children, tone = "indigo", disabled, ...props }) => {
    const tones = {
        indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
        emerald: "bg-emerald-600 hover:bg-emerald-700 text-white",
        white: "bg-white hover:bg-gray-50 text-gray-900 border",
    };
    return (
        <button
            {...props}
            disabled={disabled}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${tones[tone] || tones.white} disabled:opacity-50`}
        >
            {children}
        </button>
    );
};