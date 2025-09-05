// src/components/PreviewGrid.jsx
import React from "react";
import { Badge, Field } from "./Ui.jsx";

export default function PreviewGrid({ items, summary }) {
    if (!items?.length) return null;

    return (
        <section className="space-y-3">
            <div className="rounded-2xl border bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge tone="indigo">Total: {summary?.total ?? items.length}</Badge>
                    <Badge tone="emerald">Light: {summary?.light ?? items.filter(i => i.name?.startsWith("light")).length}</Badge>
                    <Badge tone="amber">Medium: {summary?.medium ?? items.filter(i => i.name?.startsWith("medium")).length}</Badge>
                </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">Preview Items</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((it, idx) => {
                    const isLight = (it.name || "").startsWith("light");
                    const tone = isLight ? "emerald" : "amber";
                    return (
                        <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="truncate font-semibold text-gray-900">{it.name}</div>
                                <Badge tone={tone}>{isLight ? "Light" : "Medium"}</Badge>
                            </div>

                            <div className="space-y-1.5">
                                <Field label="Vehicles" value={it.no_of_vehicles} />
                                <Field label="Avg daily route" value={it.avg_daily_route_distance} />
                                <Field label="Window" value={`${it.window_from} → ${it.window_to}`} />
                                <Field label="Battery" value={`${it.battery_size} kWh`} />
                                <Field label="Max power" value={`${it.battery_max_power} kW`} />
                                <Field label="Power type" value={it.power_type} />
                                <Field label="Fleet" value={(it.fleet || "").slice(0, 8) + "…"} />
                            </div>

                            <details className="mt-3">
                                <summary className="text-xs text-gray-500 cursor-pointer">Show raw JSON</summary>
                                <pre className="mt-2 text-xs bg-gray-50 text-gray-800 p-3 rounded-xl overflow-auto">
                  {JSON.stringify(it, null, 2)}
                </pre>
                            </details>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}