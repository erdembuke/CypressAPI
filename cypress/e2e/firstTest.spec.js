describe('Test with backend', () => {

  beforeEach('login to application', () => {
    cy.loginToApplication()
  })

  it('first', () => {
    cy.log('Yaaaay we logged in!')
  })


})