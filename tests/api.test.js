const supertest = require('supertest')
const mongoose = require('mongoose')

const helper = require('./api_test_helper')
const app = require('../app')
const api = supertest(app)

// const Note = require('../models/note')
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  await Blog.insertMany(helper.initialBlogs)
})

test('Blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('Blogs contain an "id" field', async () => {
  const blogs = await helper.blogsInDb()
  expect(blogs[0]['id']).toBeDefined()
})

test('a blog can be added', async () => {
  const newBlog = {
    title: 'A blog',
    author: 'A blogger',
    url: 'blog.org',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const lastBlog = blogsAtEnd[helper.initialBlogs.length]

  const title = lastBlog.title
  const author = lastBlog.author
  const url = lastBlog.url
  const likes = lastBlog.likes
  
  expect(title).toEqual(
    'A blog'
  )
  expect(author).toEqual(
    'A blogger'
  )
  expect(url).toEqual(
    'blog.org'
  )
  expect(likes).toEqual(
    3
  )
})

test('if new blog is missing "likes" value, likes will be 0', async () => {
  const newBlog = {
    title: 'A blog',
    author: 'A blogger',
    url: 'blog.org',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  const lastBlog = blogsAtEnd[helper.initialBlogs.length]
  const likes = lastBlog.likes
  expect(likes).toEqual(
    0
  )
})

test('if a new blog is missing a title, return bad request status 400', async () => {
  const newBlog = {
    author: 'A blogger',
    url: 'blog.org',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('if a new blog is missing a url, return bad request status 400', async () => {
  const newBlog = {
    title: 'A blog',
    author: 'A blogger',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})


// test('notes are returned as json', async () => {
//   await api
//     .get('/api/notes')
//     .expect(200)
//     .expect('Content-Type', /application\/json/)
// })

// test('all notes are returned', async () => {
//   const response = await api.get('/api/notes')


//   expect(response.body).toHaveLength(helper.initialNotes.length)
// })

// test('a specific note is within the returned notes', async () => {
//   const response = await api.get('/api/notes')

//   const contents = response.body.map(r => r.content)
//   expect(contents).toContain(
//     'Browser can execute only JavaScript'
//   )
// })

// test('a valid note can be added ', async () => {
//   const newNote = {
//     content: 'async/await simplifies making async calls',
//     important: true,
//   }

//   await api
//     .post('/api/notes')
//     .send(newNote)
//     .expect(201)
//     .expect('Content-Type', /application\/json/)



//   const notesAtEnd = await helper.notesInDb()
//   expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)


//   const contents = notesAtEnd.map(n => n.content)
//   expect(contents).toContain(
//     'async/await simplifies making async calls'
//   )
// })

// test('note without content is not added', async () => {
//   const newNote = {
//     important: true
//   }

//   await api
//     .post('/api/notes')
//     .send(newNote)
//     .expect(400)


//   const notesAtEnd = await helper.notesInDb()


//   expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
// })

// test('a specific note can be viewed', async () => {
//   const notesAtStart = await helper.notesInDb()

//   const noteToView = notesAtStart[0]


//   const resultNote = await api
//     .get(`/api/notes/${noteToView.id}`)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)

//   expect(resultNote.body).toEqual(noteToView)
// })

// test('a note can be deleted', async () => {
//   const notesAtStart = await helper.notesInDb()
//   const noteToDelete = notesAtStart[0]


//   await api
//     .delete(`/api/notes/${noteToDelete.id}`)
//     .expect(204)

//   const notesAtEnd = await helper.notesInDb()

//   expect(notesAtEnd).toHaveLength(
//     helper.initialNotes.length - 1
//   )

//   const contents = notesAtEnd.map(r => r.content)

//   expect(contents).not.toContain(noteToDelete.content)
// })

afterAll(async () => {
  await mongoose.connection.close()
})