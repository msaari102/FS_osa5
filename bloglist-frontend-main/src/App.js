/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import BlogForm from './components/BlogForm'

const Button = (props) => (
  <button onClick={props.handleClick}>
    {props.text}
  </button>
)

const App = () => {
  const [blogs, setBlogs] = useState([])

  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
      setUser(user)
      blogService.setToken(user.token)
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      setUsername('')
      setPassword('')
    } catch (exception) {
      console.log(exception)
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
      })

    setSuccessMessage(
      `a new blog ${blogObject.title} by ${blogObject.author} added`
    )
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  const removeBlog = (blog) => {
    if (window.confirm(`Delete ${blog.title}?`)){
      blogService
        .deleteId(blog.id)
        .then(response => {
          setBlogs(blogs.filter(n => n.id !== blog.id))
        })
      setSuccessMessage(
        `Deleted ${blog.title}`
      )
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    }

  }

  const addLikeTo = id => {
    const blog = blogs.find(n => n.id === id)
    const changedBlog = { ...blog, likes: blog.likes+1 }

    blogService
      .update(id, changedBlog)
      .then(returnedBlog => {
        setBlogs(blogs.map(blog => blog.id !== id ? blog : changedBlog))
      })
      .catch(error => {
        setErrorMessage(
          `Blog '${blog.content}' was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setBlogs(blogs.filter(n => n.id !== id))
      })
    setSuccessMessage(
      `You liked ${blog.title}`
    )
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  const blogFormRef = useRef()


  const logout = (event) => {
    //event.preventDefault()
    setUser(null)
    blogService.setToken(null)
    window.localStorage.clear()
    setUsername('')
    setPassword('')
    setSuccessMessage('User logged out')
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  const blogForm = () => (
    <div>
      {blogs.sort((a,b) => b.likes - a.likes).map(blog => (
        <Blog key={blog.id} blog={blog} addLikeTo={addLikeTo} removeBlog={removeBlog} user={user} />
      )
      )}
    </div>
  )

  return (
    <div>
      <h2>blogs</h2>
      <Notification errorMessage={errorMessage} successMessage={successMessage} />
      {user === null ?
        <div>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
        </div> :
        <div>
          <>{user.name} logged in</> <Button handleClick={() => logout()} text="logout" />
          <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
          {blogForm()}
        </div>
      }

    </div>
  )
}

export default App
