const fs = require("fs");
const Course = require("../models/Course");
const User = require("../models/User");
const { parse } = require("json2csv");
const asyncHandler = require("express-async-handler");
const deleteFile = require("../utils/delete");
const path = require("path");
const pdfDocument = require("pdfkit");

exports.getHome = asyncHandler(async (req, res, next) => {
  // Fetching courses from DB
  let courses;

  if (!req.session.user) {
    courses = await Course.find({ isPublic: true })
      .sort({ enrolledCount: "desc", createdAt: "desc" })
      .limit(3)
      .lean();
  } else {
    courses = await Course.find({ isPublic: true })
      .sort({ enrolledCount: "desc", createdAt: "desc" })
      .lean();
    if (req.query.search) {
      console.log(`req.query: => ${req.query.search}`);
      courses = courses.filter((course) =>
        course.title.toLowerCase().includes(req.query.search.toLowerCase())
      );
    }
  }

  // console.log(req.session.user);
  res.render("index.hbs", {
    courses,
    User: req.session.user,
  });
});

exports.getCreate = (req, res) => {
  res.render("create.hbs", { title: "Create Course" });
};

exports.postCreate = asyncHandler(async (req, res, next) => {
  const { title, description, imageUrl } = req.body;

  let dateObj = new Date();
  // let month = dateObj.getUTCMonth() + 1; //months from 1-12
  // let day = dateObj.getUTCDate();
  // let year = dateObj.getUTCFullYear();

  let options = { year: "numeric", month: "numeric", day: "numeric" };
  const course = new Course({
    title,
    description,
    imageUrl,

    createAt: dateObj,
    creatorId: req.user._id,
    isPublic: req.body.isPublic === "on" ? true : false,
  });
  await course.save();
  req.flash("success", "Course created successfully !");
  res.redirect("/");
});

exports.getDetails = asyncHandler(async (req, res, next) => {
  // parse the courses id from the url
  const id = req.params.courseId;

  let enrolled = false;
  let enrolledCourses = req.session.user.enrolledCourse.map((item) =>
    item.toString()
  );

  if (enrolledCourses.includes(id)) {
    enrolled = true;
  }
  const course = await Course.findById(id).lean();
  // Authorization
  let owner = false;
  // if a user is logged in

  if (req.session.user) {
    owner = req.session.user._id.toString() === course.creatorId;
  }

  if (course) {
    res.render("details", {
      title: `Detail | ${id}`,
      course,
      owner,
      imageUrl: course.imageUrl,
      enrolled,
    });
  }
});

exports.getEdit = asyncHandler(async (req, res, next) => {
  // parse the id from the url
  const courseId = req.params.courseId;

  // fetch the course info
  const course = await Course.findById(courseId).lean();
  console.log("course in Edit mode: ", course);

  res.render("create.hbs", {
    title: "Edit course",
    course: course,
    editMode: true,
  });
});

exports.postEdit = asyncHandler(async (req, res, next) => {
  // parse the url for course id
  const courseId = req.params.courseId;
  // search my db for that specific course
  const course = await Course.findById(courseId);
  // Update the course with the form fields
  course.title = req.body.title;
  course.description = req.body.description;
  course.imageUrl = req.body.imageUrl;
  course.isPublic = req.body.isPublic === "on" ? true : false;
  // save it back to the db
  await course.save();
  // send a message to the user and redirect him to the home page
  req.flash("success", "Course edited successfully !");
  res.redirect("/");
});

exports.getDelete = asyncHandler(async (req, res, next) => {
  //  parse the course id from url
  const courseId = req.params.courseId;

  // find the course in db by id
  console.log(`courseId: => ${courseId}`);
  const course = await Course.findById(courseId);
  console.log(`course: => ${course}`);
  await Course.findByIdAndDelete(courseId);
  req.flash("success", "Course deleted Successfully !");
  res.redirect("/");
});

exports.postDelete = asyncHandler(async (req, res, next) => {
  const courseId = req.params.courseId;

  const course = await Course.findById(courseId);
  deleteFile(course.imageUrl);
  console.log(`postDelete`);
  await Course.findByIdAndDelete(courseId);
  req.flash("success", "Course deleted Successfully !");
  res.redirect("/");
});
exports.getEnroll = asyncHandler(async (req, res, next) => {
  const courseId = req.params.courseId.trim();
  const userId = req.session.user._id;
  9;

  await Course.findOneAndUpdate(
    { _id: courseId },
    {
      $push: { usersEnrolled: req.session.user._id },
      $inc: { enrolledCount: 1 },
    }
  );
  await User.findOneAndUpdate(
    { _id: userId },
    { $push: { enrolledCourse: courseId } }
  );
  // const { username } = req.body;
  const course = await Course.findById(courseId).lean();
  // // const userId = await User.findById(User._id);
  // console.log(`user: => ${User}`);
  req.flash("success", "Enrolled Successfully !");
  res.render("enroll.hbs", {
    course: course,
    imageUrl: course.imageUrl,
    courseId: course._id,
  });
});
