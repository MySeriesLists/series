import React from "react";
import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
function User() {
  const [user, setUser] = useState(null);
  const { username } = useParams();

    useEffect(() => {
      fetch(`/profile/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: username }),
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
        });
    }, [username]);
    
    return (
      <>
        <h3>User Page</h3>
        <div>Username: {username}</div>
        </>
    )



}

export default User;
