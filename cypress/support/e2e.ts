// cypress/support/e2e.ts
// Global support file — runs before every spec

// Silence known uncaught Firebase errors that don't affect test validity
Cypress.on('uncaught:exception', (err) => {
  // Firebase persistence and messaging errors are non-fatal in tests
  if (
    err.message.includes('Firebase') ||
    err.message.includes('firestore') ||
    err.message.includes('ResizeObserver')
  ) {
    return false; // prevent test failure
  }
  return true;
});

// Helper: wait for the app's auth gate to settle
Cypress.Commands.add('waitForAuthGate', () => {
  cy.get('[data-testid="page-loader"]', { timeout: 8000 }).should('not.exist');
});

// Helper: log in via UI (used by tests that need an authenticated session)
Cypress.Commands.add('loginViaUI', (email?: string, password?: string) => {
  const e = email || Cypress.env('TEST_EMAIL');
  const p = password || Cypress.env('TEST_PASSWORD');

  cy.visit('/');
  cy.get('[data-testid="nav-login"]').click();
  cy.get('[data-testid="auth-email"]').type(e);
  cy.get('[data-testid="auth-password"]').type(p);
  cy.get('[data-testid="auth-submit"]').click();
  cy.url({ timeout: 10000 }).should('not.include', 'login');
});

declare global {
  namespace Cypress {
    interface Chainable {
      waitForAuthGate(): Chainable<void>;
      loginViaUI(email?: string, password?: string): Chainable<void>;
    }
  }
}
