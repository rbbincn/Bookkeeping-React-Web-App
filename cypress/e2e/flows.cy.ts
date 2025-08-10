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

it('adds a transaction and sees it on top (sorted desc)', () => {
  // Make sure the new row will be visible after adding
  cy.contains('label','Type').parent().find('select').select('Income');
  cy.contains('label','Category').parent().find('select').select('Other');

  // Fill form inside "Add Transaction" card
  cy.contains('h3','Add Transaction').parents('.card').within(() => {
    // 1) set a date newer than any seeded row (so it becomes first)
    // works with our custom DatePicker input (placeholder="YYYY-MM-DD")
    cy.get('input[placeholder="YYYY-MM-DD"]').clear().type('2025-09-30');

    // 2) align form fields with current filter so it remains visible
    cy.contains('label','Type').next('select').select('Income');
    cy.contains('label','Category').next('select').select('Other');

    cy.get('input[placeholder="0.00"]').clear().type('55');
    cy.contains('button', /^Add$/).click();
  });

  // Assert newest row is the one we just added
  cy.get('tbody tr', { timeout: 8000 }).first().within(() => {
    cy.contains('2025-08-31');
    cy.contains('Other');
    cy.contains('55.00'); // sign handled by UI (+/-)
  });
});

