const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'First Blog',
    author: 'John Doe',
    url: 'http://example.com/first',
    likes: 5
  },
  {
    title: 'Second Blog',
    author: 'Jane Doe',
    url: 'http://example.com/second',
    likes: 10
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blogs have id field instead of _id', async () => {
  const response = await api.get('/api/blogs')
  const ids = response.body.map(blog => blog.id)
  ids.forEach(id => {
    assert.ok(id)
  })
  const hasUnderscoreId = response.body.some(blog => blog._id)
  assert.strictEqual(hasUnderscoreId, false)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'New Blog',
    author: 'New Author',
    url: 'http://example.com/new',
    likes: 7
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(blog => blog.title)

  assert.strictEqual(response.body.length, initialBlogs.length + 1)
  assert.ok(titles.includes('New Blog'))
})

test('a blog can be deleted', async () => {
  const responseAtStart = await api.get('/api/blogs')
  const blogToDelete = responseAtStart.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const responseAtEnd = await api.get('/api/blogs')
  assert.strictEqual(responseAtEnd.body.length, initialBlogs.length - 1)

  const titles = responseAtEnd.body.map(blog => blog.title)
  assert.ok(!titles.includes(blogToDelete.title))
})

after(() => {
  mongoose.connection.close()
})
