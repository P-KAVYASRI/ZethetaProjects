describe("Loan Navigation", () => {

  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("loads homepage successfully", () => {
    cy.contains(/loan/i).should("exist");
  });

  it("Next button exists", () => {
    cy.contains(/next/i).should("exist");
  });

});