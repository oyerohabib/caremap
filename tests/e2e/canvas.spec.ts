import { expect, test } from "@playwright/test";

test.describe("3D body map", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "WebGL smoke runs on chromium only");

  test("renders, stays smooth while idle, and selects a region on tap", async ({ page }) => {
    await page.goto("/t/lumen/intake");
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
    await expect(page.getByRole("img", { name: /3D body map/ })).toBeVisible();

    // frameloop="demand" means an idle scene should leave the main thread free.
    await page.waitForLoadState("networkidle");
    const sampleFps = () =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let frames = 0;
            const start = performance.now();
            const tick = () => {
              frames++;
              if (performance.now() - start < 1000) requestAnimationFrame(tick);
              else resolve((frames * 1000) / (performance.now() - start));
            };
            requestAnimationFrame(tick);
          }),
      );
    await expect.poll(sampleFps, { timeout: 8000, intervals: [250] }).toBeGreaterThanOrEqual(50);

    const box = await canvas.boundingBox();
    if (!box) throw new Error("canvas has no bounding box");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.42);
    await expect(page.getByText("1 area selected.")).toBeVisible();
  });
});
