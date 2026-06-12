/**
 * TC26 — Çift tıklama koruması (Double-delete guard)
 *
 * Senaryo: Kullanıcı silme butonuna çok hızlı çift tıklasa bile
 * isDeletingRef guard sayesinde tek bir istek gitmeli.
 */
describe('TC26 — Hızlı Tıklama Koruması', () => {
  beforeEach(() => {
    cy.loginViaUI();
    cy.get('[data-testid="dashboard"]', { timeout: 10000 }).should('be.visible');
  });

  it('Silme butonuna çift tıklandığında sadece bir işlem gerçekleşmeli', () => {
    cy.on('window:confirm', () => true);

    // Backend çağrısını yakalamak için spy veya intercept kullan
    cy.intercept('DELETE', '**/subscriptions/*').as('deleteRequest');

    cy.get('table tbody tr').then(($rows) => {
      if ($rows.length === 0) {
        cy.log('No subscriptions to delete — skipping test');
        return;
      }

      cy.get('table tbody tr').first().within(() => {
        cy.get('button').last().click();
      });

      // Remove butonuna hızlıca çift tıkla
      cy.contains('Remove').dblclick();

      // Sadece 1 istek gittiğini doğrula
      // wait, ilk isteğin tamamlanmasını bekler, ardından alias count kontrol edilebilir
      cy.wait('@deleteRequest').then(() => {
        cy.get('@deleteRequest.all').should('have.length', 1);
      });
    });
  });
});
