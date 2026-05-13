const fs = require("node:fs");
const { chromium } = require("playwright");

(async () => {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const executablePath = fs.existsSync(chromePath) ? chromePath : fs.existsSync(edgePath) ? edgePath : undefined;
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await page.waitForSelector(".page-title", { timeout: 10000 });
  const title = await page.locator(".page-title").innerText();
  const dashboardFilters = await page.locator(".filter-pill").count();
  await page.getByText("Таблица-отчет", { exact: true }).click();
  await page.waitForSelector(".source-table", { timeout: 10000 });
  const sourceRows = await page.locator(".source-table tbody tr").count();
  const normLines = await page.locator(".norm-line").count();
  const zones = await page.locator(".source-table td.recruiting-zone").count();
  const editButtons = await page.locator("[data-edit-project]").count();
  const navButtons = await page.locator(".nav button").count();
  await page.getByText("Проекты", { exact: true }).click();
  await page.waitForSelector("table", { timeout: 10000 });
  const rows = await page.locator("tbody tr").count();
  await page.getByText("Маркетинг", { exact: true }).click();
  await page.waitForSelector(".page-title", { timeout: 10000 });
  const marketingTitle = await page.locator(".page-title").innerText();
  console.log(JSON.stringify({ title, dashboardFilters, sourceRows, normLines, zones, editButtons, navButtons, rows, marketingTitle, errors }, null, 2));
  await browser.close();
  if (errors.length || dashboardFilters < 6 || sourceRows < 40 || normLines < 20 || zones < 20 || editButtons < 20 || navButtons < 9 || rows < 10) process.exit(1);
})();
