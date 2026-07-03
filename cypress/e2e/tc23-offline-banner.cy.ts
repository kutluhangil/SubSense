/**
 * TC23 — Çevrimdışı banner görünürlüğü
 *
 * Senaryo: Ağ bağlantısı kesilince kırmızı "You are offline" banner
 * gösterilmeli; bağlantı geri gelince kaybolmalı.
 */
describe('TC23 — Çevrimdışı Banner', () => {
  beforeEach(() => {
    cy.loginViaUI();
    cy.get('[data-testid="dashboard"]', { timeout: 10000 }).should('be.visible');
  });

  it('Ağ kesilince offline banner görünmeli', () => {
    // Cypress'in ağ intercept'i ile tüm istekleri bloke et
    cy.intercept('**', { forceNetworkError: true }).as('networkError');

    // window.dispatchEvent ile offline event tetikle
    cy.window().then((win) => {
      win.dispatchEvent(new Event('offline'));
    });

    // Banner metnini kontrol et (EN veya TR)
    cy.contains(/offline|çevrimdışı/i, { timeout: 5000 }).should('be.visible');
  });

  it('Bağlantı geri gelince offline banner kaybolmalı', () => {
    // Önce offline yap
    cy.window().then((win) => win.dispatchEvent(new Event('offline')));
    cy.contains(/offline|çevrimdışı/i, { timeout: 5000 }).should('be.visible');

    // Sonra online yap
    cy.window().then((win) => win.dispatchEvent(new Event('online')));
    cy.contains(/offline|çevrimdışı/i, { timeout: 5000 }).should('not.exist');
  });
});
