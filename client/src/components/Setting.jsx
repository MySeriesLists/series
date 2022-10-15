import React from "react";
import Navbar from "./Navbar";
import withRouter from "./withRouter";

class Setting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      username: this.props.params.username,
      isOwner: false,
    };
  }

  componentDidMount() {
    fetch(`/profile/user/setting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: this.state.username }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          window.location.href = "/error/404";
        }
        this.setState({ user: data.user });
        if (this.state.username === data.user.username) {
          this.setState({ isOwner: true });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <>
        {
          /* if this owner is false, redirect to error 404*/
          !this.state.isOwner ? (window.location.href = "/error/404") : <></>
        }
        <Navbar />
        <h3>Setting Page</h3>
        <div>Id: {this.props.params.username}</div>
        <div>Username: {this.state.user.username}</div>
        <div>
          {this.state.isOwner ? (
            <div>
              <button className="btn btn-primary">Edit Profile</button>
            </div>
          ) : (
            <div>
              <button className="btn btn-primary">Follow</button>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default withRouter(Setting);