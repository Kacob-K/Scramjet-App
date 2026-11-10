// Builds a static copy of the Scramjet frontend into dist/ for Netlify.
// Netlify can't host the Wisp WebSocket server, so the client connects to an
// external Wisp server set via WISP_PREFERRED (and optionally WISP_FALLBACK).
import { cpSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = `${root}dist`;

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

cpSync(`${root}public`, dist, { recursive: true });
cpSync(scramjetPath, `${dist}/scram`, { recursive: true });
cpSync(libcurlPath, `${dist}/libcurl`, { recursive: true });
cpSync(baremuxPath, `${dist}/baremux`, { recursive: true });

const config = {
	wispPreferred: process.env.WISP_PREFERRED || "",
	wispFallback: process.env.WISP_FALLBACK || "",
};
writeFileSync(`${dist}/config.js`, `let _CONFIG = ${JSON.stringify(config)};\n`);

if (!config.wispPreferred && !config.wispFallback) {
	console.warn(
		"Warning: WISP_PREFERRED is not set; the proxy will try /wisp/ on the same host, which Netlify cannot serve."
	);
}
console.log("Built static site into dist/");
