const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  } 
]

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()

  const user2 = new User({ username: 'root2', passwordHash })
  await user2.save()

  await Blog.deleteMany({})

  const blogObjects = initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog =>  blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are six blogs', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(6)
})

test('id field is id', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body[0].id).toBeDefined()
})

test('POST increases blogs by one', async () => {
  const auth = await api.post('/api/login')
    .send({username: 'root', password: 'sekret'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs').expect(200)
  const initLength = response.body.length

  const newBlog = {
    title: 'Type wars2',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 3,
    user: auth.id
  }

  await api
    .post('/api/blogs')
    .set('Authorization', 'bearer ' + auth.body.token)
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const responseEnd = await api.get('/api/blogs')
  expect(responseEnd.body).toHaveLength(initLength+1)
})

test('POST without token does not increase blogs by one', async () => {
  const auth = await api.post('/api/login')
    .send({username: 'root', password: 'sekret'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs').expect(200)
  const initLength = response.body.length

  const newBlog = {
    title: 'Type wars2',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 3,
    user: auth.id
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const responseEnd = await api.get('/api/blogs')
  expect(responseEnd.body).toHaveLength(initLength)
})

test('default value for like is 0', async () => {
  const usersAtStart = await helper.usersInDb()
  await Blog.deleteMany({})
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    user: usersAtStart[0].id
  }

  const auth = await api.post('/api/login')
    .send({username: 'root', password: 'sekret'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Authorization', 'bearer ' + auth.body.token)
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const responseEnd = await api.get('/api/blogs')
  expect(responseEnd.body[0].likes).toEqual(0)
})

test('title is required', async () => {
  const usersAtStart = await helper.usersInDb()
  await Blog.deleteMany({})
  const newBlog = {
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    user: usersAtStart[0].id
  }

  const auth = await api.post('/api/login')
    .send({username: 'root', password: 'sekret'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', 'bearer ' + auth.body.token)
    .expect(400)

})

test('url is required', async () => {
  const usersAtStart = await helper.usersInDb()
  await Blog.deleteMany({})
  const newBlog = {
    author: 'Robert C. Martin',
    title: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    user: usersAtStart[0].id
  }

  const auth = await api.post('/api/login')
    .send({username: 'root', password: 'sekret'})
    .expect(200)
    .expect('Content-Type', /application\/json/)

  await api
    .post('/api/blogs')
    .set('Content-type', 'application/json')
    .set('Authorization', 'bearer ' + auth.body.token)
    .send(newBlog)
    .expect(400)
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const auth = await api.post('/api/login')
      .send({username: 'root', password: 'sekret'})
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const responseInit = await api.get('/api/blogs')  

    const newBlog = {
      title: 'Type wars2',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 3,
      user: auth.id
    }
    
    const blogToDelete = await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + auth.body.token)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/) 

    await api
      .delete(`/api/blogs/${blogToDelete.body.id}`)
      .set('Authorization', 'bearer ' + auth.body.token)
      .expect(204)

    const responseEnd = await api.get('/api/blogs')

    expect(responseEnd.body).toHaveLength(
      responseInit.body.length
    )

    const contents = responseEnd.body.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.body.title)
  })
})

describe('modifying a blog', () => {
  test('succeeds with status code 200 and likes is updated', async () => {
    const auth = await api.post('/api/login')
      .send({username: 'root', password: 'sekret'})
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const responseInit = await api.get('/api/blogs').set('Authorization', 'bearer ' + auth.body.token)
    const blogToModify = responseInit.body[0]

    await api
      .put(`/api/blogs/${blogToModify.id}`)
      .set('Authorization', 'bearer ' + auth.body.token)
      .send({
        likes: 10
      })
      .expect(200)

    const result = await api
      .get(`/api/blogs/${blogToModify.id}`)
      .set('Authorization', 'bearer ' + auth.body.token)
      .expect(200)

    expect(result.body.likes).toEqual(10)
  })
})

afterAll(() => {
  mongoose.connection.close()
})