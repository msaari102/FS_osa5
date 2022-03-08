/* eslint-disable no-undef */
describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'Matti Luukkainen',
      username: 'mluukkai',
      password: 'salainen'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:3000')
  })

  it('Login form is shown', function() {
    cy.contains('username')
    cy.contains('password')
    cy.contains('login')
  })

  describe('Login',function() {
    it('succeeds with correct credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('salainen')
      cy.get('#login-button').click()

      cy.contains('logged in')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username').type('mluukkai')
      cy.get('#password').type('wrong')
      cy.get('#login-button').click()

      cy.contains('wrong credentials')
    })
  })
})

describe('when logged in', function() {
  beforeEach(function() {
    cy.login({ username: 'mluukkai', password: 'salainen' })
  })

  it('a new blog can be created', function() {
    cy.contains('new blog').click()
    cy.get('#blog_author').type('Jigoro Kano')
    cy.get('#blog_title').type('Kodokan Judo')
    cy.get('#blog_url').type('kodokan.com')
    cy.contains('save').click()

    cy.contains('Jigoro Kano')
  })

  it('blog can be liked', function() {
    cy.contains('view').click()
    cy.contains('likes 0')
    cy.contains('like').click()
    cy.contains('likes 1')
  })

  it('blog can be deleted', function() {
    cy.contains('view').click()
    cy.contains('remove').click()
    cy.contains('Jigoro Kano').should('not.exist')
  })

})

describe('multiple blogs', function() {
  beforeEach(function() {
    cy.login({ username: 'mluukkai', password: 'salainen' })
  })

  it('likes are sorted', function() {
    cy.createBlogWithLikes({ author: 'Yksi', title: 'Yksi', url: 'kodokan.com', likes: 1 })
    cy.createBlogWithLikes({ author: 'Kolme', title: 'Kolme', url: 'kodokan.com', likes: 3 })
    cy.createBlogWithLikes({ author: 'Kaksi', title: 'Kaksi', url: 'kodokan.com', likes: 2 })
    cy.visit('http://localhost:3000')
    cy.get('#blog').contains('Kolme').next().contains('Kaksi').next().contains('Yksi')
  })
})
