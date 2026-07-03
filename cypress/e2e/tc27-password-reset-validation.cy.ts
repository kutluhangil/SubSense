/**
 * TC27 — Şifre sıfırlama işlemi boş email ile engellenmeli
 *
 * Senaryo: "Şifremi unuttum" formunda, geçersiz veya boş email ile
 * submit butonu disabled olmalıdır.
 */
describe('TC27 — Şifre Sıfırlama Email Validasyonu', () => {
  it('Boş veya geçersiz e-posta ile sıfırlama butonu tıklanamaz olmalı', () => {
    cy.visit('/');
    cy.get('[data-testid="nav-login"]').click();

    // "Forgot password" linkine tıkla
    cy.contains(/forgot password|şifremi unuttum/i).click();

    // Modın değiştiğini doğrula
    cy.contains(/send reset link|sıfırlama bağlantısı gönder/i, { matchCase: false }).should('be.visible');

    // Başlangıçta boşken buton disabled olmalı
    cy.contains('button', /send|gönder/i).should('be.disabled');

    // Geçersiz email gir
    cy.get('input[type="email"]').clear().type('invalid-email');
    cy.contains('button', /send|gönder/i).should('be.disabled');

    // Geçerli email gir
    cy.get('input[type="email"]').clear().type('test@example.com');
    // Artık enabled olmalı
    cy.contains('button', /send|gönder/i).should('not.be.disabled');
  });
});
