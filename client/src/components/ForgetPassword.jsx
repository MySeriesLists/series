import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default class ForgetPassword extends Component {
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
    window.location.href = "/auth/google/login";
    fetch("/auth/google/login", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        return (window.location.href = data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.toLowerCase().trim();
    if (email === "") {
      console.log("Please fill in all fields");
      return this.notify({ message: "Please fill in all fields" });
    }
    fetch(`/auth/reset-password?email=${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.error) return this.notify({ message: data.error });
        if (data.status === "success") {
          return this.notify({
            message: "Please check your email, an invitation has been send!",
          });
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
                <input
                  type="mail"
                  className="form-control "
                  placeholder="Please enter your email..."
                  id="email"
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
                Already have an account <a href="/signin">Sign in</a>
              </p>
            </div>
          </form>
        </div>
      </>
    );
  }
}
