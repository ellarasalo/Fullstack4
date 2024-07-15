const express = require('express')
const app = express()
const cors = require('cors')

const password = process.argv[2]
if (!password) {
  console.log('give password as argument')
  process.exit(1)
}

process.env.PASSWORD = password
const Blog = require('./mongo')

app.use(cors())
app.use(express.json())

app.get('/api/blogs', (request, response) => {
  Blog.find({})
    .then(blogs => {
      console.log('GET /api/blogs:', blogs)
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save()
    .then(result => {
      console.log('POST /api/blogs:', result)
      response.status(201).json(result)
    })
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
