import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
class Signup extends Component {
  notify = (props) =>
    toast(props.message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  connectWithGoogle = (e) => {
    e.preventDefault();
    fetch("/auth/google/login", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        window.location.href = data.url;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.toLowerCase();
    const username = document.getElementById("username").value.toLowerCase();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;
    const data = { email, username, password, password2 };
    if (
      email === "" ||
      username === "" ||
      password === "" ||
      password2 === ""
    ) {
      console.log("Please fill in all fields");
      return this.notify({ message: "Please fill in all fields" });
    }
    if (password !== password2) {
      console.log("Passwords do not match");
      return this.notify({ message: "Passwords do not match" });
    }

    //verify if username is valid
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return this.notify({
        message: "Username can only contain letters and numbers",
      });
    }

    fetch("/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        // show error message
        if (data.message) {
          return toast(data.message, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        }

        if (data.success) {
          this.notify({
            message:
              "Account created successfully, please verify your email. Redirecting to login page...",
          });
          setTimeout(() => {
            this.props.history.push("/signin");
          }, 5 * 1000);
        }
      })
      .catch((err) =>
        toast("Something went wrong!", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        })
      );
  };

  render() {
    return (
      <>
        <ToastContainer />
        <ToastContainer />
        <div className="Auth-form-container">
          <form className="Auth-form">
            <div className="Auth-form-content">
              <h3 className="Auth-form-title">Sign In</h3>
              <div className="Connect-with-google text-center">
                <button
                  className="Connect-with-google-button btn btn-outline-primary mx-auto btn-sm"
                  onClick={this.connectWithGoogle}
                >
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
                <label>Email address</label>
                <input
                  type="email"
                  className="form-control "
                  placeholder="Enter email"
                  id="email"
                />
              </div>
              <div className="form-group mt-3">
                <label>Email username</label>
                <input
                  type="text"
                  className="form-control "
                  placeholder="Enter username"
                  id="username"
                />
              </div>
              <div className="form-group mt-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control mt-1"
                  placeholder="Enter password"
                  id="password"
                />
              </div>
              <div className="form-group mt-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control mt-1"
                  placeholder="Confirm password"
                  id="password2"
                />
              </div>
              <div className="text-center">
                <button
                  className="btn btn-block btn-primary"
                  type="submit"
                  onClick={this.handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
          <div className="Auth-form-footer">
            <p className="text-center">
              Already have an account? <a href="/signin">Sign in</a>
            </p>
          </div>
        </div>
      </>
    );
  }
}

export default Signup;
