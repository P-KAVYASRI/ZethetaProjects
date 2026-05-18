describe("Loan Upload", () => {

  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("Page loads successfully", () => {
    cy.contains(/loan/i).should("exist");
  });

});