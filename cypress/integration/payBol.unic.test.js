describe("template spec", () => {
  it("Load Checkout", () => {
    cy.loadCheckout(673);

    cy.fillContact("contact");
  });

  it("Select Method", () => {
    cy.selectMethod("boleto");
  });

  it("Payment", () => {
    cy.pay()
  });
});
