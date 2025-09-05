// src/components/SendResults.jsx
import React from "react";

export default function SendResults({ results, summary }) {
    if (!results?.length) return null;

    return (
        <section className="space-y-3">
            <div className="rounded-2xl border bg-white p-4">
                <div className="text-sm text-gray-700">
                    Sent: <span className="font-medium">{summary?.sent ?? 0}</span> ·
                    {" "}Failed: <span className="font-medium">{summary?.failed ?? 0}</span>
                </div>
            </div>

            <h3 className="text-md font-semibold text-gray-900">Send Results</h3>
            <div className="rounded-2xl border bg-white overflow-hidden">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {results.map((r, i) => (
                        <tr key={i}>
                            <td className="p-2">{r.name ?? ""}</td>
                            <td className="p-2">{r.status ?? r}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}