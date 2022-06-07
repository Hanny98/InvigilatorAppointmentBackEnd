import User from "../models/users.js";
import Teacher from "../models/teacher.js";
import School from "../models/school.js";
import { isNullOrUndefined } from "../util/validationHelper.js";
import { checkSkipLimit } from "../util/common.js";
import * as bcrypt from "bcrypt";
import config from "../config.js";
import mongoose from "mongoose";

//get function in admin User page
export async function getUsers(req, res, next) {
  try {
    const { skip, limit } = checkSkipLimit(req);
    const { searchValue } = req.body;
    const filterCondition = [];
    const queryCondition = [];

    // if login true, then what if we want to fitler user with different status
    queryCondition.push({
      login: {
        $exists: true,
      },
    });

    if (!isNullOrUndefined(searchValue) && searchValue !== "") {
      if (!isNullOrUndefined(searchValue.login) && searchValue.login !== "") {
        filterCondition.push({
          login: {
            $regex: searchValue.login,
            $options: "i",
          },
        });
      }
      //updated with school name
      if (
        !isNullOrUndefined(searchValue.schoolName) &&
        searchValue.schoolName !== ""
      ) {
        const selectedSchool = await School.findOne({
          schoolName: searchValue.schoolName,
        });

        filterCondition.push({
          school: selectedSchool._id,
        });
      }
      if (
        !isNullOrUndefined(searchValue.userGroup) &&
        searchValue.userGroup !== ""
      ) {
        filterCondition.push({
          userGroup: searchValue.userGroup,
        });
      }
      if (!isNullOrUndefined(searchValue.status) && searchValue.status !== "") {
        filterCondition.push({
          status: parseInt(searchValue.status, 10),
        });
      }
    }
    if (filterCondition.length > 0) {
      let userList = await User.find({ $and: filterCondition }); //filter condition should use $and
      const uuserList = userList;
      const arrayId = uuserList.map((user) => {
        return user._id;
      });
      queryCondition.push({
        _id: {
          $in: arrayId,
        },
      });
    }

    const userCountPromise = User.countDocuments({ $and: queryCondition });
    let userList = await User.aggregate([
      {
        $match: {
          $and: queryCondition,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    let updatedUserList = userList;

    updatedUserList = await Promise.all(
      updatedUserList.map((user) => {
        return new Promise(async (resolve, reject) => {
          if (
            (user.userGroup !== "Admin" || user.userGroup !== "Officer") &&
            user.school !== null
          ) {
            await School.findOne({
              _id: mongoose.Types.ObjectId(user.school),
            })
              .then((result) => {
                resolve({ ...user, schoolName: result.schoolName });
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            resolve(user);
          }
        });
      })
    );

    const totalCount = await userCountPromise;

    return res.status(200).send({
      status: true,
      msg: "successfully",
      userList: updatedUserList,
      userCount: totalCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { currentUser } = req.body;
    const {
      login,
      password,
      // district,
      schoolName,
      userGroup,
      status,
      // uid,
      _id,
      newPassword,
    } = currentUser;
    if (isNullOrUndefined(login) || login === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid username",
      });
    }

    if (isNullOrUndefined(userGroup) || userGroup === "") {
      return res.status(200).send({
        status: false,
        msg: "invalid user group",
      });
    }
    if (userGroup !== "Admin") {
      // if (isNullOrUndefined(district) || district === "") {
      //   return res.status(200).send({
      //     status: false,
      //     msg: "invalid district",
      //   });
      // }
      if (isNullOrUndefined(schoolName) || schoolName === "") {
        return res.status(200).send({
          status: false,
          msg: "invalid school",
        });
      }
    }

    if (isNullOrUndefined(status) || status === "") {
      return res.status(200).send({
        status: false,
        msg: "invalid Account Status",
      });
    }

    //if orginally is Teacher group, need to destroy the Teacher collection

    const selectedUser = await User.findOne({
      _id: mongoose.Types.ObjectId(_id),
    });

    if (isNullOrUndefined(selectedUser)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid User",
      });
    }

    // let selectedTeacher = null;
    // if (selectedUser.userGroup === "Teacher") {
    //   selectedTeacher = await Teacher.findOne({
    //     user: selectedUser._id,
    //   });
    // }

    //check repeat username
    const checkUserName = await User.countDocuments({
      login: login,
      _id: {
        $ne: mongoose.Types.ObjectId(_id),
      },
    });
    //uid is user uid

    if (checkUserName > 0) {
      return res.status(200).send({
        status: false,
        msg: "Username existed",
      });
    }

    //status 0 incomplete
    //status 1 activate
    //status 2 deactive
    let updatedStatus = parseInt(status, 10);

    //if orginal user group is teacher, need to destroy record
    if (
      (selectedUser.userGroup === "Teacher" && userGroup !== "Teacher") ||
      (userGroup === "Teacher" &&
        selectedUser.status !== 2 &&
        updatedStatus === 2)
    ) {
      const updatingId = mongoose.Types.ObjectId(_id);

      const userTeacherId = await Teacher.find({
        user: updatingId,
      });

      await Teacher.deleteOne({
        _id: userTeacherId,
      });
    }

    //if updating user group to teacher, need to set status 0

    //if originally if teacher,
    if (updatedStatus !== 2) {
      if (
        userGroup === "Teacher" &&
        selectedUser.status === 2 &&
        updatedStatus !== 2
      ) {
        updatedStatus = 0;
      } else if (
        userGroup === "Teacher" &&
        selectedUser.userGroup === "Teacher" &&
        selectedUser.status !== 0
      ) {
        updatedStatus = 1;
      } else if (
        userGroup === "Teacher" &&
        selectedUser.userGroup !== "Teacher" &&
        status !== 2
      ) {
        updatedStatus = 0;
      } else if (userGroup !== "Teacher" && status === 0) {
        updatedStatus = 1;
      } else {
        updatedStatus = updatedStatus;
      }
      //from deactivate to activate and the user group is teacher
    }
    const saltRounds = 10;

    //since it's admins
    let conditionDistrict;
    let conditionSchool;

    if (userGroup !== "Admin") {
      const selectedSchool = await School.findOne({
        schoolName: schoolName,
      });
      conditionDistrict = selectedSchool.district;

      conditionSchool = selectedSchool._id;

      await User.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(_id),
        },
        {
          login: login,
          district: conditionDistrict,
          school: conditionSchool,
          userGroup: userGroup,
          status: parseInt(updatedStatus, 10),
        }
      );
    }

    if (userGroup === "Admin") {
      conditionDistrict = "";
      conditionSchool = "";
      await User.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(_id),
        },
        {
          login: login,
          district: conditionDistrict,
          school: null,
          userGroup: userGroup,
          status: parseInt(updatedStatus, 10),
        }
      );
    }

    // await User.findOneAndUpdate(
    //   {
    //     uid: uid,
    //   },
    //   {
    //     login: login,
    //     // password: hashPassword,
    //     district: conditionDistrict,
    //     school: conditionSchool,
    //     userGroup: userGroup,
    //     status: parseInt(updatedStatus, 10),
    //   }
    // );

    //update password if new password is inserted
    if (!isNullOrUndefined(newPassword) && newPassword !== "") {
      const hashPassword = await bcrypt.hash(newPassword, saltRounds);

      await User.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(_id),
        },
        {
          password: hashPassword,
        }
      );
    }

    return res.status(200).send({
      status: true,
      msg: "Updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function getLoginUser(req, res, next) {
  try {
    const { _id } = req.body;

    const user = await User.findOne(
      { _id: mongoose.Types.ObjectId(_id) },
      {
        _id: 1,
        login: 1,
        userGroup: 1,
        school: 1,
        district: 1,
        status: 1,
      }
    );

    return res.status(200).send({
      status: true,
      msg: "Login user data retrieved",
      user: user,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentSchoolUser(req, res, next) {
  try {
    const { schoolId } = req.body;

    //get count of current school teacher, and school principal
    const teacherCondition = [];
    teacherCondition.push({
      userGroup: "Teacher",
      school: mongoose.Types.ObjectId(schoolId),
      status: 1,
    });

    const principalCondition = [];
    principalCondition.push({
      userGroup: "School Principal",
      school: mongoose.Types.ObjectId(schoolId),
      status: 1,
    });

    const teacherCountPromise = User.countDocuments({ $and: teacherCondition });
    const teacherCount = await teacherCountPromise;
    const principalCountPromise = User.countDocuments({
      $and: principalCondition,
    });
    const principalCount = await principalCountPromise;

    return res.status(200).send({
      status: true,
      msg: "successful",
      teacherCount: teacherCount,
      principalCount: principalCount,
    });
  } catch (err) {
    next(err);
  }
}
