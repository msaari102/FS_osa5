/* eslint-disable no-unused-vars */
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

const user = {
  username: 'matti'
}

const blog = {
  title: 'Kodokan Judo',
  author: 'Jigoro Kano',
  url: 'kodokan.com',
  likes: 5,
  user: user
}

test('renders content', () => {


  render(<Blog blog={blog} user={user} />)

  const element = screen.getByText('Kodokan Judo', { exact: false })
  const element2 = screen.getByText('Jigoro Kano', { exact: false })
  const elementUrl = screen.queryByText('kodokan.com')
  expect(elementUrl).not.toBeVisible()
  const elementLikes = screen.queryByText('likes 5')
  expect(elementLikes).not.toBeVisible()
})

test('clicking the button shows likes and url', async () => {

  render(
    <Blog blog={blog} user={user} />
  )

  const button = screen.getByText('view')
  userEvent.click(button)

  const elementTitle = screen.getByText('Kodokan Judo', { exact: false })
  const elementAuthor = screen.getByText('Jigoro Kano', { exact: false })
  const elementUrl = screen.getByText('kodokan.com', { exact: false })
  expect(elementUrl).toBeVisible()
  const elementLikes = screen.getByText('likes 5', { exact: false })
  expect(elementLikes).toBeVisible()

})

test('clicking the like button calls event handler once', async () => {

  const mockHandler = jest.fn()

  render(
    <Blog blog={blog} user={user} addLikeTo={mockHandler} />
  )

  const buttonView = screen.getByText('view')
  userEvent.click(buttonView)

  const buttonLike = screen.getByText('like')
  userEvent.click(buttonLike)
  userEvent.click(buttonLike)

  expect(mockHandler.mock.calls).toHaveLength(2)
})