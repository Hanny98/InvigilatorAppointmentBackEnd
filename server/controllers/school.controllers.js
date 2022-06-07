import School from "../models/school.js";
import { isNullOrUndefined } from "../util/validationHelper.js";
import validator from "validator";
import mongoose from "mongoose";

export async function getSchool(req, res, next) {
  try {
    const { school } = req.body;
    if (isNullOrUndefined(school) || school === "") {
      return res.status(200).send({
        status: false,
        msg: "Invalid school",
      });
    }

    const selectedSchool = await School.findOne({
      _id: school,
    });

    let queryCondition = {};
    Object.assign(queryCondition, {
      schoolName: selectedSchool.schoolName,
    });

    const schoolInfo = await School.aggregate([
      {
        $match: queryCondition,
      },
      {
        $project: {
          _id: 1,
          schoolCode: 1,
          schoolName: 1,
          district: 1,
          schoolAddress: 1,
          postcode: 1,
          city: 1,
          stateCode: 1,
          areaCode: 1,
          schoolPhoneNumber: 1,
          schoolEmailAddress: 1,
          typeOfSchool: 1,
          codeDun: 1,
          codeParlimen: 1,
          taxNumber: 1,
        },
      },
    ]);

    return res.status(200).send({
      status: true,
      msg: "RETRIEVE_SUCCESSFUL",
      school: schoolInfo,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSchool(req, res, next) {
  try {
    const { school } = req.body;
    const {
      schoolCode,
      schoolName,
      district,
      schoolAddress,
      postcode,
      city,
      stateCode,
      areaCode,
      schoolPhoneNumber,
      taxNumber,
      codeDun,
      codeParlimen,
      typeOfSchool,
      schoolEmailAddress,
      _id,
    } = school;

    if (isNullOrUndefined(schoolCode)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid School Code",
      });
    }
    if (isNullOrUndefined(schoolName)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid School Name",
      });
    }
    if (isNullOrUndefined(district)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid District",
      });
    }
    if (isNullOrUndefined(schoolAddress)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid School Address",
      });
    }
    if (isNullOrUndefined(postcode)) {
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
    if (isNullOrUndefined(city)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid City",
      });
    }
    if (isNullOrUndefined(stateCode)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Code State",
      });
    }
    if (isNullOrUndefined(areaCode)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Code Area",
      });
    }
    if (isNullOrUndefined(schoolPhoneNumber)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Phone Number",
      });
    }
    if (
      !validator.isLength(schoolPhoneNumber, 10, 11) ||
      schoolPhoneNumber.match(/^01/) === null
    ) {
      return res.json({
        status: false,
        msg: "Invalid Phone Number Format",
      });
    }
    if (isNullOrUndefined(taxNumber)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Tax Number",
      });
    }
    if (
      !validator.isLength(taxNumber, 10, 11) ||
      taxNumber.match(/^01/) === null
    ) {
      return res.json({
        status: false,
        msg: "Invalid Tax Number Format",
      });
    }
    if (isNullOrUndefined(codeDun)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Code Dun",
      });
    }
    if (isNullOrUndefined(codeParlimen)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Code Parlimen",
      });
    }
    if (isNullOrUndefined(typeOfSchool)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid Type Of School",
      });
    }
    if (isNullOrUndefined(schoolEmailAddress)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid School Email Address",
      });
    }
    if (!validator.isEmail(schoolEmailAddress)) {
      return res.status(200).send({
        status: false,
        msg: "Invalid School Address Format",
      });
    }

    const currentSchool = await School.findOne({
      _id: mongoose.Types.ObjectId(_id),
    });

    const repeatSchoolName = await School.countDocuments({
      schoolName: schoolName,
      _id: {
        $ne: mongoose.Types.ObjectId(_id),
      },
    });

    if (repeatSchoolName > 0) {
      return res.status(200).send({
        status: false,
        msg: "School Name Already Exist",
      });
    }

    const schoolUpdate = await School.findByIdAndUpdate(
      { _id: currentSchool._id },
      {
        schoolCode: schoolCode,
        schoolName: schoolName,
        district: district,
        schoolAddress: schoolAddress,
        postcode: postcode,
        city: city,
        stateCode: stateCode,
        areaCode: areaCode,
        schoolPhoneNumber: schoolPhoneNumber,
        taxNumber: taxNumber,
        codeDun: codeDun,
        codeParlimen: codeParlimen,
        typeOfSchool: typeOfSchool,
        schoolEmailAddress: schoolEmailAddress,
      }
    );

    return res.status(200).send({
      status: true,
      msg: "School Updated Successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function getSchoolList(req, res, next) {
  try {
    const queryCondition = [];
    queryCondition.push({
      schoolCode: {
        $exists: true,
      },
    });
    const schoolList = await School.aggregate([
      {
        $match: {
          $and: queryCondition,
        },
      },
      {
        $project: {
          _id: 1,
          schoolName: 1,
        },
      },
    ]);
    return res.status(200).send({
      status: true,
      msg: "Retrieved school successfully",
      schoolList: schoolList,
    });
  } catch (err) {
    next(err);
  }
}
