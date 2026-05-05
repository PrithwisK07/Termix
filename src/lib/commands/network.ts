// src/lib/commands/network.ts
import { CommandHandler } from "./types";

export const networkCommands: Record<string, CommandHandler> = {
  curl: async (args) => {
    if (args.length === 0)
      return { text: "curl: try 'curl <url>' or 'man curl'", isError: true };

    let method = "GET";
    let body: BodyInit | undefined = undefined;
    const headers: Record<string, string> = {};
    let url = "";

    for (let i = 0; i < args.length; i++) {
      if (args[i] === "-X" || args[i] === "--request") {
        method = args[++i].toUpperCase();
      } else if (args[i] === "-d" || args[i] === "--data") {
        body = args[++i];
        if (method === "GET") method = "POST";
        if (!headers["Content-Type"])
          headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (args[i] === "-H" || args[i] === "--header") {
        const headerParts = args[++i].split(":");
        if (headerParts.length >= 2)
          headers[headerParts[0].trim()] = headerParts
            .slice(1)
            .join(":")
            .trim();
      } else if (!args[i].startsWith("-")) {
        url = args[i];
      }
    }

    if (!url) return { text: "curl: no URL specified", isError: true };
    if (!url.startsWith("http")) url = "https://" + url;

    let response;
    let time = 0;
    let proxyUsed = false;

    try {
      const start = performance.now();
      response = await fetch(url, { method, headers, body });
      time = Math.round(performance.now() - start);
    } catch (error) {
      console.error("Fetch error:", error);
      try {
        const start = performance.now();
        const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(url);
        proxyUsed = true;
        response = await fetch(proxyUrl, { method, headers, body });
        time = Math.round(performance.now() - start);
      } catch (proxyError) {
        console.error("Fetch error:", proxyError);
        return {
          text: `curl: (6) Could not resolve host or proxy failed for: ${url}`,
          isError: true,
        };
      }
    }

    try {
      const contentType = response.headers.get("content-type");
      let data = "";
      if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        data = JSON.stringify(json, null, 2);
      } else {
        data = await response.text();
      }
      if (data.length > 5000)
        data =
          data.substring(0, 5000) + "\n\n... [Response truncated due to size]";
      const proxyText = proxyUsed
        ? ` <span class="text-yellow-300">(via CORS Proxy)</span>`
        : "";
      return {
        text: `[Fetched in ${time}ms]${proxyText}\n${data}`,
        isHTML: true,
      };
    } catch (parseError) {
      console.error("Response parsing error:", parseError);
      return {
        text: `curl: Failed to parse response from ${url}`,
        isError: true,
      };
    }
  },
};
