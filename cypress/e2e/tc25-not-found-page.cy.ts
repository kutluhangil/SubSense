/**
 * TC25 — Yanlış URL'de 404 sayfası gösterilmeli
 *
 * Senaryo: Tanımsız bir route'a gidildiğinde App.tsx'teki
 * catch-all route devreye girip 404 UI göstermelidir.
 */
describe('TC25 — 404 Sayfası', () => {
  it('Geçersiz bir URL girildiğinde 404 sayfası dönmeli', () => {
    // Rastgele geçersiz bir route
    cy.visit('/invalid-route-12345', { failOnStatusCode: false });

    // 404 mesajının göründüğünü doğrula
    cy.contains(/404|Page not found|Sayfa bulunamadı/i, { timeout: 5000 }).should('be.visible');

    // Dashboard veya Landing page ana içeriği olmamalı
    cy.get('[data-testid="dashboard"]').should('not.exist');
  });
});
