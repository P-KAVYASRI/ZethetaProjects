describe("Loan Submit", () => {

  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("Application page loads", () => {
    cy.contains(/loan application/i).should("exist");
  });

});