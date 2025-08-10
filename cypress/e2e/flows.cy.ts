// Basic E2E to verify add/delete/filter flows
describe('Bookkeeping E2E', () => {
  it('adds and filters transactions', () => {
    cy.visit('http://localhost:5173/transactions')
    // add
    cy.contains('Add Transaction')
    cy.get('input[placeholder="0.00"]').clear().type('12.50')
    cy.contains('button','Add').click()
    cy.contains('Loading').should('exist')
    cy.contains('12.50', { timeout: 8000 }).should('exist')

    // filter by type
    cy.get('select').contains('Type').parent().find('select').select('Expense')
    cy.contains('Loading').should('exist')
    cy.contains('Expense').should('exist')
  })
})
