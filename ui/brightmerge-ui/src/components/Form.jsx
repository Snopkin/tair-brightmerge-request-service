// src/components/form.jsx
import React, { useRef, useState } from "react";

export default function Form({
                                 values,
                                 onChange,
                                 onPreview,
                                 onSend,
                                 loading,
                                 sending,
                             }) {
    const set = (field) => (e) =>
        onChange({
            ...values,
            [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
        });

    // upload state
    const inputRef = useRef(null);
    const [uploadBusy, setUploadBusy] = useState(false);
    const [uploadErr, setUploadErr] = useState(null);
    const [uploadedName, setUploadedName] = useState(""); // shown to user

    async function uploadSelectedFile(file) {
        if (!file) return;
        setUploadErr(null);
        setUploadBusy(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/ui/upload", { method: "POST", body: fd });
            const text = await res.text();
            const json = text ? JSON.parse(text) : {};
            if (!res.ok) throw new Error(json?.message || text || `Upload failed: ${res.status}`);

            const savedPath = json?.savedPath;
            const displayName = json?.originalName || file.name;
            if (!savedPath) throw new Error("Upload OK but no savedPath returned");

            // store server path internally (not shown)
            onChange({ ...values, path: savedPath });
            setUploadedName(displayName);
        } catch (err) {
            setUploadErr(err?.message || "Upload failed");
            setUploadedName("");
            // clear internal path so user can’t send accidentally
            onChange({ ...values, path: "" });
        } finally {
            setUploadBusy(false);
            if (inputRef.current) inputRef.current.value = ""; // allow re-pick same file
        }
    }

    async function handleFilePicked(e) {
        const file = e.target.files?.[0];
        if (file) await uploadSelectedFile(file);
    }

    return (
        <div className="bg-white rounded-2xl border p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Base URL */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Base URL</span>
                    <input
                        className="w-full bg-white rounded-xl border px-3 py-2 mt-1"
                        value={values.url}
                        onChange={set("url")}
                        placeholder="https://platform.prod.brightmerge.com"
                    />
                </label>

                {/* Refresh Token */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Refresh Token</span>
                    <input
                        type="password"
                        className="w-full bg-white rounded-xl border px-3 py-2 mt-1"
                        value={values.refreshToken}
                        onChange={set("refreshToken")}
                        placeholder="paste refresh token"
                        autoComplete="off"
                    />
                </label>

                {/* Fleet ID */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Fleet ID</span>
                    <input
                        className="w-full bg-white rounded-xl border px-3 py-2 mt-1"
                        value={values.fleet}
                        onChange={set("fleet")}
                        placeholder="e.g. 826a..."
                    />
                </label>

                {/* File picker (no path input shown) */}
                <div className="block">
                    <span className="text-sm font-medium text-gray-700">Excel File (.xlsx)</span>

                    {/* Custom row: Choose button + filename pill (no native “No file chosen”) */}
                    <div className="mt-1 flex items-center gap-3">
                        <label className="inline-flex">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
                Choose File
              </span>
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={handleFilePicked}
                                disabled={uploadBusy}
                                className="sr-only"
                            />
                        </label>

                        {uploadedName ? (
                            <span className="inline-flex items-center text-sm px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                {uploadedName}
              </span>
                        ) : (
                            <span className="text-sm text-slate-500">No file chosen</span>
                        )}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                        Choose a file to upload (recommended) — we’ll set the server path automatically.
                    </div>
                    {uploadBusy && <div className="text-xs text-indigo-700 mt-1">Uploading…</div>}
                    {uploadErr && <div className="text-xs text-red-600 mt-1">Upload error: {uploadErr}</div>}
                </div>

                {/* Sheet Name */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Sheet Name</span>
                    <input
                        className="w-full bg-white rounded-xl border px-3 py-2 mt-1"
                        value={values.sheet}
                        onChange={set("sheet")}
                        placeholder="Sheet1"
                    />
                </label>

                {/* Interval Minutes */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700">Interval Minutes</span>
                    <input
                        type="number"
                        min={1}
                        className="w-full bg-white rounded-xl border px-3 py-2 mt-1"
                        value={values.intervalMinutes}
                        onChange={set("intervalMinutes")}
                        placeholder="60"
                    />
                </label>
            </div>

            {/* Skip zeros */}
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={values.skipZeros} onChange={set("skipZeros")} />
                <span className="text-sm text-gray-700">Skip rows where Light=0 and Medium=0</span>
            </label>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    onClick={onPreview}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Previewing…" : "Preview"}
                </button>
                <button
                    onClick={onSend}
                    disabled={sending || !values.path} // require an uploaded file
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    title={!values.path ? "Upload a file first" : undefined}
                >
                    {sending ? "Sending…" : "Send"}
                </button>
            </div>
        </div>
    );
}