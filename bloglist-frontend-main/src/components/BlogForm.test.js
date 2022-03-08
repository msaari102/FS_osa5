/* eslint-disable no-unused-vars */
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

const blog = {
  title: 'Kodokan Judo',
  author: 'Jigoro Kano',
  url: 'kodokan.com',
}

test('clicking the like button calls event handler once', async () => {

  const mockHandler = jest.fn()

  const { container } = render(
    <BlogForm createBlog={mockHandler} />
  )

  const input_title = container.querySelector('#blog_title')
  const input_author = container.querySelector('#blog_author')
  const input_url = container.querySelector('#blog_url')

  userEvent.type(input_title, blog.title )
  userEvent.type(input_author, blog.author )
  userEvent.type(input_url, blog.url )

  const buttonView = screen.getByText('save')
  userEvent.click(buttonView)

  expect(mockHandler.mock.calls[0][0].title).toEqual(blog.title)
  expect(mockHandler.mock.calls[0][0].author).toEqual(blog.author)
  expect(mockHandler.mock.calls[0][0].url).toEqual(blog.url)
})