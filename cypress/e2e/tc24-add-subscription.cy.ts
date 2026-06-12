/**
 * TC24 — Yeni abonelik listeye eklenmeli ve görünmeli
 *
 * Senaryo: Kullanıcı yeni bir abonelik ekler. Optimistic UI sayesinde
 * anında, Firebase yanıtıyla da kalıcı olarak listede görülmelidir.
 */
describe('TC24 — Yeni Abonelik Ekleme', () => {
  beforeEach(() => {
    cy.loginViaUI();
    cy.get('[data-testid="dashboard"]', { timeout: 10000 }).should('be.visible');
  });

  it('Geçerli bilgilerle eklenen abonelik listede görünmeli', () => {
    const testSubName = `Cypress Test Sub ${Date.now()}`;

    // Başlangıçtaki satır sayısını al
    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length;

      // Add butonuna tıkla (Dashboard'daki "+" butonu veya Add Subscription butonu)
      // Bu seçicinin uygulamanın mevcut haline uyarlanması gerekebilir
      cy.contains('Add Subscription', { matchCase: false }).click();

      // Form alanlarını doldur
      cy.get('input[placeholder*="Name" i]').type(testSubName);
      cy.get('input[placeholder*="Price" i]').type('15.99');
      // Gerekirse diğer alanları da doldur

      // Kaydet
      cy.contains('Save', { matchCase: false }).click();

      // Modalın kapanmasını bekle
      cy.contains('Save').should('not.exist');

      // Satır sayısının 1 arttığını ve yeni aboneliğin eklendiğini doğrula
      cy.get('table tbody tr').should('have.length', initialCount + 1);
      cy.contains(testSubName).should('be.visible');
    });
  });
});
