// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Form from "./components/Form.jsx";
import PreviewGrid from "./components/PreviewGrid.jsx";
import SendResults from "./components/SendResults.jsx";
import ResultsTabs from "./components/ResultsTabs.jsx";
import ProgressBar from "./components/ProgressBar.jsx";
import { Alert } from "./components/Ui.jsx";
import { postJson } from "./lib/http";

export default function App() {
    // ---------- form values ----------
    const [values, setValues] = useState({
        url: "https://platform.prod.brightmerge.com",
        refreshToken: "",
        fleet: "",
        intervalMinutes: 60,
        skipZeros: true,
        sheet: "Sheet1",
        path: "", // set by file upload
    });

    // ---------- ui state ----------
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    // preview data
    const [previewItems, setPreviewItems] = useState([]);
    const [previewSummary, setPreviewSummary] = useState(null);

    // send data
    const [sendResults, setSendResults] = useState([]);
    const [sendSummary, setSendSummary] = useState(null);

    // which results panel is visible: 'preview' | 'send' | null
    const [activeView, setActiveView] = useState(null);

    // smooth scroll target
    const resultsRef = useRef(null);

    // progress bar (0..1)
    const [sendingProgress, setSendingProgress] = useState(0);
    const progressTimerRef = useRef(null);

    // payload for backend calls
    const payload = useMemo(() => ({ ...values }), [values]);

    // ---------- helpers ----------
    function validate() {
        if (!values.url) return "Base URL is required";
        if (!values.refreshToken) return "Refresh token is required";
        if (!values.fleet) return "Fleet ID is required";
        if (!values.path) return "Excel file is required (upload or paste path)";
        if (!values.sheet) return "Sheet name is required";
        if (!values.intervalMinutes || values.intervalMinutes <= 0)
            return "Interval minutes must be > 0";
        return null;
    }

    // auto-scroll when results switch and have content
    useEffect(() => {
        if (!resultsRef.current) return;
        const hasPreview = activeView === "preview" && previewItems.length > 0;
        const hasSend = activeView === "send" && sendResults.length > 0;
        if (hasPreview || hasSend) {
            resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [activeView, previewItems.length, sendResults.length]);

    // progress animation (caps at 95% until server reply)
    function startProgress(totalItems) {
        clearInterval(progressTimerRef.current);
        setSendingProgress(0.02);
        const estMs = Math.max(3000, Math.min(15000, (totalItems || 20) * 300));
        const start = Date.now();
        progressTimerRef.current = setInterval(() => {
            const ratio = Math.min(0.95, (Date.now() - start) / estMs);
            setSendingProgress(ratio);
        }, 120);
    }
    function finishProgress() {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
        setSendingProgress(1);
        setTimeout(() => setSendingProgress(0), 600);
    }

    // ---------- actions ----------
    async function onPreview() {
        const v = validate();
        if (v) return setError(v);

        setError(null);
        setLoading(true);

        try {
            const data = await postJson("/ui/preview", payload); // { items, summary }
            const items = data.items || [];
            setPreviewItems(items);
            setPreviewSummary(
                data.summary || {
                    total: items.length,
                    light: items.filter((x) => x.name?.startsWith("light")).length,
                    medium: items.filter((x) => x.name?.startsWith("medium")).length,
                }
            );
            setActiveView("preview");
        } catch (e) {
            setPreviewItems([]);
            setPreviewSummary(null);
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }

    async function onSend() {
        const v = validate();
        if (v) return setError(v);

        setError(null);
        setSending(true);
        startProgress(previewItems.length || 20);

        try {
            const data = await postJson("/ui/send", payload); // { results, summary }
            setSendResults(data.results || []);
            setSendSummary(data.summary || null);
            setActiveView("send");
            finishProgress();
        } catch (e) {
            setSendResults([]);
            setSendSummary(null);
            setError(formatError(e));
            finishProgress();
        } finally {
            setSending(false);
        }
    }

    // ---------- render ----------
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex items-start justify-center">
            <div className="w-full max-w-6xl p-6 space-y-6">
                {/* Top accent */}
                <div className="fixed inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-90" />

                {/* Header */}
                <header className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">🚗</div>
                    <div>
                        <h1 className="text-2xl font-semibold">Brightmerge Fleet Uploader</h1>
                        <p className="text-sm text-slate-500">
                            Configure, preview, and send vehicle grouping requests.
                        </p>
                    </div>
                </header>

                {/* Error banner */}
                {error && (
                    <Alert title="Something went wrong" onClose={() => setError(null)}>
                        <ErrorDetails error={error} />
                    </Alert>
                )}

                {/* Form */}
                <Form
                    values={values}
                    onChange={setValues}
                    onPreview={onPreview}
                    onSend={onSend}
                    loading={loading}
                    sending={sending}
                />

                {/* Results Section */}
                {(previewItems.length > 0 || sendResults.length > 0 || sendingProgress > 0) && (
                    <section ref={resultsRef} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">Results</h2>
                            <ResultsTabs
                                active={activeView || (sendResults.length ? "send" : "preview")}
                                onChange={setActiveView}
                                previewCount={previewItems.length}
                                sendCount={sendResults.length}
                            />
                        </div>

                        {/* Progress while sending */}
                        {sending || (sendingProgress > 0 && sendingProgress < 1) ? (
                            <ProgressBar value={sendingProgress} label="Sending to Brightmerge…" />
                        ) : null}

                        {/* Panel content */}
                        <div>
                            {activeView === "send" ? (
                                <SendResults results={sendResults} summary={sendSummary} />
                            ) : (
                                <PreviewGrid items={previewItems} summary={previewSummary} />
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

// ---------- helpers ----------
function formatError(e) {
    if (e?.status === 0) {
        return { title: "Network error", message: e?.cause?.message || "Could not reach server." };
    }
    if (typeof e?.status === "number") {
        const serverMsg =
            (e.json && (e.json.message || e.json.error)) || (e.body && e.body.slice(0, 400)) || "";
        return {
            title: `HTTP ${e.status} ${e.statusText || ""}`.trim(),
            message: serverMsg || "The server returned an error.",
            url: e.url,
        };
    }
    return { title: "Unexpected error", message: e?.message || String(e) };
}

function ErrorDetails({ error }) {
    return (
        <div className="space-y-1">
            <div className="font-medium">{error.title}</div>
            {error.message && <div className="text-sm">{error.message}</div>}
            {error.url && <div className="text-xs text-slate-500">URL: {error.url}</div>}
        </div>
    );
}