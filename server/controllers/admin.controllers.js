import config from "../config.js";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import User from "../models/users.js";
import School from "../models/school.js";

import { isNullOrUndefined } from "../util/validationHelper.js";

export async function login(req, res, next) {
  const { login, password } = req.body;

  if (isNullOrUndefined(login) || typeof login !== "string") {
    return res.status(200).send({
      status: false,
      msg: "Invalid login",
    });
  }

  if (isNullOrUndefined(password) || typeof login !== "string") {
    return res.status(200).send({
      status: false,
      msg: "Invalid password",
    });
  }
  try {
    let user = await User.findOne({
      login: login,
    });

    if (isNullOrUndefined(user)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid user",
      });
    }

    if (user.userGroup === "Officer") {
      return res.status(200).send({
        status: false,
        msg: "Invalid user group",
      });
    }

    //Deactivated
    if (user.status === "2" || user.status === 2) {
      return res.status(200).send({
        status: false,
        msg: "Account has been deactivated",
      });
    }

    const loginUser = await User.findOne({
      login: login,
    });

    //should update to not return password

    const hashPassword = await bcrypt.compare(password, loginUser.password);
    if (!hashPassword) {
      return res.status(200).send({
        status: false,
        msg: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      config.secret,
      {
        expiresIn: 31536e3,
      }
    );

    return res.status(200).send({
      status: true,
      msg: "Admin login successfully",
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function registerUser(req, res, next) {
  try {
    const { newUser } = req.body;
    const { login, password, school, userGroup } = newUser;

    if (isNullOrUndefined(login) || login === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid username",
      });
    }
    if (isNullOrUndefined(password) || password === "") {
      return res.status(200).send({
        status: false,
        msg: "invalid password",
      });
    }
    if (userGroup !== "Admin") {
      // if (isNullOrUndefined(district) || district === "") {
      //   return res.status(200).send({
      //     status: false,
      //     msg: "invalid district",
      //   });
      // }
      if (isNullOrUndefined(school) || school === "") {
        return res.status(200).send({
          status: false,
          msg: "invalid school",
        });
      }
    }
    if (isNullOrUndefined(userGroup) || userGroup === "") {
      return res.status(200).send({
        status: false,
        msg: "invalid user group",
      });
    }

    const checkUserName = await User.findOne({ login: login });
    if (checkUserName) {
      return res.status(200).send({
        status: false,
        msg: "Username existed",
      });
    }

    let status = 1; //Active

    if (userGroup === "Teacher") {
      status = 0;
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    //since it's admins
    let conditionDistrict;
    let conditionSchool;
    let userObject;

    if (userGroup !== "Admin") {
      const selectedSchool = await School.findOne({
        schoolName: school,
      });
      conditionDistrict = selectedSchool.district;

      // return res.status(200).send({
      //   status: false,
      //   msg: "trying ",
      // });

      conditionSchool = selectedSchool._id;

      userObject = {
        login: login,
        password: hashPassword,
        userGroup: userGroup,
        status: status,
        district: conditionDistrict,
        school: conditionSchool,
      };
    }

    if (userGroup === "Admin") {
      conditionDistrict = "";
      conditionSchool = "";
      userObject = {
        login: login,
        password: hashPassword,
        userGroup: userGroup,
        status: status,
        district: conditionDistrict,
      };
    }

    await User.create(userObject);

    return res.status(200).send({
      status: true,
      msg: "Registered successfully",
    });
  } catch (err) {
    next(err);
  }
}
