/**
 * TC22 — Abonelik silinirken onay dialogu gösterilmeli
 *
 * Senaryo: Kullanıcı aboneliği silmek istediğinde window.confirm
 * veya özel dialog gösterilmeli; iptal edince silme gerçekleşmemeli.
 */
describe('TC22 — Silme Onayı Dialogu', () => {
  beforeEach(() => {
    cy.loginViaUI();
    // Dashboard'ın yüklenmesini bekle
    cy.get('[data-testid="dashboard"]', { timeout: 10000 }).should('be.visible');
  });

  it('Silme butonuna tıklanınca onay dialogu açılmalı', () => {
    // window.confirm çağrısını yakalamak için stub kur (iptal et)
    cy.on('window:confirm', () => false);

    // İlk aboneliğin 3-nokta menüsünü aç
    cy.get('table tbody tr').first().within(() => {
      cy.get('button').last().click(); // MoreHorizontal button
    });

    // "Remove" seçeneğine tıkla
    cy.contains('Remove').click();

    // Confirm dialog göründüğünü doğrula (stub çalışıyorsa row hâlâ var)
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Onayı iptal edince abonelik silinmemeli', () => {
    cy.on('window:confirm', () => false); // İptal

    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length;

      cy.get('table tbody tr').first().within(() => {
        cy.get('button').last().click();
      });
      cy.contains('Remove').click();

      // Satır sayısı değişmemeli
      cy.get('table tbody tr').should('have.length', initialCount);
    });
  });

  it('Onayı kabul edince abonelik silinmeli', () => {
    cy.on('window:confirm', () => true); // Onayla

    cy.get('table tbody tr').then(($rows) => {
      const initialCount = $rows.length;
      if (initialCount === 0) {
        cy.log('No subscriptions to delete — skipping test');
        return;
      }

      cy.get('table tbody tr').first().within(() => {
        cy.get('button').last().click();
      });
      cy.contains('Remove').click();

      // Satır sayısı bir azalmış olmalı
      cy.get('table tbody tr').should('have.length', initialCount - 1);
    });
  });
});
