const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.length === 0
    ? 0 
    : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  var result = {
    title: '',
    author: '',
    likes: -1
  }

  blogs.forEach(element => {
    if (element.likes > result.likes){
      result.title = element.title
      result.author = element.author
      result.likes = element.likes
    }
  })
  return result
}

const mostBlogs = (blogs) => {
  const authors = new Map()
  var author = ''
  var blogsNo = 0
  blogs.forEach(element => {
    if (authors.has(element.author)) {
      authors.set(element.author, authors.get(element.author)+1)
    } else {
      authors.set(element.author, 1)
    }
  })
  authors.forEach((value, key) => {
    if (value>blogsNo) {
      author = key
      blogsNo = value
    }
  })
  return {author:author, blogs:blogsNo}
}

const mostLikes = (blogs) => {
  const authors = new Map()
  var author = ''
  var likesNo = 0
  blogs.forEach(element => {
    if (authors.has(element.author)) {
      authors.set(element.author, authors.get(element.author)+element.likes)
    } else {
      authors.set(element.author, element.likes)
    }
  })
  authors.forEach((value, key) => {
    if (value>likesNo) {
      author = key
      likesNo = value
    }
  })
  return {author:author, likes:likesNo}
}
  
module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}