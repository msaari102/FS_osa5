const Notification = ({ errorMessage, successMessage }) => {
  if (errorMessage === null) {
    if (successMessage === null) {
      return null
    }
    return (
      <div className="success">
        {successMessage}
      </div>
    )
  }
  return (
    <div className="error">
      {errorMessage}
    </div>
  )
}

export default Notification