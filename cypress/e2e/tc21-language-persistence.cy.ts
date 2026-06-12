/**
 * TC21 — Giriş öncesi seçilen Türkçe dil tercihi giriş sonrası korunmalı
 *
 * Senaryo: Kullanıcı giriş yapmadan önce dili Türkçe seçer,
 * ardından giriş yapar. Giriş sonrası UI Türkçe olmalıdır.
 */
describe('TC21 — Dil Tercihi Giriş Sonrası Korunmalı', () => {
  it('Giriş öncesi Türkçe seçilince giriş sonrası UI Türkçe olmalı', () => {
    cy.visit('/');

    // Landing page'de Türkçe'yi seç (dil seçici footer veya navbar'da)
    cy.contains('Language', { matchCase: false }).then(($el) => {
      if ($el.length) {
        cy.wrap($el).click();
        cy.contains('Türkçe').click();
      }
    });

    // Türkçe'nin localStorage'a yazıldığını doğrula
    cy.window().then((win) => {
      const lang = win.localStorage.getItem('userLanguagePreference');
      expect(lang).to.equal('tr');
    });

    // Giriş yap
    cy.get('[data-testid="nav-login"]').click();
    cy.get('[data-testid="auth-email"]').type(Cypress.env('TEST_EMAIL'));
    cy.get('[data-testid="auth-password"]').type(Cypress.env('TEST_PASSWORD'));
    cy.get('[data-testid="auth-submit"]').click();

    // Giriş sonrası dashboard'da Türkçe metin gösterilmeli
    cy.contains(/abonelik|harcama|toplam|hoş/i, { timeout: 10000 }).should('be.visible');

    // localStorage'da dil hâlâ Türkçe olmalı
    cy.window().then((win) => {
      const lang = win.localStorage.getItem('userLanguagePreference');
      expect(lang).to.equal('tr');
    });
  });

  it('Giriş sonrası dil tercihi sayfa yenilemesinde de korunmalı', () => {
    // Oturumu başlat ve dili Türkçe yap
    cy.window().then((win) => {
      win.localStorage.setItem('userLanguagePreference', 'tr');
    });

    cy.loginViaUI();

    // Sayfayı yenile
    cy.reload();

    // Hâlâ Türkçe olmalı
    cy.contains(/abonelik|harcama|toplam/i, { timeout: 8000 }).should('be.visible');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('userLanguagePreference')).to.equal('tr');
    });
  });
});
