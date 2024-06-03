describe("Contact", () => {
  it("sould open contact form, fill it and receive confirmation", () => {
    cy.visit("/contact");
    cy.get('[data-cy="name"]').type("test");
    cy.get('[data-cy="email"]').type("test@gmail.com");
    cy.get('[data-cy="message"]').type("test from cypress");
    cy.get('[data-cy="submit"]').click();
    cy.get('[data-cy="form-confirmation').should("contain", "Merci");
  });
});
