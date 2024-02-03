/// <reference types="cypress" />

describe('Test with backend', () => {

  beforeEach('login to application', () => {
    cy.intercept({method: 'GET', path: 'tags'}, {fixture: 'tags.json'})
    cy.loginToApplication()
  })

  it('verify correct request and response', () => {

    // 1. define the intercept before the call
    cy.intercept('POST', 'https://conduit-api.bondaracademy.com/api/articles/').as('postArticles') // we need to use intercept method before the steps.

    // 2. perform the api call
    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('This is the title')
    cy.get('[formcontrolname="description"]').type('This is a description')
    cy.get('[formcontrolname="body"]').type('This is a body of the article')
    cy.contains('Publish Article').click()

    // 3. validation
    cy.wait('@postArticles').then( xhr => {
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal('This is a body of the article')
      expect(xhr.response.body.article.description).to.equal('This is a description')
    })
  })

  it.only('intercepting and modifying the request and response', () => {

    // 1. define the intercept before the call
    cy.intercept('POST', 'https://conduit-api.bondaracademy.com/api/articles/', (req) => {
      req.body.article.description = "This is a description 2" // we will write This is a description on browser but it will intercept and modify it, will ad "2" to the end
    }).as('postArticles') // we need to use intercept method before the steps.

    // 2. perform the api call
    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('This is the title')
    cy.get('[formcontrolname="description"]').type('This is a description')
    cy.get('[formcontrolname="body"]').type('This is a body of the article')
    cy.contains('Publish Article').click()

    // 3. validation
    cy.wait('@postArticles').then( xhr => {
      console.log(xhr)
      expect(xhr.response.statusCode).to.equal(201)
      expect(xhr.request.body.article.body).to.equal('This is a body of the article')
      expect(xhr.response.body.article.description).to.equal('This is a description 2') // modified data expected
    })
  })

  // mocking api calls
  it('verify populer tags are displayed', () => {
    // we create new file in fixtures folder as mock datas, added cy.intercept() into beforeEach method.
    cy.log('we logged in')
    cy.get('.tag-list')
    .should('contain', 'cypress')
    .and('contain', 'automation')
    .and('contain', 'testing')

  })

  it('verify global feed likes count', () => {
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/articles/feed*', {"articles":[],"articlesCount":0})
    cy.intercept('GET', 'https://conduit-api.bondaracademy.com/api/articles*', {fixture: 'articles.json'})

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then(heartList => {
      expect(heartList[0]).to.contain('1') // 1 favorites
      expect(heartList[1]).to.contain('5') // 2 favorites
    })

    // reading fixture files in cypress
    cy.fixture('articles').then(file => {
      const articleLink = file.articles[1].slug
      file.articles[1].favoritesCount = 6 // ?? Note: didn't understand exactly
      cy.intercept('POST', 'https://conduit-api.bondaracademy.com/api/articles/' + articleLink + '/favorite', file)
    })

    // validation
    cy.get('app-article-list button').eq(1).click().should('contain', '6')

  })

  


})