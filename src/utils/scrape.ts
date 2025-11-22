import { chromium } from "playwright";

export async function scrapeWebsite(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait a tiny bit for dynamic JS content
    await page.waitForTimeout(1500);

    // Extract visible text (not script/style content)
    const content = await page.evaluate(() => {
      const body = document.body;
      if (!body) return "";
      return body.innerText || "";
    });

    await browser.close();

    // Optionally trim massive text to avoid wasting tokens
    return content.length > 20000 ? content.slice(0, 20000) : content;
  } catch (err) {
    await browser.close();
    throw new Error("Failed to scrape website: " + (err as Error).message);
  }
}
