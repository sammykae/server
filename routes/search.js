const asyncHandler = require("express-async-handler");
const search = asyncHandler(async (req, res, next) => {
  let blogs;

  if (!req.session.user) {
    blogs = await Post.find({ isPublic: true })
      //   .sort({ enrolledCount: "desc", createdAt: "desc" })
      //   .limit(3)
      .lean();
  } else {
    blogs = await Post.find({ isPublic: true })
      .sort({ enrolledCount: "desc", createdAt: "desc" })
      .lean();
    if (req.query.search) {
      console.log(`req.query: => ${req.query.search}`);
      blogs = blogs.filter((course) =>
        course.title.toLowerCase().includes(req.query.search.toLowerCase())
      );
    }
  }
});
