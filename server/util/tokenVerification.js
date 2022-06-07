import jwt from "jsonwebtoken";
import config from "../config.js";

export async function authAdmin(req, res, next) {
  try {
    let token = req.headers.authorization;
    console.log("token", token);
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return { status: false, msg: errors.USER_UNAUTHORIZED_TOKEN };
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return res.status(200).send({
          loggedIn: false,
          message: "Failed to authenticate",
        });
      }
      console.log("token received");
      req.user = {};
      req.user.id = decoded.id;
      return next();
    });
  } catch (err) {
    console.log(err);
    return res.status(401).send({ status: false, msg: "token error" });
  }
}
