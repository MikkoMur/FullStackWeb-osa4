const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')
//const User = require('../models/user')
//const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1})
  response.json(blogs)
})
  
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {

  const body = request.body
  const user = request.user

  if (!user) {    
    return response.status(401).json({ error: 'token invalid' })  
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user
  })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

  const user = request.user
  if (!user) {    
    return response.status(401).json({ error: 'token invalid' })  
  }

  const blog = await Blog.findById(request.params.id)
  if ( blog ) {
    if ( blog.user.toString() === user.id.toString() ) {
      await Blog.findByIdAndDelete(request.params.id)

      // Remove the blog from the user's list as well ("populate" doesn't
      // show blogs that are removed from the db, but the blogs do remain  
      // in the users "blogs" array)
      user.blogs = user.blogs.filter(blog => blog.toString() != request.params.id)
      await user.save()
    } 
    else {
      return response.status(401).json( { error: 'token invalid' })
    } 
  }
  return response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter