describe("Loan KYC", () => {

  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("KYC section exists", () => {
    cy.contains(/kyc/i).should("exist");
  });

  it("PAN field exists", () => {
    cy.get('input').should("exist");
  });

});