interface User {
  email: string
  password: string
  firstName: string
}

Cypress.Commands.add('login', (name: string) => {
  cy.visit('/login')
  cy.fixture('users.json').then((users: User[]) => {
    const user = users.find((user) => user.firstName === name)
    if (!user) throw new Error(`User with name ${name} not found in fixture.`)

    cy.get('.email-input').type(user.email)
    cy.get('.password-input').type(user.password)
    cy.get('.login-button').click()
  })
})
