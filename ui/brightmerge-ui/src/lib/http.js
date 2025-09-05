// src/lib/http.js

/**
 * POST JSON with robust error handling.
 * Throws an Error with: { status, statusText, body, url }
 */
export async function postJson(url, payload) {
    let res;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload ?? {}),
        });
    } catch (networkErr) {
        const err = new Error("Network error");
        err.cause = networkErr;
        err.status = 0;
        err.statusText = "NETWORK";
        err.url = url;
        throw err;
    }

    const text = await res.text(); // read once
    const maybeJson = safeParseJson(text);

    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        err.statusText = res.statusText;
        err.body = text || "";
        err.json = maybeJson;
        err.url = url;
        throw err;
    }

    return maybeJson ?? {}; // endpoints return objects
}

function safeParseJson(s) {
    try {
        return s ? JSON.parse(s) : null;
    } catch {
        return null;
    }
}