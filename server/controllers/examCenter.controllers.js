import ExamCenter from "../models/examCenter.js";
import School from "../models/school.js";

export async function getExamCenters(req, res, next) {
  try {
    const { school } = req.body;

    const selectedSchool = await School.findOne({
      _id: school,
    });

    const examCenterIdArr = [];
    selectedSchool.examCenters.map((ec) => {
      examCenterIdArr.push(ec);
    });

    const examCenterList = await ExamCenter.find({
      _id: { $in: examCenterIdArr },
    }).populate({
      path: "assignmentTasks",
    });

    return res.status(200).send({
      status: true,
      msg: "Successful",
      examCenterList: examCenterList,
    });
  } catch (err) {
    next(err);
  }
}
