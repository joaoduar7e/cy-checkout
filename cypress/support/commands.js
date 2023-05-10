// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("loadCheckout", (product, qs = {}) => {
  cy.viewport(1592, 1595);
  cy.visit(`http://localhost:3000/${product}`, { qs: qs });
  cy.wait(5000);
});

Cypress.Commands.add("fillContact", (fix = {}) => {
  cy.fixture(`contact/${fix}.json`).then(({ name, email, phone, document }) => {
    cy.get("#name-field").type(name);
    cy.get("#email-field").type(email);
    cy.get("#document-field").type(document);
    cy.get(".vti__input").type(phone);
  });

  Cypress.Commands.add("selectMethod", (method) => {
    if (method === "pix") {
      cy.get(".tabs > :nth-child(3)").click();
    }

    if (method === "boleto") {
      cy.get(".tabs > :nth-child(2)").click();
    }

    if (method === "cartao") {
      cy.get(".active").click();
    }
  });
});

Cypress.Commands.add("pay", () => {
    cy.get('.px-3').click()
  });











  
Cypress.Commands.add('listenPaymentData', (fixture = null) => {
    cy.intercept('POST', '*api/payment', (req) => {
      if (fixture && !Cypress.env('DO_FULL_TEST')) {
        req.reply((res) => {
          res.send({ fixture: `response/${fixture}` });
        });
      }
    }).as('paymentRequest');
  });
  
  Cypress.Commands.add('assurePaymentData', (fixture) => {
    cy.wait('@paymentRequest').then((interception) => {
      if (Cypress.env('DO_FULL_TEST')) {
        cy.assureSale(interception.response, fixture);
      }
      cy.fixture(`request/${fixture}`).then((payRequest) => {
        if (shouldUseRealCreditCardData(payRequest)) {
          updateCreditCardData(payRequest.cards);
        }
        expect(interception.request.body).to.deep.includes(payRequest);
        expect(typeof interception.request.body.uuid).to.be.equal('string');
      });
    });
  });
  
  Cypress.Commands.add('assureSale', (response, fixture) => {
    cy.fixture(`${fixture}`).then((saleFixture) => {
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.deep.equal(saleFixture);
      response.body.forEach((sale) => {
        expect(typeof sale.sale_id).to.equal('number');
        expect(sale.success).to.be.true;
        cy.request({
          url: `https://greenn-back-5.innovaweb.com.br/api/debug/sale/${sale.sale_id}`,
          headers: {
            'api-key': '$2y$10$tQnfoeLn2v7g0KoB4W.yzuXDe87CTm3gZ2eSI0LaEew15RYxQspYe'
          }
        }).then(({ body, status }) => {
          expect(status).to.equal(200);
          expect(body.id).to.equal(sale.sale_id);
          expect(body).to.deep.include(_.omit(sale, ['sale_id', 'success']));
          expect(body.accounts.length).to.equal(sale.accounts.length);
          body.accounts.forEach((account, index) => {
            expect(account).to.deep.include(sale.accounts[index]);
          });
        });
      });
    });
  });
  
  function shouldUseRealCreditCardData(payRequest) {
    return payRequest.cards !== undefined && payRequest.cards.length && Cypress.env('DO_FULL_TEST');
  }
  
  function updateCreditCardData(cards) {
    console.log('Using real credit card data');
    cards.forEach((card) => {
      card.card_number = `5504 7087 7601 1023`;
      card.card_holder_name = `JOAO P V DUARTE`;
      let expirationMonth = `12`;
      if (expirationMonth.length < 2) {
        expirationMonth = `0${expirationMonth}`;
      }
      card.card_expiration_date = `12-30`;
      card.card_cvv = `691`;
      console.log(cards);
    });
  }
  
  