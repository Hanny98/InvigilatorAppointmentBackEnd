import School from "../models/school.js";
import AssignmentTask from "../models/assignmentTask.js";
import ExamCenter from "../models/examCenter.js";
import ExamCenterData from "../models/examCenterData.js";
import Teacher from "../models/teacher.js";
import mongoose from "mongoose";

export async function getExamCenterData(req, res, next) {
  try {
    const { assignmentTaskId, selectedExamCenter } = req.body;

    const selectedEc = await ExamCenter.findOne({
      examCenterCode: selectedExamCenter,
    });

    const selectedEcId = selectedEc._id;

    //get the exam center data
    const selectedExamCenterData = await ExamCenterData.findOne({
      examCenter: mongoose.Types.ObjectId(selectedEcId),
      assignmentTaskID: mongoose.Types.ObjectId(assignmentTaskId),
    });

    //convert every list to teacher name and position
    let updatedExamCenterData = selectedExamCenterData;

    let chiefInvigilatorList = [];
    if (selectedExamCenterData.listChiefInvigilatorRequired.length > 0) {
      chiefInvigilatorList =
        selectedExamCenterData.listChiefInvigilatorRequired;

      chiefInvigilatorList = await Promise.all(
        chiefInvigilatorList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                position: "Chief Invigilator",
              });
            });
          });
        })
      );
    }

    let viceChiefInvigilatorList = [];
    if (selectedExamCenterData.listViceChiefInvigilatorRequired.length > 0) {
      viceChiefInvigilatorList =
        selectedExamCenterData.listViceChiefInvigilatorRequired;

      viceChiefInvigilatorList = await Promise.all(
        viceChiefInvigilatorList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                position: "Vice Chief Invigilator",
              });
            });
          });
        })
      );
    }

    let environmentalList = [];
    if (selectedExamCenterData.listEnvironmentalSupervisorRequired.length > 0) {
      environmentalList =
        selectedExamCenterData.listEnvironmentalSupervisorRequired;

      environmentalList = await Promise.all(
        environmentalList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                position: "Environmental Supervisor",
              });
            });
          });
        })
      );
    }
    let roomKeeperList = [];
    if (selectedExamCenterData.listRoomKeeperRequired.length > 0) {
      roomKeeperList = selectedExamCenterData.listRoomKeeperRequired;

      roomKeeperList = await Promise.all(
        roomKeeperList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                position: "Room Keeper",
              });
            });
          });
        })
      );
    }
    let invigilatorList = [];
    if (selectedExamCenterData.listInvigilatorRequired.length > 0) {
      invigilatorList = selectedExamCenterData.listInvigilatorRequired;

      invigilatorList = await Promise.all(
        invigilatorList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                position: "Invigilator",
              });
            });
          });
        })
      );
    }
    let reserveredInviList = [];
    if (selectedExamCenterData.listReservedInvigilatorRequired.length > 0) {
      reserveredInviList =
        selectedExamCenterData.listReservedInvigilatorRequired;

      reserveredInviList = await Promise.all(
        reserveredInviList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                position: "Reserved Invigilator",
              });
            });
          });
        })
      );
    }

    const finalList = [
      ...chiefInvigilatorList,
      ...viceChiefInvigilatorList,
      ...environmentalList,
      ...roomKeeperList,
      ...invigilatorList,
      ...reserveredInviList,
    ];

    let filteredExamCenterData = {};
    filteredExamCenterData = {
      ...selectedExamCenterData._doc,
      teacherList: finalList,
    };

    return res.status(200).send({
      status: true,
      msg: "Retrieved Exam Center Data successfully",
      examCenterData: filteredExamCenterData,
    });
  } catch (err) {
    next(err);
  }
}

