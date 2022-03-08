import { useState } from 'react'

const Blog = ({ blog, addLikeTo, removeBlog, user }) => {
  const [visible, setVisible] = useState(false)
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const addLike = () => {
    addLikeTo(blog.id)
  }

  const remove = () => {
    removeBlog(blog)
  }

  return (
    <div id='blog' style={blogStyle}>
      {blog.title} {blog.author}
      <button id='blog_view' onClick={toggleVisibility}>{visible ? 'hide' : 'view'}</button>
      <div style={showWhenVisible}>
        <div>{blog.url}</div>
        <div>likes {blog.likes}<button onClick={addLike}>like</button></div>
        <div>{blog.user.name}</div>
        {blog.user.username === user.username ? <button onClick={remove}>remove</button> : null}

      </div>
    </div>
  )
}

export default Blog