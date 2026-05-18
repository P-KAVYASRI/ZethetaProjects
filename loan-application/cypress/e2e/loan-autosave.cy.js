describe("Loan Auto Save", () => {

  beforeEach(() => {
    cy.visit("http://localhost:5173");
  });

  it("localStorage works", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("test", "saved");
      expect(win.localStorage.getItem("test")).to.equal("saved");
    });
  });

});