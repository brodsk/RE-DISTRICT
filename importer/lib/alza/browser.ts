/**
 * RE:DISTRICT — Alza Browser Module
 * Playwright browser lifecycle management.
 * Playwright is used ONLY for rendering dynamic pages.
 * HTML parsing is delegated to Cheerio.
 */

import type { Browser, BrowserContext, Page } from "playwright";
import { PAGE_TIMEOUT_MS, USER_AGENT } from "./constants";
import { logger } from "./logger";

// ── Browser singleton ──────────────────────────────────────────────────────

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browserInstance) return browserInstance;

  const { chromium } = await import("playwright");

  logger.info("Launching Playwright Chromium browser");

  browserInstance = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      "--no-zygote",
      "--disable-background-networking",
      "--disable-default-apps",
      "--mute-audio",
    ],
  });

  browserInstance.on("disconnected", () => {
    browserInstance = null;
    logger.warn("Browser disconnected");
  });

  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    logger.info("Browser closed");
  }
}

// ── Context factory ────────────────────────────────────────────────────────

export async function createContext(): Promise<BrowserContext> {
  const browser = await getBrowser();

  return browser.newContext({
    userAgent: USER_AGENT,
    locale: "sk-SK",
    timezoneId: "Europe/Bratislava",
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    javaScriptEnabled: true,
    // Block analytics, ads, trackers for speed
    extraHTTPHeaders: {
      "Accept-Language": "sk-SK,sk;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });
}

// ── Page fetcher ───────────────────────────────────────────────────────────

export interface FetchedPage {
  html: string;
  url: string;
  statusCode: number;
}

export async function fetchPageHtml(
  url: string,
  context: BrowserContext,
  waitForSelector?: string,
): Promise<FetchedPage> {
  const page: Page = await context.newPage();

  // Block unnecessary resources for faster loading
  await page.route("**/*", (route) => {
    const resourceType = route.request().resourceType();
    const blockedTypes = ["font", "media"];
    const blockedDomains = ["google-analytics.com", "googletagmanager.com", "facebook.net", "doubleclick.net"];

    const requestUrl = route.request().url();
    const isDomainBlocked = blockedDomains.some(d => requestUrl.includes(d));

    if (blockedTypes.includes(resourceType) || isDomainBlocked) {
      route.abort().catch(() => undefined);
    } else {
      route.continue().catch(() => undefined);
    }
  });

  let statusCode = 200;

  page.on("response", (response) => {
    if (response.url() === url) {
      statusCode = response.status();
    }
  });

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: PAGE_TIMEOUT_MS,
    });

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 8_000 }).catch(() => {
        // Selector not found — continue anyway, content might still be parseable
      });
    }

    // Small wait for any JS-rendered content
    await page.waitForTimeout(500);

    const html = await page.content();

    return { html, url, statusCode };
  } finally {
    await page.close().catch(() => undefined);
  }
}
