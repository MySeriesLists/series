import React from "react";
import { useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./Navbar";


export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            isLoading: false,
        };
    }



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
            <h1>Profile :</h1>
            
            
        </div>
        );
    }
}