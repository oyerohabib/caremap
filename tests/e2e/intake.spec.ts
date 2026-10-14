import { expect, test, type Page } from "@playwright/test";

async function describeRegion(page: Page, label: string, severityKey?: "End" | "Home") {
  await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
  const form = page.getByRole("form", { name: `Details for ${label}` });
  await expect(form).toBeVisible();
  if (severityKey) {
    await form.getByRole("slider", { name: `Severity for ${label}` }).focus();
    await page.keyboard.press(severityKey);
  }
  await form.getByRole("button", { name: `Save ${label.toLowerCase()}` }).click();
  await expect(form).toBeHidden();
}

test("patient completes an intake with the accessible region list, provider reviews it", async ({
  page,
}) => {
  await page.goto("/t/lumen/intake");
  await expect(page.getByText("Demo: do not enter real health information.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where do you feel it?" })).toBeVisible();

  const chest = page.getByRole("button", { name: "Chest", exact: true });
  await chest.click();
  await expect(chest).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Lower back", exact: true }).click();
  await expect(page.getByText("2 areas selected.")).toBeVisible();

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Tell us about each area" })).toBeVisible();
  await expect(page.getByRole("button", { name: "2 left to describe" })).toBeDisabled();

  await describeRegion(page, "Chest", "End");
  await describeRegion(page, "Lower back");

  await page.getByRole("button", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: "Check and send" })).toBeVisible();
  await expect(page.getByText("chest-high-severity")).toBeVisible();

  await page.getByRole("button", { name: "Send to care team" }).click();
  await expect(page.getByRole("heading", { name: "Sent to your care team" })).toBeVisible();
  const reference = (await page.getByText(/^Reference/).innerText()).replace("Reference", "").trim();
  expect(reference).toMatch(/^[0-9A-F]{8}$/);

  await page.getByRole("link", { name: "See provider view" }).click();
  await expect(page.getByRole("heading", { name: `Intake #${reference}` })).toBeVisible();
  await expect(page.getByText("Needs review", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: /10\/10/ })).toBeVisible();

  await page.getByRole("button", { name: "Mark reviewed" }).click();
  await expect(page.getByRole("button", { name: /Reviewed/ })).toBeDisabled();
  await expect(page.getByText("marked reviewed")).toBeVisible();
});

test("provider inbox lists open intakes first", async ({ page }) => {
  await page.goto("/t/northwind/provider");
  await expect(page.getByRole("heading", { name: "Intake inbox" })).toBeVisible();
  const open = page.getByRole("region", { name: /Needs review/ });
  await expect(open.getByRole("link").first()).toBeVisible();
  await expect(page.getByRole("region", { name: /Reviewed/ })).toBeVisible();
});

test("unknown tenant 404s", async ({ page }) => {
  const res = await page.goto("/t/does-not-exist/intake");
  expect(res?.status()).toBe(404);
});
