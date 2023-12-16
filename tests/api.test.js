const supertest = require('supertest')
const mongoose = require('mongoose')

const helper = require('./api_test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  await Blog.insertMany(helper.initialBlogs)
  await api.post('/api/users').send(helper.initialUsers[0])
  await api.post('/api/users').send(helper.initialUsers[1])

  const users = await User.find({})
  const blogs = await Blog.find({})

  users[0].blogs = [blogs[0]]
  users[1].blogs = [blogs[1]]

  blogs[0].user = users[0]
  blogs[1].user = users[1]

  await blogs[0].save()
  await blogs[1].save()
  await users[0].save()
  await users[1].save()
})

describe('Blog tests', () => {
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

    const response = await api
      .post('/api/login')
      .send({username: 'Person', password: '1234'})
    const token = response._body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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

    const response = await api
      .post('/api/login')
      .send({username: 'Person', password: '1234'})
    const token = response._body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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

    const response = await api
      .post('/api/login')
      .send({username: 'Person', password: '1234'})
    const token = response._body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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

    const response = await api
      .post('/api/login')
      .send({username: 'Person', password: '1234'})
    const token = response._body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const response = await api
      .post('/api/login')
      .send({username: 'Person', password: '1234'})
    const token = response._body.token

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
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

  test('adding a new blog without a authorization token returns status 401', async () => {
    const newBlog = {
      title: 'A blog',
      author: 'A blogger',
      url: 'blog.org',
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

describe('user tests', () => {
  test('A user cannot be created if the password is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()
    
    const newUser = {
      username: 'validUsername',
      name: 'validName',
      password: '12' // too short
    }

    await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd.length).toEqual(usersAtStart.length)
  })
  
  test('A user cannot be created if the username is not unique', async () => {
    const usersAtStart = await helper.usersInDb()
    const firstUser = usersAtStart[0]
    
    const newUser = {
      username: firstUser.username,
      name: 'validName',
      password: 'validPassword1234'
    }


    await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd.length).toEqual(usersAtStart.length)
  })

  test('A user cannot be created without a username', async () => {
    const usersAtStart = await helper.usersInDb()
    
    const newUser = {
      name: 'validName',
      password: 'validPassword1234'
    }

    await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd.length).toEqual(usersAtStart.length)
  })
  test('A user cannot be created without a password', async () => {
    const usersAtStart = await helper.usersInDb()
    
    const newUser = {
      username: 'validUsername',
      name: 'validName',
    }

    await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd.length).toEqual(usersAtStart.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})