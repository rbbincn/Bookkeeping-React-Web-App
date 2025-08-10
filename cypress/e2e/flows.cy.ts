// cypress/e2e/flows.cy.ts
/// <reference types="cypress" />

// Helper: select dropdown next to a label
const selectNextToLabel = (label: string, value: string) => {
  cy.contains('label', label).parent().find('select').select(value)
}

describe('Bookkeeping E2E - critical flows (Category=Other)', () => {
  beforeEach(() => {
    cy.visit('/transactions')
  })

  it('edits a transaction', () => {
    // Narrow down rows to something stable if you like
    selectNextToLabel('Category', 'Other')       
    selectNextToLabel('Type', 'Income')          

    // Click "Edit" on the first row
    cy.get('tbody tr').first().within(() => {
      cy.contains('Edit').click()
    })

    // Form switches to "Edit Transaction"
    cy.contains('h3', 'Edit Transaction').should('be.visible')

    // Change amount and save (button text is "Save", not "Update")
    cy.get('input[placeholder="0.00"]').clear().type('123.45')
    cy.contains('button', /^Save$/).click()

    // Assert the first row reflects new amount
    cy.get('tbody tr').first().within(() => {
      cy.contains('123.45')                      // sign depends on Type; we filtered to Income above
    })
  })

  it('filters by category = Other', () => {
    // Category is a <select> in UnifiedFilter
    selectNextToLabel('Category', 'Other')       // 

    // Optional: clear Type to All
    selectNextToLabel('Type', 'All')

    cy.get('tbody tr').should('have.length.greaterThan', 0)
    // Spot check that the visible rows include category "Other"
    cy.get('tbody tr').first().within(() => {
      cy.contains('Other')
    })
  })
})
