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

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]


  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length - 1
  )

  const titles = blogsAtEnd.map(b => b.title)

  expect(titles).not.toContain(blogToDelete.title)
})

test('the amount of likes in a blog can be modified', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToModify = blogsAtStart[0]
  const initialLikes = blogToModify.likes

  const modifiedBlog = {
    title: blogToModify.title,
    aithor: blogToModify.author,
    url: blogToModify.url,
    likes: blogToModify.likes + 1
  }

  await api
    .put(`/api/blogs/${blogToModify.id}`)
    .send(modifiedBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length
  )
  const likesAfter = blogsAtEnd[0].likes
  expect(likesAfter).toEqual(initialLikes + 1)
})

afterAll(async () => {
  await mongoose.connection.close()
})