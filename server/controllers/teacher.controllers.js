import Teacher from "../models/teacher.js";
import User from "../models/users.js";
import School from "../models/school.js";
import InvigilatorExperience from "../models/invigilatorExperience.js";
import { isNullOrUndefined } from "../util/validationHelper.js";
import { checkSkipLimit } from "../util/common.js";
import validator from "validator";
import teacher from "../models/teacher.js";
import invigilatorExperience from "../models/invigilatorExperience.js";
import mongoose from "mongoose";

export async function getTeacher(req, res, next) {
  try {
    const { skip, limit } = checkSkipLimit(req);
    const { school, searchValue } = req.body;

    const filterCondition = [];
    const queryCondition = [];
    // const selectedSchool = await School.findOne({
    //   _id: school,
    // });

    queryCondition.push({
      userGroup: "Teacher",
      school: mongoose.Types.ObjectId(school),
      status: 1,
    });

    if (!isNullOrUndefined(searchValue) && searchValue !== "") {
      if (!isNullOrUndefined(searchValue.name) && searchValue.name !== "") {
        filterCondition.push({
          teacherName: {
            $regex: searchValue.name,
            $options: "i",
          },
        });
      }
      if (
        !isNullOrUndefined(searchValue.phoneNumber) &&
        searchValue.phoneNumber !== ""
      ) {
        filterCondition.push({
          teacherPhoneNumber: {
            $regex: searchValue.phoneNumber,
            $options: "i",
          },
        });
      }
    }

    if (filterCondition.length > 0) {
      let teacherList = await Teacher.find({ $and: filterCondition });

      const arrayId = teacherList.map((teacher) => teacher.user); //same name, might be from differt school
      queryCondition.push({
        _id: {
          $in: arrayId,
        },
      });
    }

    const teacherCountPromise = User.countDocuments({ $and: queryCondition });
    let teacherList = await User.aggregate([
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
      {
        $lookup: {
          from: "teachers",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$id"] },
              },
            },
            {
              $project: {
                _id: 1,
                icNumber: 1,
                listOfInvigilatorExperience: 1,
                race: 1,
                homeAddress: 1,
                postcode: 1,
                city: 1,
                state: 1,
                teacherName: 1,
                teacherPhoneNumber: 1,
                teacherSex: 1,
                teacherPosition: 1,
                teacherEmailAddress: 1,
                salaryGrade: 1,
                salary: 1,
                jpnFileCode: 1,
                codeTypeStaff: 1,
                typeStaff: 1,
                teacherPositionCode: 1,
                teacherTypeStaffCode: 1,
              },
            },
          ],
          as: "teacherData",
        },
      },
      {
        $project: {
          status: 1,
          district: 1,
          school: 1,
          teacherData: "$teacherData",
        },
      },
    ]);

    // await Teacher.populate(teacherList, {
    //   path: "teacherData[0].listOfInvigilatorExperience",
    // });
    const totalCount = await teacherCountPromise;

    return res.status(200).send({
      status: true,
      msg: "successfully",
      teacherList: teacherList,
      teacherCount: totalCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTeacherList(req, res, next) {
  try {
    const { school } = req.body;

    const queryCondition = [];

    const selectedSchool = await School.findOne({
      _id: school,
    });

    queryCondition.push({
      userGroup: "Teacher",
      school: selectedSchool._id,
      status: 1, //teacher status has to be 1
    });

    let teacherList = await User.aggregate([
      {
        $match: {
          $and: queryCondition,
        },
      },
      {
        $lookup: {
          from: "teachers",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$user", "$$id"] },
              },
            },
            {
              $project: {
                _id: 1,
                icNumber: 1,
                listOfInvigilatorExperience: 1,
                race: 1,
                homeAddress: 1,
                postcode: 1,
                city: 1,
                state: 1,
                teacherName: 1,
                teacherPhoneNumber: 1,
                teacherSex: 1,
                teacherPosition: 1,
                teacherEmailAddress: 1,
                salaryGrade: 1,
                salary: 1,
                jpnFileCode: 1,
                codeTypeStaff: 1,
                typeStaff: 1,
                teacherPositionCode: 1,
                teacherTypeStaffCode: 1,
              },
            },
          ],
          as: "teacherData",
        },
      },
      {
        $project: {
          status: 1,
          district: 1,
          school: 1,
          teacherData: "$teacherData",
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      msg: "successfully",
      teacherList: teacherList,
    });
  } catch (err) {
    next(err);
  }
}

export async function getTeacherInvigilatorExperience(req, res, next) {
  try {
    const { teacherName, skip, limit } = req.body;

    const selectedTeacher = await Teacher.find({
      teacherName: teacherName,
    }).populate({
      path: "listOfInvigilatorExperience",
      populate: [
        {
          path: "assignmentTask",
          select: {
            title: 1,
            createdDate: 1,
          },
          options: {
            sort: {
              createdDate: -1,
            },
          },
        },
        {
          path: "assignedTo",
          populate: {
            path: "school",
            select: {
              schoolName: 1,
            },
          },
        },
      ],
    });

    const selected = await Teacher.aggregate([
      {
        $match: {
          teacherName: teacherName,
        },
      },
    ]);

    await InvigilatorExperience.populate(selected, {
      path: "listOfInvigilatorExperience",
      populate: [
        {
          path: "assignmentTask",
          select: {
            title: 1,
            createdDate: 1,
          },
          options: {
            sort: {
              createdDate: -1,
            },
          },
        },
        {
          path: "assignedTo",
          populate: {
            path: "school",
            select: {
              schoolName: 1,
            },
          },
        },
      ],
    });

    const invigilatorExperienceCount =
      selected[0].listOfInvigilatorExperience.length;

    let sliced = selected[0].listOfInvigilatorExperience;

    //after sliced left 1
    sliced = selected[0].listOfInvigilatorExperience.slice(skip, skip + limit);

    return res.status(200).send({
      status: true,
      experienceList: sliced,
      experienceCount: invigilatorExperienceCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTeacher(req, res, next) {
  try {
    const { currentTeacher } = req.body;

    const {
      _id,
      teacherName,
      icNumber,
      teacherSex,
      race,
      homeAddress,
      postcode,
      city,
      state,
      teacherEmailAddress,
      teacherPhoneNumber,
      teacherPositionCode,
      teacherTypeStaffCode,
      salaryGrade,
      salary,
      jpnFileCode,
    } = currentTeacher;

    if (isNullOrUndefined(teacherName) || teacherName === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Teacher Name",
      });
    }
    if (isNullOrUndefined(icNumber) || icNumber === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid IC Number",
      });
    }
    if (
      !validator.isLength(teacherPhoneNumber, 10, 11) ||
      teacherPhoneNumber.match(/^01/) === null
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Phone Number Format",
      });
    }
    if (isNullOrUndefined(teacherSex) || teacherSex === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Teacher Gender",
      });
    }
    if (isNullOrUndefined(race) || race === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Race",
      });
    }
    if (isNullOrUndefined(teacherPhoneNumber) || teacherPhoneNumber === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Phone Number",
      });
    }
    if (
      !validator.isLength(teacherPhoneNumber, 10, 11) ||
      teacherPhoneNumber.match(/^01/) === null
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Phone Number Format",
      });
    }
    if (isNullOrUndefined(teacherEmailAddress) || teacherEmailAddress === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Email Address",
      });
    }
    if (!validator.isEmail(teacherEmailAddress)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Email Address Format",
      });
    }
    if (isNullOrUndefined(homeAddress) || homeAddress === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Home Address",
      });
    }
    if (isNullOrUndefined(postcode) || postcode === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Postcode",
      });
    }
    if (
      !validator.isLength(postcode, 5, 5) ||
      postcode.match(/[^0-9]/) !== null
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Postcode",
      });
    }
    if (isNullOrUndefined(city) || city === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid City",
      });
    }
    if (isNullOrUndefined(state) || state === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid City",
      });
    }
    if (isNullOrUndefined(teacherPositionCode) || teacherPositionCode === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Position Code",
      });
    }
    if (
      isNullOrUndefined(teacherTypeStaffCode) ||
      teacherTypeStaffCode === ""
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Type Staff Code",
      });
    }
    if (isNullOrUndefined(salaryGrade) || salaryGrade === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Salary Grade",
      });
    }
    if (isNullOrUndefined(salary) || salary === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Salary",
      });
    }
    if (isNaN(parseInt(salary, 10))) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Salary",
      });
    }
    if (isNullOrUndefined(jpnFileCode) || jpnFileCode === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid JPN File Code",
      });
    }

    //everything is find then do update
    // if (isNullOrUndefined(uid) || isNaN(parseInt(uid, 10))) {
    //   return res.status(200).send({
    //     status: false,
    //     msg: "Invalid Teacher UID",
    //   });
    // }
    // const updateUid = uid;
    let selectedTeacher = await Teacher.findOne({
      _id: mongoose.Types.ObjectId(_id),
    });

    if (isNullOrUndefined(selectedTeacher)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Teacher",
      });
    }

    const checkIcNumber = await Teacher.countDocuments({
      icNumber: icNumber,
      _id: {
        $ne: mongoose.Types.ObjectId(_id),
      },
    });

    if (checkIcNumber > 0) {
      return res.status(200).send({
        status: false,
        msg: "IC Number already exist",
      });
    }

    //replace
    const checkPhoneNumber = await Teacher.countDocuments({
      teacherPhoneNumber: teacherPhoneNumber,
      _id: {
        $ne: mongoose.Types.ObjectId(_id),
      },
    });

    if (checkPhoneNumber > 0) {
      return res.status(200).send({
        status: false,
        msg: "Phone number already exist",
      });
    }

    const checkJpnFileCode = await Teacher.countDocuments({
      jpnFileCode: jpnFileCode,
      _id: {
        $ne: mongoose.Types.ObjectId(_id),
      },
    });
    if (checkJpnFileCode > 0) {
      return res.status(200).send({
        status: false,
        msg: "JPN File Code already exist",
      });
    }

    const checkEmailAddress = await Teacher.countDocuments({
      teacherEmailAddress: teacherEmailAddress,
      _id: {
        $ne: mongoose.Types.ObjectId(_id),
      },
    });

    if (checkEmailAddress > 0) {
      return res.status(200).send({
        status: false,
        msg: "Email address already exist",
      });
    }

    if (isNullOrUndefined(selectedTeacher)) {
      return res.status(200).send({
        status: false,
        msg: "Teacher not exist",
      });
    }

    await Teacher.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(_id),
      },
      {
        teacherName: teacherName,
        icNumber: icNumber,
        teacherSex: teacherSex,
        race: race,
        homeAddress: homeAddress,
        postcode: postcode,
        city: city,
        state: state,
        teacherPhoneNumber: teacherPhoneNumber,
        teacherEmailAddress: teacherEmailAddress,
        teacherPositionCode: teacherPositionCode,
        teacherTypeStaffCode: teacherTypeStaffCode,
        salaryGrade: salaryGrade,
        salary: salary,
        jpnFileCode: jpnFileCode,
      }
    );

    return res.status(200).send({
      status: true,
      msg: "Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function completeTeacher(req, res, next) {
  try {
    const { newTeacher, _id } = req.body;
    const {
      teacherName,
      icNumber,
      teacherSex,
      race,
      homeAddress,
      postcode,
      city,
      state,
      teacherEmailAddress,
      teacherPhoneNumber,
      teacherPositionCode,
      teacherTypeStaffCode,
      salaryGrade,
      salary,
      jpnFileCode,
    } = newTeacher;

    // because _id is not exisitng yet
    // const selectedTeacher = await Teacher.findOne({
    //   user: mongoose.Types.ObjectId(_id),
    // });

    // const teacherId = selectedTeacher._id;

    if (isNullOrUndefined(teacherName) || teacherName === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Teacher Name",
      });
    }
    if (isNullOrUndefined(icNumber) || icNumber === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid IC Number",
      });
    }
    //length !== 12 and number that are not FROM 0-9 exists
    if (
      !validator.isLength(icNumber, 12, 12) ||
      icNumber.match(/[^0-9]/ !== null)
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid IC Number Format",
      });
    }
    if (isNullOrUndefined(teacherSex) || teacherSex === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Teacher Gender",
      });
    }
    if (isNullOrUndefined(race) || race === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Race",
      });
    }
    if (isNullOrUndefined(teacherPhoneNumber) || teacherPhoneNumber === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Phone Number",
      });
    }
    if (
      !validator.isLength(teacherPhoneNumber, 10, 11) ||
      teacherPhoneNumber.match(/^01/) === null
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Phone Number Format",
      });
    }
    if (isNullOrUndefined(teacherEmailAddress) || teacherEmailAddress === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Email Address",
      });
    }
    if (!validator.isEmail(teacherEmailAddress)) {
      //check format
      return res.status(200).send({
        status: false,
        msg: "Invalid Email Address Format",
      });
    }
    if (isNullOrUndefined(homeAddress) || homeAddress === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Home Address",
      });
    }
    if (isNullOrUndefined(postcode) || postcode === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Postcode",
      });
    }
    if (
      !validator.isLength(postcode, 5, 5) ||
      postcode.match(/[^0-9]/) !== null
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Postcode",
      });
    }
    if (isNullOrUndefined(city) || city === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid City",
      });
    }
    if (isNullOrUndefined(state) || state === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid State",
      });
    }
    if (isNullOrUndefined(teacherPositionCode) || teacherPositionCode === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Position Code",
      });
    }
    if (
      isNullOrUndefined(teacherTypeStaffCode) ||
      teacherTypeStaffCode === ""
    ) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Type Staff Code",
      });
    }
    if (isNullOrUndefined(salaryGrade) || salaryGrade === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Salary Grade",
      });
    }
    if (isNullOrUndefined(salary) || salary === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid Salary",
      });
    }
    if (isNaN(parseInt(salary, 10))) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Salary",
      });
    }
    if (isNullOrUndefined(jpnFileCode) || jpnFileCode === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid JPN File Code",
      });
    }

    const checkIcNumber = await Teacher.countDocuments({
      icNumber: icNumber,
    });

    if (checkIcNumber > 0) {
      return res.status(200).send({
        status: false,
        msg: "IC Number already exist",
      });
    }

    const checkPhoneNumber = await Teacher.countDocuments({
      teacherPhoneNumber: teacherPhoneNumber,
    });

    if (checkPhoneNumber > 0) {
      return res.status(200).send({
        status: false,
        msg: "Phone number already exist",
      });
    }

    const checkJpnFileCode = await Teacher.countDocuments({
      jpnFileCode: jpnFileCode,
    });

    if (checkJpnFileCode > 0) {
      return res.status(200).send({
        status: false,
        msg: "JPN File Code already exist",
      });
    }

    const checkEmailAddress = await Teacher.countDocuments({
      teacherEmailAddress: teacherEmailAddress,
    });

    if (checkEmailAddress > 0) {
      return res.status(200).send({
        status: false,
        msg: "Email address already exist",
      });
    }

    const teacherObject = {
      user: mongoose.Types.ObjectId(_id),
      teacherName: teacherName,
      icNumber: icNumber,
      teacherSex: teacherSex,
      race: race,
      homeAddress: homeAddress,
      postcode: postcode,
      city: city,
      state: state,
      teacherEmailAddress: teacherEmailAddress,
      teacherPositionCode: teacherPositionCode,
      teacherTypeStaffCode: teacherTypeStaffCode,
      teacherPhoneNumber: teacherPhoneNumber,
      salaryGrade: salaryGrade,
      salary: parseInt(salary, 10),
      jpnFileCode: jpnFileCode,
    };

    await Teacher.create(teacherObject);

    //then update the user account status to 1
    await User.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(_id),
      },
      {
        status: 1,
      }
    );

    return res.status(200).send({
      status: true,
      msg: "Information completed successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function getOneTeacher(req, res, next) {
  try {
    const { _id } = req.body;
    // if (isNullOrUndefined(userUid) || userUid === "") {
    //   return res.status(200).send({
    //     status: false,
    //     msg: "Invalid UID",
    //   });
    // }

    // let teacherUser = await User.findOne({
    //   _id: mongoose.Types.ObjectId(_id),
    // });

    // let userId = teacherUser._id;
    // const teacher = await Teacher.findOne({
    //   user: mongoose.Types.ObjectId(_id),
    // });

    const teacherInfo = await Teacher.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(_id),
        },
      },
      {
        $project: {
          _id: 1,
          icNumber: 1,
          listOfInvigilatorExperience: 1,
          race: 1,
          postcode: 1,
          city: 1,
          state: 1,
          teacherName: 1,
          teacherSex: 1,
          teacherEmailAddress: 1,
          teacherPhoneNumber: 1,
          homeAddress: 1,
          salaryGrade: 1,
          salary: 1,
          jpnFileCode: 1,
          teacherTypeStaffCode: 1,
          teacherPositionCode: 1,
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      msg: "Retrieved succesfully",
      teacher: teacherInfo,
    });

    // const
  } catch (err) {
    next(err);
  }
}
