const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const filename = process.argv[2];

if (!filename) {
    console.error("Usage: node export.js <filename.html>");
    process.exit(1);
}

(async () => {
    const browser = await chromium.launch();

    const page = await browser.newPage({
        viewport: {
            width: 1123,
            height: 794
        },
        deviceScaleFactor: 3.125
    });

    await page.goto("file://" + path.resolve(filename), {
        waitUntil: "networkidle"
    });

    await page.evaluate(() => document.fonts.ready);

    // Dimensioni fisse A4 durante l'export
    await page.addStyleTag({
        content: `
            .page {
                width: 1123px !important;
                height: 794px !important;
                min-width: 1123px !important;
                min-height: 794px !important;
                margin: 0 !important;
                border: none !important;
            }

            .panel {
                border: none !important;
            }
        `
    });

    const pages = await page.locator(".page").all();

    const outputDir = path.join(path.dirname(filename), "output");
    fs.mkdirSync(outputDir, { recursive: true });

    for (let i = 0; i < pages.length; i++) {
        await pages[i].screenshot({
            path: path.join(outputDir, `pagina-${i + 1}.png`)
        });
    }

    await browser.close();
})();
