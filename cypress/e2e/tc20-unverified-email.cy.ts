/**
 * TC20 — Doğrulanmamış e-posta ile giriş → VerifyEmailPage gösterilmeli
 *
 * Ön koşul:
 *   TEST_EMAIL_UNVERIFIED env değişkenine e-postası doğrulanmamış
 *   bir hesabın bilgileri girilmiş olmalıdır.
 *   Cypress env'i: cypress.config.ts içinde TEST_EMAIL_UNVERIFIED / TEST_PASSWORD_UNVERIFIED
 */
describe('TC20 — Doğrulanmamış E-posta Akışı', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Doğrulanmamış hesapla giriş yapınca VerifyEmailPage ekranı açılmalı', () => {
    const email = Cypress.env('TEST_EMAIL_UNVERIFIED') || 'unverified@test.com';
    const password = Cypress.env('TEST_PASSWORD_UNVERIFIED') || Cypress.env('TEST_PASSWORD');

    // Login modal aç
    cy.get('[data-testid="nav-login"]').click();

    // Kimlik bilgilerini doldur
    cy.get('[data-testid="auth-email"]').type(email);
    cy.get('[data-testid="auth-password"]').type(password);
    cy.get('[data-testid="auth-submit"]').click();

    // VerifyEmailPage gösterilmeli — dashboard gösterilmemeli
    cy.contains('Verify your email', { timeout: 8000 }).should('be.visible');
    cy.contains('verify your email', { matchCase: false }).should('be.visible');

    // Dashboard'a erişim engellenmiş olmalı
    cy.get('[data-testid="dashboard"]').should('not.exist');
  });

  it('"Resend verification email" butonuna tıklanınca başarı bildirimi gösterilmeli', () => {
    const email = Cypress.env('TEST_EMAIL_UNVERIFIED') || 'unverified@test.com';
    const password = Cypress.env('TEST_PASSWORD_UNVERIFIED') || Cypress.env('TEST_PASSWORD');

    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="auth-email"]').type(email);
    cy.get('[data-testid="auth-password"]').type(password);
    cy.get('[data-testid="auth-submit"]').click();

    // Resend butonunu bul ve tıkla
    cy.contains('Resend', { matchCase: false, timeout: 8000 }).click();

    // Toast veya success mesajı çıkmalı
    cy.contains(/sent|gönderildi/i, { timeout: 5000 }).should('be.visible');
  });
});
