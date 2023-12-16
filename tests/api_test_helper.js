const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'A good blog',
    author: 'A good fellow',
    url: 'good.org',
    likes: 1000
  },
  {
    title: 'A bad blog',
    author: 'A bad person',
    url: 'bad.org',
    likes: 0
  }
]

const initialUsers = [
  {
    username: 'Person',
    name: 'Name',
    password: '1234'
  },
  {
    username: 'Another',
    name: 'Name',
    password: '4321'
  }
]

const blogsInDb = async () => {
  const notes = await Blog.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, blogsInDb, initialUsers, usersInDb
}