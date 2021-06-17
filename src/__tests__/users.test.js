import { build } from '../app.js'
import { authenticateUser } from '../utils/testUtil'

// Nous commencons un block de test grâce à describe :)
describe('A user', () => {
  // Création d'une variable qui contiendra notre application
  let app

  // Nous utilisons une fonction de "hook" qui s'éxécutéra afin
  // tout nos tests
  beforeAll(async () => {
    // Nous créons l'application en spécifiant "false" pour ne pas
    // avoir le log dans la console !
    app = await build(false)
  })

  // Nous utilisons une fonction de "hook" quie s'éxécutera à la fin
  // de tout nos tests
  afterAll(async () => {
    // Nous fermons la connection à la base de données
    app.db.topology.close()
    // Nous fermons le server HTTP de fastify
    await app.close()
  })

  it('can be created with POST /users', async () => {
    // Exécution d'une requête HTTP sur `/users`
    const response = await app.inject({
      // La méthode HTTP
      method: 'POST',
      // La route
      url: '/users',
      // Le body de la request
      payload: {
        email: 'test@mail.com',
        password: 'test',
        firstname: 'test',
        lastname: 'test',
      },
    })

    // Nous nous assurtons de recevoir le bon statusCode
    expect(response.statusCode).toBe(201)

    // Nous récupérons les données de la réponse en JSON
    const data = await response.json()

    // Nous nous assurons d'avoir les bonnes données
    expect(data).toMatchObject({
      _id: expect.any(String),
      email: 'test@mail.com',
      password: expect.any(String),
      firstname: 'test',
      lastname: 'test',
    })
  })

  it('can be authenticated with POST /authenticate', async () => {
    const token = await authenticateUser({
      email: 'test.auth1@mail.com',
      password: 'test.auth',
      app,
    })

    expect(token).toBeDefined()
  })

  it('lists users using GET /users', async () => {
    const token = await authenticateUser({
      email: 'test.user.list@mail.com',
      password: 'test.user.list',
      app,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    const users = await response.json()

    expect(response.statusCode).toBe(200)

    expect(users.length).not.toBe(0)
    expect(Object.keys(users[0])).toContain('email')
  })
})
