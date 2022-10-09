import express, { application } from "express";
import validator from "validator";
import cookieParser from "cookie-parser";
import Auth from "../controllers/Auth.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import jwt from "jsonwebtoken";
import { passwordStrength } from "check-password-strength";

const userRouter = express.Router();
userRouter.use(cookieParser());
const auth = new Auth();
userRouter.get("/", (req, res) => {
  res.send("Hello World!");
});

userRouter.get("/google/login", (req, res) => {

  res.redirect(
    auth.getGoogleAuthUrl(),
     );
});

userRouter.get("/google/callback", (req, res) => {
  const code = req.query.code;
  if (code) {
    auth
      .googleAuth(code)
      .then((response) => {
        res.cookie(
          "auth-token",
          response.token,
          { httpOnly: true },
          { maxAge: 60 * 60 * 1000 }
        );
        res.cookie(
          "refresh-token",
          response.refreshToken,
          { httpOnly: true },
          { maxAge: 60 * 60 * 1000 }
        );
        res.redirect("http://localhost:3000");
      })
      .catch((error) => {
        res.status(400).send(error);
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
  // verify email with regex
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  const userRegex = /^[a-zA-Z0-9_\-\.]+$/g;
  if (!emailRegex.test(email)) {
    res.status(500).json({ message: "Please enter a valid email" });
    return;
  }
  if (!userRegex.test(username)) {
    res.status(500).json({ message: "Please enter a valid username" });
    return;
  }

  const passwordStrengthResult = passwordStrength(password);
  if (passwordStrengthResult.id < 2) {
    res.status(500).json({ message: "Password is too weak" });
    return;
  }
  auth
    .signup({ username, password, email, code })
    .then((response) => {
      res.cookie("auth-token", response.token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 1,
      });
      res.cookie("refresh-token", response.refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });
      res.json(response);
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
      if (response.status === "success") {
        res.cookie("auth-token", response.token, {
          httpOnly: true,
          maxAge: 1 * 60 * 60 * 1000,
        });
        res.cookie("refresh-token", response.refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        return res.send(response);
      }
      res.send(response);
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

userRouter.get('/change-password', (req, res) => {
  const { code, email } = req.query;
  console.log(code, email);
  //verify token expiration
  if(!code || !email) {
    res.status(500).json({message: 'Please enter a valid code and email'})
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
})



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

userRouter.get('/me', (req, res) => {
  const authToken = req.cookies['auth-token'];
  if (!authToken) {
    return res.status(401).send('Access denied');
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

userRouter.get('/reset-password', (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(500).json({ message: 'Please enter your email' });
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
