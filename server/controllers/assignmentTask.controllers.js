import School from "../models/school.js";
import AssignmentTask from "../models/assignmentTask.js";
import ExamCenter from "../models/examCenter.js";
import moment from "moment";
import { checkSkipLimit } from "../util/common.js";

export async function getAssignmentTasks(req, res, next) {
  try {
    const { skip, limit } = checkSkipLimit(req);
    const { code } = req.body;

    const examCenterSelected = await ExamCenter.findOne({
      examCenterCode: code,
    }).populate({
      path: "assignmentTasks",
    });

    const examCenterValidAssignmentTask = [];

    const currentDate = new Date();

    const current = moment(currentDate).format("YYYY-MM-DD");

    examCenterSelected.assignmentTasks.map((assignmentTask) => {
      if (
        moment(new Date(assignmentTask.collectionDate)).format("YYYY-MM-DD") >
        current
      ) {
        assignmentTask.collectionStatus.map((collectionStatus) => {
          if (
            collectionStatus.examCenter.toString() ===
            examCenterSelected._id.toString()
          ) {
            if (
              collectionStatus.status === "Incomplete" ||
              collectionStatus.status === "Pending"
            ) {
              examCenterValidAssignmentTask.push({
                ...assignmentTask._doc,
                selectedExamCenterAssignmentTaskSatus: collectionStatus.status,
              });

              return;
            }
          }
        });
      }
    });

    const arr = [];
    arr.push({
      ...examCenterSelected._doc,
      validTasks: examCenterValidAssignmentTask,
    });

    //before slicing got 2
    const assignmentTaskCount = arr[0].validTasks.length;

    let sliced = arr[0].validTasks;
    //after sliced left 1
    sliced = arr[0].validTasks.slice(skip, skip + limit);
    return res.status(200).send({
      status: true,
      msg: "Success",
      assignmentTaskCount: assignmentTaskCount,
      validTasks: sliced,
    });
  } catch (err) {
    next(err);
  }
}

