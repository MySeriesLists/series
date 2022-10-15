import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default class Signin extends Component {
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
        return  window.location.href = data.url;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const credential = document
      .getElementById("credential")
      .value.toLowerCase();
    const password = document.getElementById("password").value;
    const data = { credential, password };
    if (credential === "" || password === "") {
      console.log("Please fill in all fields");
      return this.notify({ message: "Please fill in all fields" });
    }
    fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          window.location.href = "/";
        } else {
          this.notify({ message: data.message });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    return (
      <>
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
                <label>Email address or username</label>
                <input
                  className="form-control "
                  placeholder="@username"
                  id="credential"
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
              <div className="text-center">
                <button
                  type="submit"
                  className="btn btn-block btn-primary"
                  onClick={this.handleSubmit}
                >
                  Submit
                </button>
              </div>
              <p className="forgot-password text-right mt-2">
                Forgot <a href="/forget-password">password?</a>
              </p>
            </div>
          </form>
          <div className="Auth-form-footer">
            <p className="text-center">
              Don't have an account? <a href="/signup">Sign up</a>
            </p>
          </div>
        </div>
      </>
    );
  }
}
