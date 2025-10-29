// src/middleware.mjs
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { stat } from "node:fs/promises";

const PHP_BIN = process.env.ASTRO_PHP_BINARY || "php-cgi";
const PHP_DIR = process.env.ASTRO_PHP_DIR || resolve(process.cwd(), "src/php");

async function executeWithPhpCgi(scriptPath, request) {
  const url = new URL(request.url);
  const method = request.method;

  let postData = "";
  if (method === "POST") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      postData = JSON.stringify(await request.json());
    } else {
      postData = await request.text();
    }
  }

  const env = {
    ...process.env,
    REQUEST_METHOD: method,
    QUERY_STRING: url.search.slice(1),
    REQUEST_URI: url.pathname,
    SCRIPT_FILENAME: scriptPath,
    SCRIPT_NAME: url.pathname,
    SERVER_PROTOCOL: "HTTP/1.1",
    GATEWAY_INTERFACE: "CGI/1.1",
    REDIRECT_STATUS: "200",
    CONTENT_TYPE: request.headers.get("content-type") || "",
    CONTENT_LENGTH: postData ? Buffer.byteLength(postData).toString() : "0",
    HTTP_HOST: url.host,
    HTTP_USER_AGENT: request.headers.get("user-agent") || "",
    HTTP_ACCEPT: request.headers.get("accept") || "*/*",
    HTTP_COOKIE: request.headers.get("cookie") || "",
  };

  return new Promise((resolvePromise, rejectPromise) => {
    const php = spawn(PHP_BIN, [scriptPath], {
      env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    php.stdout.on("data", (d) => (stdout += d.toString()));
    php.stderr.on("data", (d) => (stderr += d.toString()));

    if (postData) php.stdin.write(postData);
    php.stdin.end();

    php.on("close", (code) => {
      if (code !== 0 && stderr) {
        rejectPromise(new Error(`php-cgi error: ${stderr}`));
        return;
      }
      const [rawHeaders, ...bodyParts] = stdout.split("\r\n\r\n");
      const body = bodyParts.join("\r\n\r\n");

      const headers = new Headers();
      rawHeaders
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => {
          const idx = line.indexOf(":");
          if (idx > 0) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim();
            headers.set(key, val);
          }
        });

      resolvePromise({ body, headers });
    });

    php.on("error", (err) => rejectPromise(err));
  });
}

async function executeWithPhpCli(scriptPath) {
  return new Promise((resolvePromise, rejectPromise) => {
    const php = spawn("php", [scriptPath], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    php.stdout.on("data", (d) => (stdout += d.toString()));
    php.stderr.on("data", (d) => (stderr += d.toString()));

    php.on("close", (code) => {
      if (code !== 0 && stderr) {
        rejectPromise(new Error(`php error: ${stderr}`));
        return;
      }
      resolvePromise({
        body: stdout,
        headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
      });
    });

    php.on("error", (err) => rejectPromise(err));
  });
}

export async function onRequest({ request, url }, next) {
  if (!url.pathname.endsWith(".php")) return next();

  try {
    const relative = url.pathname.replace(/^\/+/, "").replace(/^php\//, "");
    const scriptPath = join(PHP_DIR, relative);
    await stat(scriptPath); // throws if missing

    try {
      const { body, headers } = await executeWithPhpCgi(scriptPath, request);
      return new Response(body, { status: 200, headers });
    } catch (e) {
      // fallback to php CLI
      const { body, headers } = await executeWithPhpCli(scriptPath);
      return new Response(body, { status: 200, headers });
    }
  } catch (err) {
    console.error("[astro-php-ssr] PHP execution error:", err);
    return new Response(
      JSON.stringify({ error: "PHP execution failed", message: String(err?.message || err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
