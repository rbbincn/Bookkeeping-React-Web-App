// Critical E2E flows using Category=Other for stable filtering
describe('Bookkeeping E2E - critical flows (Category=Other)', () => {
  beforeEach(() => {
    cy.visit('/transactions', {
      onBeforeLoad(win) {
        // start clean and deterministic
        win.localStorage.removeItem('bk.transactions.v1')
        // if your app checks this flag, it will skip seeding
        win.__DISABLE_SEED__ = true
        // avoid mock API random errors
        cy.stub(win.Math, 'random').returns(0.5)
      }
    })
  })

  function addTxOther(amount) {
    // leave date as default to avoid timezone issues
    // set category to Other explicitly
    cy.get('form select').eq(1).select('Other')
    cy.get('form input[placeholder="0.00"]').clear().type(String(amount))
    cy.contains('button', 'Add').click()
    cy.contains('td', String(Number(amount).toFixed(2)), { timeout: 5000 }).should('exist')
  }

  it('adds a transaction', () => {
    addTxOther(12.34)
  })

  it('deletes a transaction', () => {
    addTxOther(9.99)
    cy.contains('tr', '9.99').within(() => cy.contains('Delete').click())
    cy.contains('td', '9.99').should('not.exist')
  })

  it('edits a transaction', () => {
    addTxOther(7.50)
    cy.contains('tr', '7.50').within(() => cy.contains('Edit').click())
    cy.get('input[placeholder="0.00"]').clear().type('8.25')
    cy.contains('button','Update').click()
    cy.contains('td', '8.25', { timeout: 5000 }).should('exist')
  })

  it('filters by category = Other', () => {
    // create two "Other" rows and one non-Other
    addTxOther(30.00)
    addTxOther(40.00)
    // add a non-Other row (Food) to ensure filter actually filters
    cy.get('form select').eq(1).select('Food')
    cy.get('form input[placeholder="0.00"]').clear().type('55')
    cy.contains('button','Add').click()
    cy.contains('td', '55.00', { timeout: 8000 }).should('exist')

    // apply category text filter (placeholder likely "e.g., Food")
    cy.get('input[placeholder="e.g., Food"]').clear().type('Other')

    // assert every visible row has Category = "Other"
    cy.get('tbody tr', { timeout: 8000 }).each(($tr) => {
      const category = $tr.find('td').eq(2).text()
      if (category !== 'No transactions') {
        expect(category).to.eq('Other')
      }
    })
    // also assert the non-Other amount is gone
    cy.contains('td', '55.00').should('not.exist')
  })
})
