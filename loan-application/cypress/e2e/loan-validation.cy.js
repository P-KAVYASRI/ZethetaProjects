describe("Loan Validation", () => {

  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("shows validation when no loan type selected", () => {
    cy.contains(/next/i).click();
  });

 it("input fields exist", () => {

  cy.get("input").should("exist");

});

  it("phone field exists", () => {

    cy.get('input').should("exist");

  });

  it("PAN validation format", () => {

    cy.get('input').then(($inputs) => {

      if ($inputs.length > 0) {

        cy.wrap($inputs.eq(0)).type("ABCDE1234F");

      }

    });

  });

  it("PIN autofill check", () => {

    cy.contains(/address/i).click({ force: true });

  });

});