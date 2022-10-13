import React, { Component } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Navbar";

export default class Home extends Component {
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

  render() {
    return (
      <div>
        <ToastContainer />
        <Navbar />
        {/* update the state value on button click */}
        <h1>Home</h1>
      </div>
    );
  }
}