/* get pending list only */
export async function getPrincipalAssignmentTasks(req, res, next) {
  try {
    const { skip, limit } = checkSkipLimit(req);
    const { code } = req.body;

    const examCenterSelected = await ExamCenter.findOne({
      examCenterCode: code,
    }).populate({
      path: "assignmentTasks",
    });

    const examCenterValidAssignmentTask = [];

    const currentDate = new Date();

    const current = moment(currentDate).format("YYYY-MM-DD");

    examCenterSelected.assignmentTasks.map((assignmentTask) => {
      if (
        moment(new Date(assignmentTask.collectionDate)).format("YYYY-MM-DD") >
        current
      ) {
        assignmentTask.collectionStatus.map((collectionStatus) => {
          if (
            collectionStatus.examCenter.toString() ===
            examCenterSelected._id.toString()
          ) {
            if (collectionStatus.status === "Pending") {
              examCenterValidAssignmentTask.push({
                ...assignmentTask._doc,
                selectedExamCenterAssignmentTaskSatus: collectionStatus.status,
              });

              return;
            }
          }
        });
      }
    });

    const arr = [];
    arr.push({
      ...examCenterSelected._doc,
      validTasks: examCenterValidAssignmentTask,
    });

    //before slicing got 2
    const assignmentTaskCount = arr[0].validTasks.length;

    let sliced = arr[0].validTasks;
    //after sliced left 1
    sliced = arr[0].validTasks.slice(skip, skip + limit);
    return res.status(200).send({
      status: true,
      msg: "Success",
      assignmentTaskCount: assignmentTaskCount,
      validTasks: sliced,
    });
  } catch (err) {
    next(err);
  }
}
/* get approved list only */
export async function getApprovedAssignmentTasks(req, res, next) {
  try {
    const { skip, limit } = checkSkipLimit(req);
    const { code } = req.body;

    const examCenterSelected = await ExamCenter.findOne({
      examCenterCode: code,
    }).populate({
      path: "assignmentTasks",
    });

    const examCenterValidAssignmentTask = [];

    const currentDate = new Date();

    const current = moment(currentDate).format("YYYY-MM-DD");

    examCenterSelected.assignmentTasks.map((assignmentTask) => {
      if (
        moment(new Date(assignmentTask.collectionDate)).format("YYYY-MM-DD") >
        current
      ) {
        assignmentTask.collectionStatus.map((collectionStatus) => {
          if (
            collectionStatus.examCenter.toString() ===
            examCenterSelected._id.toString()
          ) {
            if (collectionStatus.status === "Completed") {
              examCenterValidAssignmentTask.push({
                ...assignmentTask._doc,
                selectedExamCenterAssignmentTaskSatus: collectionStatus.status,
              });

              return;
            }
          }
        });
      }
    });

    const arr = [];
    arr.push({
      ...examCenterSelected._doc,
      validTasks: examCenterValidAssignmentTask,
    });

    //before slicing got 2
    const assignmentTaskCount = arr[0].validTasks.length;

    let sliced = arr[0].validTasks;
    //after sliced left 1
    sliced = arr[0].validTasks.slice(skip, skip + limit);
    return res.status(200).send({
      status: true,
      msg: "Success",
      assignmentTaskCount: assignmentTaskCount,
      validTasks: sliced,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAssignmentTasksCount(req, res, next) {
  try {
    const { skip, limit } = checkSkipLimit(req);
    const { school } = req.body;

    // const { school } = req.body;

    const selectedSchool = await School.findOne({
      _id: school,
    });

    const examCenterIdArr = [];
    selectedSchool.examCenters.map((ec) => {
      examCenterIdArr.push(ec);
    });

    const examCenterList = await ExamCenter.find({
      _id: { $in: examCenterIdArr },
    });

    let arr = [];
    for (const x in examCenterList) {
      arr.push({
        code: examCenterList[x].examCenterCode,
      });
    }
    arr = await Promise.all(
      arr.map((item) => {
        return new Promise(async (resolve, reject) => {
          let incompleteCount = 0;
          let pendingCount = 0;
          const examCenterSelected = await ExamCenter.findOne({
            examCenterCode: item.code,
          }).populate({
            path: "assignmentTasks",
          });
          const currentDate = new Date();

          const current = moment(currentDate).format("YYYY-MM-DD");

          examCenterSelected.assignmentTasks.map((assignmentTask) => {
            if (
              moment(new Date(assignmentTask.collectionDate)).format(
                "YYYY-MM-DD"
              ) > current
            ) {
              assignmentTask.collectionStatus.map((collectionStatus) => {
                if (
                  collectionStatus.examCenter.toString() ===
                  examCenterSelected._id.toString()
                ) {
                  if (collectionStatus.status === "Incomplete") {
                    ++incompleteCount;

                    return;
                  }
                  if (collectionStatus.status === "Pending") {
                    ++pendingCount;

                    return;
                  }
                }
              });
            }
          });

          resolve({
            code: item.code,
            count: [incompleteCount, pendingCount],
          });
        });
      })
    );

    return res.status(200).send({
      status: true,
      msg: "Success",
      arr: arr,
    });
  } catch (err) {
    next(err);
  }
}
export async function getPrincipalAssignmentTasksCount(req, res, next) {
  try {
    const { skip, limit } = checkSkipLimit(req);
    const { school } = req.body;

    // const { school } = req.body;

    const selectedSchool = await School.findOne({
      _id: school,
    });

    const examCenterIdArr = [];
    selectedSchool.examCenters.map((ec) => {
      examCenterIdArr.push(ec);
    });

    const examCenterList = await ExamCenter.find({
      _id: { $in: examCenterIdArr },
    });

    let arr = [];
    for (const x in examCenterList) {
      arr.push({
        code: examCenterList[x].examCenterCode,
      });
    }
    arr = await Promise.all(
      arr.map((item) => {
        return new Promise(async (resolve, reject) => {
          let incompleteCount = 0;
          let pendingCount = 0;
          const examCenterSelected = await ExamCenter.findOne({
            examCenterCode: item.code,
          }).populate({
            path: "assignmentTasks",
          });
          const currentDate = new Date();

          const current = moment(currentDate).format("YYYY-MM-DD");

          examCenterSelected.assignmentTasks.map((assignmentTask) => {
            if (
              moment(new Date(assignmentTask.collectionDate)).format(
                "YYYY-MM-DD"
              ) > current
            ) {
              assignmentTask.collectionStatus.map((collectionStatus) => {
                if (
                  collectionStatus.examCenter.toString() ===
                  examCenterSelected._id.toString()
                ) {
                  if (collectionStatus.status === "Pending") {
                    ++pendingCount;

                    return;
                  }
                }
              });
            }
          });

          resolve({
            code: item.code,
            count: [pendingCount],
          });
        });
      })
    );

    return res.status(200).send({
      status: true,
      msg: "Success",
      arr: arr,
    });
  } catch (err) {
    next(err);
  }
}
