const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const port = 9231;
const runtimeUrl = "http://localhost:8027/";
const viewport = { width: 1366, height: 665 };
const evidenceDir = path.resolve(
  __dirname,
  "../docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_003_APP2/small_surface",
);

const chromeCandidates = [
  path.join(process.env.ProgramFiles || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  path.join(process.env.ProgramFiles || "", "Microsoft/Edge/Application/msedge.exe"),
  path.join(process.env["ProgramFiles(x86)"] || "", "Microsoft/Edge/Application/msedge.exe"),
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestJson(pathname, method = "GET") {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { hostname: "127.0.0.1", port, path: pathname, method },
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch {
            resolve({ text: data });
          }
        });
      },
    );
    request.on("error", reject);
    request.end();
  });
}

async function main() {
  const chrome = chromeCandidates.find((candidate) => candidate && fs.existsSync(candidate));
  if (!chrome) {
    throw new Error("No Chrome/Edge executable found for CDP browser verification.");
  }

  fs.mkdirSync(evidenceDir, { recursive: true });
  const userDataDir = path.join(os.tmpdir(), "gg-founder-review-cdp-profile");
  fs.rmSync(userDataDir, { recursive: true, force: true });
  fs.mkdirSync(userDataDir, { recursive: true });

  const browser = spawn(chrome, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--disable-gpu",
    "--no-first-run",
    "--disable-default-apps",
    "about:blank",
  ]);

  try {
    await delay(2500);
    const target = await requestJson(`/json/new?${runtimeUrl}`, "PUT");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    const runtimeExceptions = [];
    const networkFailures = [];

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
        return;
      }
      if (message.method === "Runtime.exceptionThrown") {
        runtimeExceptions.push(message.params);
      }
      if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
        runtimeExceptions.push(message.params.entry);
      }
      if (message.method === "Network.loadingFailed" && !message.params.canceled) {
        networkFailures.push(message.params);
      }
      if (
        message.method === "Network.responseReceived" &&
        message.params.response &&
        message.params.response.status >= 400
      ) {
        networkFailures.push({
          url: message.params.response.url,
          status: message.params.response.status,
        });
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const messageId = ++id;
        pending.set(messageId, resolve);
        ws.send(JSON.stringify({ id: messageId, method, params }));
      });
    }

    async function evaluate(expression) {
      const response = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (response.result && response.result.exceptionDetails) {
        return { error: response.result.exceptionDetails.text };
      }
      return response.result && response.result.result ? response.result.result.value : null;
    }

    await send("Runtime.enable");
    await send("Log.enable");
    await send("Network.enable");
    await send("Page.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send("Page.navigate", { url: runtimeUrl });
    await delay(6500);

    const rawResult = await evaluate(`(async () => {
      await document.fonts.ready;
      const mainMenu = window.game && game.scene.keys.MainMenu;
      const title = mainMenu && mainMenu.textTitle2;
      const names = ["logoPrimary", "textTitle2", "heroImage", "textPoint", "btnPoint", "textBest", "btnInfo", "btnMute"];
      const bounds = {};
      for (const name of names) {
        const item = mainMenu && mainMenu[name];
        if (item && item.getBounds) {
          const rect = item.getBounds();
          bounds[name] = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            right: rect.x + rect.width,
            bottom: rect.y + rect.height
          };
        } else {
          bounds[name] = null;
        }
      }
      return JSON.stringify({
        documentTitle: document.title,
        readyState: document.readyState,
        canvasCount: document.querySelectorAll("canvas").length,
        faviconLinks: Array.from(document.querySelectorAll("link[rel~=icon]")).map((link) => ({
          href: link.getAttribute("href"),
          type: link.getAttribute("type") || "",
          sizes: link.getAttribute("sizes") || ""
        })),
        appleTouchIconLinked: !!document.querySelector("link[rel='apple-touch-icon']"),
        rootFaviconIcoLinked: Array.from(document.querySelectorAll("link[rel~=icon]")).some((link) =>
          (link.getAttribute("href") || "").startsWith("/favicon.ico")
        ),
        fontsReady: document.fonts.status,
        titleFontLoaded: document.fonts.check("96px GalacticGunnersTitle"),
        displayFontLoaded: document.fonts.check("80px GalacticGunnersDisplay"),
        ctaText: title ? title.text : null,
        ctaFontFamily: title && title.style ? title.style.fontFamily : null,
        mainMenuActive: !!(mainMenu && mainMenu.scene.isActive()),
        bodyTextLength: document.body.innerText.trim().length,
        bounds
      });
    })()`);
    const result = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
    const screenshot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    fs.writeFileSync(
      path.join(evidenceDir, "FOUNDER_REVIEW_MENU_FONT_FAVICON_CHECK.png"),
      Buffer.from(screenshot.result.data, "base64"),
    );

    const report = {
      runtimeUrl,
      checkedAtUtc: new Date().toISOString(),
      result,
      viewport,
      runtimeExceptions,
      networkFailures,
      pass:
        result.documentTitle === "Galactic Gunners" &&
        result.rootFaviconIcoLinked === true &&
        result.appleTouchIconLinked === true &&
        result.faviconLinks.length >= 5 &&
        result.titleFontLoaded === true &&
        result.displayFontLoaded === true &&
        result.ctaText === "CAN YOU SAVE THE DAY?" &&
        String(result.ctaFontFamily).includes("GalacticGunnersTitle") &&
        result.mainMenuActive === true &&
        result.canvasCount >= 1 &&
        Object.values(result.bounds).every((bounds) =>
          bounds &&
          bounds.x >= -1 &&
          bounds.y >= -1 &&
          bounds.right <= viewport.width + 1 &&
          bounds.bottom <= viewport.height + 1
        ) &&
        runtimeExceptions.length === 0 &&
        networkFailures.length === 0,
    };

    fs.writeFileSync(
      path.join(evidenceDir, "FOUNDER_REVIEW_MENU_FONT_FAVICON_CHECK.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    );
    await send("Browser.close");
    console.log(JSON.stringify(report, null, 2));
    if (!report.pass) {
      process.exitCode = 1;
    }
  } finally {
    browser.kill();
    await delay(1000);
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
