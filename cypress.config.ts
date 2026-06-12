import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Adjust baseUrl to match your environment:
    // - Local dev:       http://localhost:5173
    // - Docker/staging:  https://yourdomain.com/subsense
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    // Give Firebase + network operations enough time
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    env: {
      // Fill these in before running: npx cypress open
      TEST_EMAIL: "qa-test@subsense.test",
      TEST_PASSWORD: "testPassword123!",
    },
  },
});
