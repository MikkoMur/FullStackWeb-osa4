const Blog = require('../models/blog')

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

const blogsInDb = async () => {
  const notes = await Blog.find({})
  return notes.map(note => note.toJSON())
}

module.exports = {
  initialBlogs, blogsInDb
}