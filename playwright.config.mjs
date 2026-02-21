import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "tests/smoke",
    timeout: 30000,
    expect: {
        timeout: 10000
    },
    retries: process.env.CI ? 1 : 0,
    use: {
        baseURL: "http://127.0.0.1:4173",
        trace: "retain-on-failure"
    },
    webServer: {
        command: "npx http-server public -p 4173 -c-1 --silent",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 120000
    }
});
