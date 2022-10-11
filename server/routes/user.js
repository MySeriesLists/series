import express from "express";
import validator from "validator";
import { passwordStrength } from "check-password-strength";
import generateAuthToken from "../utils/generateToken.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// import controllers
import Auth from "../controllers/Auth.js";

const userRouter = express.Router();

// create new instance of Auth
const auth = new Auth();

userRouter.get("/", (req, res) => {
  res.send("Hello World!");
});

userRouter.get("/google/login", (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile`;
  res.redirect(url);
});

userRouter.get("/google/callback", (req, res) => {
  const code = req.query.code;
  if (code) {
    auth
      .googleAuth(code)
      .then((response) => {
        console.log("response", response);
        if (response.error) {
          res.status(400).send(response.error);
        }
        return generateAuthToken(req, res, response.user);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });
  }
});

userRouter.post("/signup", (req, res) => {
  const { username, password, email } = req.body;
  // generate a rndom token
  const code = Math.floor(Math.random() * 16777215).toString(16);

  if (!username || !password || !email) {
    res
      .status(500)
      .json({ message: "Please enter username, email and password" });
    return;
  }
  // check if user name is alphanumeric and has a length of 3-20
  if (
    !validator.isAlphanumeric(username) ||
    username.length < 3 ||
    username.length > 20
  ) {
    res
      .status(500)
      .json({
        message: "Username must be alphanumeric and has a length of 3-20",
      });
    return;
  } else if (!validator.isEmail(email)) {
    res.status(500).json({ message: "Please enter a valid email" });
    return;
  } else if (passwordStrength(password).id < 2) {
    res
      .status(500)
      .json({
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character",
      });
    return;
  }
  auth
    .signup({ username, password, email, code })
    .then((response) => {
      // handle 11000 error
      if (response.code === 11000) {
        response.keyPattern.username
          ? res.status(500).json({ message: "Username already exists" })
          : res.status(500).json({ message: "Email already exists" });
        return;
      }
      return generateAuthToken(req, res, response.user);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error);
    });
});

userRouter.post("/login", (req, res) => {
  const { credential, password } = req.body;
  console.log(credential, password);
  if (!credential || !password) {
    res.status(500).json({ message: "Please enter username and password" });
    return;
  }
  // verify if it's an email or username
  const isEmail = credential.includes("@");
  auth
    .login({ credential, password, isEmail })
    .then((response) => {
      if (response.error) {
        res.status(400).send(response.error);
        return;
      }
      return generateAuthToken(req, res, response.user);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error);
    });
});
userRouter.post("/logout", (req, res) => {
  // remove token from cookie
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.send("Logout success");
});

userRouter.get("/confirm", (req, res) => {
  const { code, email } = req.query;
  console.log(code, email);

  auth
    .confirm({ code, email })
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      console.log("An error occured :", error);
      res.status(400).send(error);
    });
});

userRouter.get("/change-password", (req, res) => {
  const { code, email } = req.query;
  console.log(code, email);
  //verify token expiration
  if (!code || !email) {
    res.status(500).json({ message: "Please enter a valid code and email" });
    return;
  }

  auth
    .changePassword({ code, email })
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      console.log("An error occured :", error);
      res.status(400).send(error);
    });
});

userRouter.get("/refresh-token", (req, res) => {
  const refreshToken = req.cookies["refresh-token"];
  if (!refreshToken) {
    return res.status(401).send("Access denied");
  }
  auth
    .refreshToken(refreshToken)
    .then((response) => {
      res.cookie("auth-token", response.token, {
        httpOnly: true,
        maxAge: 1 * 60 * 60 * 1000,
      });
      res.cookie("refresh-token", response.refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.send(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error);
    });
});

userRouter.get("/disable-account", (req, res) => {
  const authToken = req.cookies["auth-token"];
  if (!authToken) {
    return res.status(401).send("Access denied");
  }
  auth
    .disableAccount(authToken)
    .then((response) => {
      res.clearCookie("auth-token");
      res.clearCookie("refresh-token");
      res.send(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error);
    });
});

userRouter.get("/me", (req, res) => {
  const authToken = req.cookies["auth-token"];
  if (!authToken) {
    return res.status(401).send("Access denied");
  }
  auth
    .me(authToken)
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error);
    });
});

userRouter.get("/reset-password", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(500).json({ message: "Please enter your email" });
  }
  auth
    .resetPassword(email)
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).send(error);
    });
});

export default userRouter;
