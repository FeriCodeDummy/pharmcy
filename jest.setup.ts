require("whatwg-fetch");

// Provide static Response.json for Next route handlers
if (typeof Response !== "undefined" && typeof Response.json !== "function") {
    Response.json = (data, init = {}) => {
        const headers = new Headers(init.headers || {});
        if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
        const safe = data === undefined ? null : data;
        return new Response(JSON.stringify(safe), { ...init, headers });
    };
}

// Make instance res.json() not throw on empty body
if (typeof Response !== "undefined") {
    const origJson = Response.prototype.json;
    Response.prototype.json = async function () {
        const txt = await this.text();
        if (!txt) return null;          // <-- prevents "Unexpected end of JSON input"
        return JSON.parse(txt);
    };
}
