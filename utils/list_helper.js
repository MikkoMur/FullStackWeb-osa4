const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((accumulator, blog) => {
    return accumulator + blog.likes
  },0)
}

const favoriteBlog  = (blogs) => {
  let favorite = null
  let maxLikes = -1
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i]
    if (blog.likes > maxLikes) 
    {
      maxLikes = blog.likes
      favorite = blog
    }
  }
  return favorite
}

const mostBlogs = (blogs) => {
  const blogCountsByAuthor = lodash.countBy(blogs, 'author')
  let authorObject = null
  let maxBlogs = -1

  for (const key in blogCountsByAuthor)
  {
    const blogs = blogCountsByAuthor[key]
    if (blogs > maxBlogs)
    {
      maxBlogs = blogs
      authorObject = 
      {
        author: key,
        blogs: blogs
      }
    }
  }
  return authorObject
}

const mostLikes = (blogs) => {
  const authors = blogs.map(blog => blog.author)
  const authorLikes = {}
  for (let i=0; i<authors.length; i++) 
  {
    authorLikes[authors[i]] = 0
  }
  for (let i=0; i<blogs.length; i++)
  {
    const blog = blogs[i]
    authorLikes[blog.author] += blog.likes
  }

  let authorObject = null
  let maxLikes = -1

  for (const author in authorLikes)
  {
    const likes = authorLikes[author]
    if (likes > maxLikes)
    {
      maxLikes = likes
      authorObject = 
      {
        author: author,
        likes: likes
      }
    }
  }

  return authorObject
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
