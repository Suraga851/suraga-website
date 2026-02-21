import { expect, test } from "@playwright/test";

test("home page renders key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Learning Assistant/i);
    await expect(page.locator("#home")).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#services")).toBeVisible();
    await expect(page.locator("#experience")).toBeVisible();
    await expect(page.locator("#portfolio")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
});

test("language switch opens Arabic page with RTL direction", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Arabic" }).click();
    await expect(page).toHaveURL(/\/ar\.html$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("mobile menu opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const menuButton = page.locator("#mobile-menu-btn");
    const closeButton = page.locator("#close-mobile-menu");
    const dialog = page.locator("#mobile-menu");

    await menuButton.click();
    await expect(dialog).toHaveAttribute("aria-hidden", "false");
    await closeButton.click();
    await expect(dialog).toHaveAttribute("aria-hidden", "true");
});

test("portfolio modal opens and closes", async ({ page }) => {
    await page.goto("/");
    const firstPortfolio = page.locator(".portfolio-item").first();
    await firstPortfolio.click();

    const modal = page.locator("#pdf-modal");
    const viewer = page.locator("#pdf-viewer");
    await expect(modal).toHaveAttribute("aria-hidden", "false");
    await expect(viewer).toHaveAttribute("src", /assets\/docs\/.+\.pdf/);

    await page.locator("#close-modal").click();
    await expect(modal).toHaveAttribute("aria-hidden", "true");
});

test("contact form submits with success message", async ({ page }) => {
    await page.route("https://formsubmit.co/**", async (route) => {
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: "true" })
        });
    });

    await page.goto("/");
    await page.fill("#name", "Test Candidate");
    await page.fill("#email", "test@example.com");
    await page.selectOption("#inquiry-type", "job");
    await page.fill("#message", "Hello from smoke test.");
    await page.getByRole("button", { name: /Send Message/i }).click();
    await expect(page.locator("#form-status")).toContainText("Thank you!");
});
