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

// const nonExistingId = async () => {
//   const note = new Note({ content: 'willremovethissoon' })
//   await note.save()
//   await note.remove()

//   return note._id.toString()
// }

// const notesInDb = async () => {
//   const notes = await Note.find({})
//   return notes.map(note => note.toJSON())
// }

module.exports = {
  initialBlogs, blogsInDb //, nonExistingId, notesInDb
}