export async function submitExamCenterData(req, res, next) {
  try {
    const {
      newExamCenterData,
      selectedTeacherList,
      selectedAssignmentTask,
      selectedExamCenter,
    } = req.body;

    //convert the teacher list to list of id and push them to respective array
    let updatedTeacherList = selectedTeacherList;
    updatedTeacherList = await Promise.all(
      selectedTeacherList.map((teacher) => {
        return new Promise(async (resolve, reject) => {
          const selectedTeacher = await Teacher.findOne({
            teacherName: teacher.teacherName,
          });
          const teacherId = selectedTeacher._id;
          resolve({
            ...teacher,
            teacherId: teacherId,
          });
        });
      })
    );

    let listChiefInvigilatorRequired = [];
    let listViceChiefInvigilatorRequired = [];
    let listEnvironmentalSupervisorRequired = [];
    let listRoomKeeperRequired = [];
    let listInvigilatorRequired = [];
    let listReservedInvigilatorRequired = [];

    updatedTeacherList.forEach((updatedTeacher) => {
      if (updatedTeacher.position === "Chief Invigilator") {
        listChiefInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Vice Chief Invigilator") {
        listViceChiefInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Environmental Supervisor") {
        listEnvironmentalSupervisorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Room Keeper") {
        listRoomKeeperRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Invigilator") {
        listInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Reserved Invigilator") {
        listReservedInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
    });

    const selectedAt = await AssignmentTask.findOne({
      _id: mongoose.Types.ObjectId(selectedAssignmentTask),
    });

    const selectedEc = await ExamCenter.findOne({
      examCenterCode: selectedExamCenter,
    });

    const selectedEcId = selectedEc._id;
    //create exam center data
    const examCenterDataObject = {
      examCenter: selectedEcId,
      assignmentTaskID: mongoose.Types.ObjectId(selectedAssignmentTask),
      roomAvailable: parseInt(newExamCenterData.roomAvailable, 10),
      hallAvailable: parseInt(newExamCenterData.hallAvailable, 10),
      roomCandidateNumber: parseInt(newExamCenterData.roomCandidateNumber, 10),
      specialRoomAvailable: parseInt(
        newExamCenterData.specialRoomAvailable,
        10
      ),
      specialRoomCandidateNumber: parseInt(
        newExamCenterData.specialRoomCandidateNumber,
        10
      ),
      hallCandidateNumber: parseInt(newExamCenterData.hallCandidateNumber, 10),
      numberOfChiefInvigilatorRequired:
        newExamCenterData.numberOfChiefInvigilatorRequired,
      numberOfViceChiefInvigilatorRequired:
        newExamCenterData.numberOfViceChiefInvigilatorRequired,
      numberOfEnvironmentalSupervisorRequired:
        newExamCenterData.numberOfEnvironmentalSupervisorRequired,
      numberOfRoomKeeperRequired: newExamCenterData.numberOfRoomKeeperRequired,
      numberOfInvigilatorRequired:
        newExamCenterData.numberOfInvigilatorRequired,
      numberOfReservedInvigilatorRequired:
        newExamCenterData.numberOfReservedInvigilatorRequired,
      listChiefInvigilatorRequired: listChiefInvigilatorRequired,
      listViceChiefInvigilatorRequired: listViceChiefInvigilatorRequired,
      listEnvironmentalSupervisorRequired: listEnvironmentalSupervisorRequired,
      listRoomKeeperRequired: listRoomKeeperRequired,
      listInvigilatorRequired: listInvigilatorRequired,
      listReservedInvigilatorRequired: listReservedInvigilatorRequired,
    };

    await ExamCenterData.create(examCenterDataObject);

    //

    // update the collection status to  "Pending"

    await AssignmentTask.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(selectedAssignmentTask),
        "collectionStatus.examCenter": mongoose.Types.ObjectId(selectedEcId),
      },
      {
        "collectionStatus.$.status": "Pending",
      }
    );

    //update the status of collectionStatus in AssignmentTask
    return res.status(200).send({
      status: true,
      msg: "Exam Center Data submitted successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function updateExamCenterData(req, res, next) {
  try {
    const {
      currentExamCenterData,
      currentSelectedTeacherList,
      selectedAssignmentTask,
      selectedExamCenter,
    } = req.body;

    //convert the teacher list to list of id and push them to respective array
    let updatedTeacherList = currentSelectedTeacherList;
    updatedTeacherList = await Promise.all(
      currentSelectedTeacherList.map((teacher) => {
        return new Promise(async (resolve, reject) => {
          const selectedTeacher = await Teacher.findOne({
            teacherName: teacher.teacherName,
          });
          const teacherId = selectedTeacher._id;
          resolve({
            ...teacher,
            teacherId: teacherId,
          });
        });
      })
    );

    let listChiefInvigilatorRequired = [];
    let listViceChiefInvigilatorRequired = [];
    let listEnvironmentalSupervisorRequired = [];
    let listRoomKeeperRequired = [];
    let listInvigilatorRequired = [];
    let listReservedInvigilatorRequired = [];

    updatedTeacherList.forEach((updatedTeacher) => {
      if (updatedTeacher.position === "Chief Invigilator") {
        listChiefInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Vice Chief Invigilator") {
        listViceChiefInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Environmental Supervisor") {
        listEnvironmentalSupervisorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Room Keeper") {
        listRoomKeeperRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Invigilator") {
        listInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
      if (updatedTeacher.position === "Reserved Invigilator") {
        listReservedInvigilatorRequired.push(
          mongoose.Types.ObjectId(updatedTeacher.teacherId)
        );
      }
    });

    const selectedEc = await ExamCenter.findOne({
      examCenterCode: selectedExamCenter,
    });

    const selectedEcId = selectedEc._id;

    //update object
    // const examCenterDataObject = {
    //   // examCenter: selectedEcId,
    //   // assignmentTaskID: mongoose.Types.ObjectId(selectedAssignmentTask),
    //   roomAvailable: parseInt(currentExamCenterData.roomAvailable, 10),
    //   hallAvailable: parseInt(currentExamCenterData.hallAvailable, 10),
    //   roomCandidateNumber: parseInt(
    //     currentExamCenterData.roomCandidateNumber,
    //     10
    //   ),
    //   specialRoomAvailable: parseInt(
    //     currentExamCenterData.specialRoomAvailable,
    //     10
    //   ),
    //   specialRoomCandidateNumber: parseInt(
    //     currentExamCenterData.specialRoomCandidateNumber,
    //     10
    //   ),
    //   hallCandidateNumber: parseInt(
    //     currentExamCenterData.hallCandidateNumber,
    //     10
    //   ),
    //   numberOfChiefInvigilatorRequired:
    //     currentExamCenterData.numberOfChiefInvigilatorRequired,
    //   numberOfViceChiefInvigilatorRequired:
    //     currentExamCenterData.numberOfViceChiefInvigilatorRequired,
    //   numberOfEnvironmentalSupervisorRequired:
    //     currentExamCenterData.numberOfEnvironmentalSupervisorRequired,
    //   numberOfRoomKeeperRequired:
    //     currentExamCenterData.numberOfRoomKeeperRequired,
    //   numberOfInvigilatorRequired:
    //     currentExamCenterData.numberOfInvigilatorRequired,
    //   numberOfReservedInvigilatorRequired:
    //     currentExamCenterData.numberOfReservedInvigilatorRequired,
    //   listChiefInvigilatorRequired: listChiefInvigilatorRequired,
    //   listViceChiefInvigilatorRequired: listViceChiefInvigilatorRequired,
    //   listEnvironmentalSupervisorRequired: listEnvironmentalSupervisorRequired,
    //   listRoomKeeperRequired: listRoomKeeperRequired,
    //   listInvigilatorRequired: listInvigilatorRequired,
    //   listReservedInvigilatorRequired: listReservedInvigilatorRequired,
    // };

    await ExamCenterData.findOneAndUpdate(
      {
        examCenter: selectedEcId,
        assignmentTaskID: mongoose.Types.ObjectId(selectedAssignmentTask),
      },
      {
        roomAvailable: parseInt(currentExamCenterData.roomAvailable, 10),
        hallAvailable: parseInt(currentExamCenterData.hallAvailable, 10),
        roomCandidateNumber: parseInt(
          currentExamCenterData.roomCandidateNumber,
          10
        ),
        specialRoomAvailable: parseInt(
          currentExamCenterData.specialRoomAvailable,
          10
        ),
        specialRoomCandidateNumber: parseInt(
          currentExamCenterData.specialRoomCandidateNumber,
          10
        ),
        hallCandidateNumber: parseInt(
          currentExamCenterData.hallCandidateNumber,
          10
        ),
        numberOfChiefInvigilatorRequired:
          currentExamCenterData.numberOfChiefInvigilatorRequired,
        numberOfViceChiefInvigilatorRequired:
          currentExamCenterData.numberOfViceChiefInvigilatorRequired,
        numberOfEnvironmentalSupervisorRequired:
          currentExamCenterData.numberOfEnvironmentalSupervisorRequired,
        numberOfRoomKeeperRequired:
          currentExamCenterData.numberOfRoomKeeperRequired,
        numberOfInvigilatorRequired:
          currentExamCenterData.numberOfInvigilatorRequired,
        numberOfReservedInvigilatorRequired:
          currentExamCenterData.numberOfReservedInvigilatorRequired,
        listChiefInvigilatorRequired: listChiefInvigilatorRequired,
        listViceChiefInvigilatorRequired: listViceChiefInvigilatorRequired,
        listEnvironmentalSupervisorRequired:
          listEnvironmentalSupervisorRequired,
        listRoomKeeperRequired: listRoomKeeperRequired,
        listInvigilatorRequired: listInvigilatorRequired,
        listReservedInvigilatorRequired: listReservedInvigilatorRequired,
      }
    );

    //check the examCenterData status, if needed
    return res.status(200).send({
      status: true,
      msg: "Exam Center Data updated successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function reviewExamCenterData(req, res, next) {
  try {
    const { decision, selectedAssignmentTask, selectedExamCenter } = req.body;

    const selectedEc = await ExamCenter.findOne({
      examCenterCode: selectedExamCenter,
    });

    const selectedEcId = selectedEc._id;

    let review = "";
    let msg = "";

    if (decision === "approve") {
      review = "Completed";
      msg = "Assignment task of current Exam Center has been approved";
    } else {
      review = "Incomplete";
      msg = "Assignment task of current Exam Center has been rejected";
    }

    //update the collection status in the assignmenttask
    await AssignmentTask.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(selectedAssignmentTask),
        "collectionStatus.examCenter": mongoose.Types.ObjectId(selectedEcId),
      },
      {
        "collectionStatus.$.status": review,
      }
    );

    const currentExamCenterData = await ExamCenterData.findOne({
      examCenter: mongoose.Types.ObjectId(selectedEcId),
      assignmentTaskID: mongoose.Types.ObjectId(selectedAssignmentTask),
    });

    const idCurrentExamCenterData = currentExamCenterData._id;

    //add the examCenterData object id into the assignment task
    if (review === "Completed") {
      await AssignmentTask.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(selectedAssignmentTask),
        },
        {
          $push: { examCenterData: idCurrentExamCenterData },
        }
      );
    }

    //if reject, destroy the exam center data
    //need to clear the exam center data instead of destroying it
    //or i update the status to rejected,
    else {
      // const emptyExamCenterObject = {
      //   // examCenter: selectedEcId,
      //   // assignmentTaskID: mongoose.Types.ObjectId(selectedAssignmentTask),
      //   roomAvailable: 0,
      //   hallAvailable: 0,
      //   roomCandidateNumber: 0,
      //   specialRoomAvailable: 0,
      //   specialRoomCandidateNumber: 0,
      //   hallCandidateNumber: 0,
      //   numberOfChiefInvigilatorRequired: 0,
      //   numberOfViceChiefInvigilatorRequired: 0,
      //   numberOfEnvironmentalSupervisorRequired: 0,
      //   numberOfRoomKeeperRequired: 0,
      //   numberOfInvigilatorRequired: 0,
      //   numberOfReservedInvigilatorRequired: 0,
      //   listChiefInvigilatorRequired: 0,
      //   listViceChiefInvigilatorRequired: 0,
      //   listEnvironmentalSupervisorRequired: 0,
      //   listRoomKeeperRequired: 0,
      //   listInvigilatorRequired: 0,
      //   listReservedInvigilatorRequired: 0,
      // };
      // await ExamCenterData.findOneAndUpdate(
      //   {
      //     _id: idCurrentExamCenterData,
      //   },
      //   {
      //     emptyExamCenterObject,
      //   }
      // );
      await ExamCenterData.remove({
        _id: idCurrentExamCenterData,
      });
    }

    return res.status(200).send({
      status: true,
      msg: msg,
    });
  } catch (err) {
    next(err);
  }
}

export async function getExamCenterDataForReport(req, res, next) {
  try {
    const { assignmentTaskId, selectedExamCenter } = req.body;

    const selectedEc = await ExamCenter.findOne({
      examCenterCode: selectedExamCenter,
    });

    const selectedEcId = selectedEc._id;

    //get the exam center data
    const selectedExamCenterData = await ExamCenterData.findOne({
      examCenter: mongoose.Types.ObjectId(selectedEcId),
      assignmentTaskID: mongoose.Types.ObjectId(assignmentTaskId),
    });

    //convert every list to teacher name and position
    let updatedExamCenterData = selectedExamCenterData;

    let chiefInvigilatorList = [];
    if (selectedExamCenterData.listChiefInvigilatorRequired.length > 0) {
      chiefInvigilatorList =
        selectedExamCenterData.listChiefInvigilatorRequired;

      chiefInvigilatorList = await Promise.all(
        chiefInvigilatorList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                icNumber: result.icNumber,
                teacherPhoneNumber: result.teacherPhoneNumber,
                teacherSex: result.teacherSex,
                homeAddress: result.homeAddress,
                city: result.city,
                postcode: result.postcode,
                position: "Chief Invigilator",
              });
            });
          });
        })
      );
    }

    let viceChiefInvigilatorList = [];
    if (selectedExamCenterData.listViceChiefInvigilatorRequired.length > 0) {
      viceChiefInvigilatorList =
        selectedExamCenterData.listViceChiefInvigilatorRequired;

      viceChiefInvigilatorList = await Promise.all(
        viceChiefInvigilatorList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                icNumber: result.icNumber,
                teacherPhoneNumber: result.teacherPhoneNumber,
                teacherSex: result.teacherSex,
                homeAddress: result.homeAddress,
                city: result.city,
                postcode: result.postcode,
                position: "Vice Chief Invigilator",
              });
            });
          });
        })
      );
    }

    let environmentalList = [];
    if (selectedExamCenterData.listEnvironmentalSupervisorRequired.length > 0) {
      environmentalList =
        selectedExamCenterData.listEnvironmentalSupervisorRequired;

      environmentalList = await Promise.all(
        environmentalList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                icNumber: result.icNumber,
                teacherPhoneNumber: result.teacherPhoneNumber,
                teacherSex: result.teacherSex,
                homeAddress: result.homeAddress,
                city: result.city,
                postcode: result.postcode,
                position: "Environmental Supervisor",
              });
            });
          });
        })
      );
    }
    let roomKeeperList = [];
    if (selectedExamCenterData.listRoomKeeperRequired.length > 0) {
      roomKeeperList = selectedExamCenterData.listRoomKeeperRequired;

      roomKeeperList = await Promise.all(
        roomKeeperList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                icNumber: result.icNumber,
                teacherPhoneNumber: result.teacherPhoneNumber,
                teacherSex: result.teacherSex,
                homeAddress: result.homeAddress,
                city: result.city,
                postcode: result.postcode,
                position: "Room Keeper",
              });
            });
          });
        })
      );
    }
    let invigilatorList = [];
    if (selectedExamCenterData.listInvigilatorRequired.length > 0) {
      invigilatorList = selectedExamCenterData.listInvigilatorRequired;

      invigilatorList = await Promise.all(
        invigilatorList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                icNumber: result.icNumber,
                teacherPhoneNumber: result.teacherPhoneNumber,
                teacherSex: result.teacherSex,
                homeAddress: result.homeAddress,
                city: result.city,
                postcode: result.postcode,
                position: "Invigilator",
              });
            });
          });
        })
      );
    }
    let reserveredInviList = [];
    if (selectedExamCenterData.listReservedInvigilatorRequired.length > 0) {
      reserveredInviList =
        selectedExamCenterData.listReservedInvigilatorRequired;

      reserveredInviList = await Promise.all(
        reserveredInviList.map((teacherId) => {
          return new Promise(async (resolve, reject) => {
            await Teacher.findOne({
              _id: mongoose.Types.ObjectId(teacherId),
            }).then((result) => {
              resolve({
                teacherName: result.teacherName,
                icNumber: result.icNumber,
                teacherPhoneNumber: result.teacherPhoneNumber,
                teacherSex: result.teacherSex,
                homeAddress: result.homeAddress,
                city: result.city,
                postcode: result.postcode,
                position: "Reserved Invigilator",
              });
            });
          });
        })
      );
    }

    const finalList = [
      ...chiefInvigilatorList,
      ...viceChiefInvigilatorList,
      ...environmentalList,
      ...roomKeeperList,
      ...invigilatorList,
      ...reserveredInviList,
    ];

    let filteredExamCenterData = {};
    filteredExamCenterData = {
      ...selectedExamCenterData._doc,
      teacherList: finalList,
    };

    return res.status(200).send({
      status: true,
      msg: "Retrieved Exam Center Data successfully",
      examCenterData: filteredExamCenterData,
    });
  } catch (err) {
    next(err);
  }
}
