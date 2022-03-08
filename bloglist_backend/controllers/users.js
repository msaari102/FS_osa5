const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({
      error: 'username must be unique'
    })
  }

  if (password.length >= 3){

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username: username,
      name: name,
      passwordHash,
    })

    const savedUser = await user.save()
    response.json(savedUser)
  } else {
    response.status(400).send({ error: 'password is shorter than the minimum allowed length (3)' })
  }

})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs')

  response.json(users)
  /*
  const blogs = await User.find({})
  response.json(blogs.map(blog => blog.toJSON()))
  */
})

module.exports = usersRouter