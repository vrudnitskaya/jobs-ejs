const express = require("express");
const router = express.Router();

const {
  getJobs,
  addJob,
  getNewJob,
  editJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobs");

router.route("/jobs")
    .get(getJobs)
    .post(addJob);
router.route("/jobs/new")
    .get(getNewJob);
router.route("/jobs/edit/:id")
    .get(editJob);
router.route("/jobs/update/:id")
    .post(updateJob);
router.route("/jobs/delete/:id")
    .post(deleteJob)

module.exports = router;