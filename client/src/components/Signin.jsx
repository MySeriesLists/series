export default function (props) {
  return (
    <>

      <div className="Auth-form-container">
        <form className="Auth-form">
          <div className="Auth-form-content">
            <h3 className="Auth-form-title">Sign In</h3>
            <div className="Connect-with-google text-center">
              <button className="Connect-with-google-button btn btn-outline-primary mx-auto btn-sm">
                <img
                  className="Connect-with-google-icon"
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  alt="Google"
                />
                <span className="Connect-with-google-text">
                  {" "}
                  Connect with Google
                </span>
              </button>
            </div>
            <div className="form-group mt-3">
              <label>Email address or username</label>
              <input
                type="email"
                className="form-control "
                placeholder="@username"
              />
            </div>
            <div className="form-group mt-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control mt-1"
                placeholder="Enter password"
              />
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-block btn-primary">
                Submit
              </button>
            </div>
            <p className="forgot-password text-right mt-2">
              Forgot <a href="#">password?</a>
            </p>
          </div>
        </form>
        <div className="Auth-form-footer">

        <p className="text-center">
          Don't have an account? <a href="#">Sign up</a>
        </p>
      </div>
      </div>
      
    </>
  );
}
