describe('R8 - Todo System Tests (Stable Version)', () => {

  let userId

  const email = "mon.doe@gmail.com"

  before(() => {

    // reset DB state
    cy.request('POST', 'http://localhost:5000/populate')

    // create user
    cy.fixture('user.json').then((user) => {

      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((res) => {

        userId = res.body._id.$oid

        // create task linked to user
        cy.fixture('task.json').then((task) => {

          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/tasks/create',
            form: true,
            body: {
              ...task,
              userid: userId
            }
          }).then(() => {

            cy.log('Test data created successfully')

          })

        })

      })

    })

  })

  beforeEach(() => {

    cy.visit('http://localhost:3000')

    // login
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .should('be.visible')
      .clear()
      .type(email)

    cy.get('form').submit()

    // wait until tasks load
    // cy.get('.container-element')
    //   .should('have.length.at.least', 1)

  })

  it('R8UC1 - create todo item', () => {

    // open first task popup
    cy.get('.container-element a')
      .first()
      .click({ force: true })

    // popup opened
    cy.get('.popup-inner')
      .should('be.visible')

    // add todo
    cy.get('input[placeholder="Add a new todo item"]')
      .scrollIntoView()
      .type('Learn Cypress', { force: true })

    // click add
    cy.contains('Add')
      .click({ force: true })

    cy.contains('Add')
      .click({ force: true })

    // verify todo added
    cy.contains('.todo-item', 'Learn Cypress')
      .should('exist')

  })
  it('R8UC1 - Add button should be disabled when input is empty', () => {

    cy.get('.container-element a')
      .first()
      .click({ force: true })

    cy.get('.popup-inner')
      .should('be.visible')

    cy.get('input[placeholder="Add a new todo item"]')
      .should('have.value', '')

    cy.contains('Add')
      .should('be.disabled')
  })

  it('R8UC2 - toggle todo item', () => {

    // Preconditions: open task detail view
    cy.get('.container-element a')
      .first()
      .click({ force: true })

    cy.get('.popup-inner')
      .should('be.visible')

    cy.get('.todo-item')
      .should('contain.text', 'Learn Cypress')

    // click icon in front of description
    cy.contains('.todo-item', 'Learn Cypress')
      .within(() => {
        cy.get('.checker')
          .click({ force: true })
      })

    // if active change to done
    cy.contains('.todo-item', 'Learn Cypress')
      .within(() => {
        cy.get('.checker')
          .should('have.class', 'checked')
      })

    // alt. if done change to active
    cy.contains('.todo-item', 'Learn Cypress')
      .within(() => {
        cy.get('.checker')
          .click({ force: true })
      })

    // recheck transition status
    cy.contains('.todo-item', 'Learn Cypress')
      .within(() => {
        cy.get('.checker')
          .should('not.have.class', 'checked')
      })
  })

  it('R8UC3 - delete todo item', () => {

    // open task detail view
    cy.get('.container-element a')
      .first()
      .click({ force: true })

    cy.get('.popup-inner')
      .should('be.visible')
      .then($el => {
        $el[0].scrollIntoView({ block: 'center' })
      })

    // ensure task exists
    cy.contains('.todo-item', 'Learn Cypress')
      .should('exist')

    // click delete
    cy.contains('.todo-item', 'Learn Cypress')
      .within(() => {

        cy.get('.remover')
          .click({ force: true })
      })

    // Check if task was deleted
    cy.contains('.todo-item', 'Learn Cypress')
      .should('not.exist')
  })

  after(() => {

    if (userId) {

      cy.request(
        'DELETE',
        `http://localhost:5000/users/${userId}`
      )

    }

  })

})