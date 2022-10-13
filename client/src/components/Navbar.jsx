import React from "react";

import {
  MDBDropdown,
  MDBDropdownMenu,
  MDBDropdownToggle,
  MDBDropdownItem,
} from "mdb-react-ui-kit";
import { Link } from "react-router-dom";
import Search from "./Search";

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: localStorage.getItem("theme") || "sun",
    };
  }



  changeTheme = (e) => {
    e.preventDefault();
    console.log("change theme", this.state.theme);
    if (this.state.theme === "sun") {
      this.setState({ theme: "moon" }); //dark
      localStorage.setItem("theme", "moon"); //dark
    } else {
      this.setState({ theme: "sun" });
      localStorage.setItem("theme", "sun");
    }
  };
  render() {
    return (
      <>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          {/* Container wrapper */}
          <div className="container-fluid">
            {/* Toggle button */}
            <button
              className="navbar-toggler"
              type="button"
              data-mdb-toggle="collapse"
              data-mdb-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="fas fa-bars" />
            </button>
            {/* Collapsible wrapper */}
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              {/* Navbar brand */}
              <a className="navbar-brand mt-2 mt-lg-0" href="/">
                <img
                  src="https://mdbcdn.b-cdn.net/img/logo/mdb-transaprent-noshadows.webp"
                  alt="MDB Logo"
                  loading="lazy"
                  height={15}
                />
              </a>
              {/* Left links */}
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    Dashboard
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    Team
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">
                    Projects
                  </a>
                </li>
              </ul>
              {/* Left links */}
            </div>
            {/* Collapsible wrapper */}
            {/* Right elements */}
            <div className="d-flex align-items-center">
              {/* search bar icon */}
              <div className="d-flex align-items-center">
                <Search />
              </div>

              {/* change theme  with props class name */}
              <div className="d-flex align-items-center">
                <i
                  className={`text-reset me-3 fas fa-${this.state.theme}`}
                  onClick={this.changeTheme}
                />
              </div>

              {/* Notifications */}
              <div className="dropdown">
                <a
                  className="text-reset me-3 dropdown-toggle hidden-arrow"
                  href="/"
                  id="navbarDropdownMenuLink"
                  role="button"
                  data-mdb-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-bell" />
                  <span className="badge rounded-pill badge-notification bg-danger">
                    1
                  </span>
                </a>
              </div>

              {/* Avatar */}

              <MDBDropdown>
                <MDBDropdownToggle color="link">
                  <img
                    src="https://robohash.org/meteor314?set=set4"
                    className="rounded-circle"
                    alt="Black and White Portrait of a Man"
                    loading="lazy"
                    height={25}
                  />
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  <MDBDropdownItem link>
                    <Link to="/profile">Profile</Link>
                  </MDBDropdownItem>
                  <MDBDropdownItem link>
                    <Link to="/settings">Settings</Link>
                  </MDBDropdownItem>
                  <MDBDropdownItem link>
                    <Link to="/logout">Logout</Link>
                  </MDBDropdownItem>
                </MDBDropdownMenu>
              </MDBDropdown>
            </div>
            {/* Right elements */}
          </div>
          {/* Container wrapper */}
        </nav>
        {/* Navbar */}
      </>
    );
  }
}
