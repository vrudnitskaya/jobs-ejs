const Job = require('../models/Job');
const handleErrors = require("../utils/parseValidationErrs");

// GET all Jobs for the current user
const getJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({ createdBy: req.user._id });       
        res.render('jobs', { jobs});
    } catch (error) {
        handleErrors(error, req, res);
        res.status(500).send('An error occurred while fetching jobs');
    }
};
// POST a new Job
const addJob = async (req, res, next) => {
    try {
        await Job.create({ ...req.body, createdBy: req.user._id });
        res.redirect('/jobs'); 
    } catch (error) {
        handleErrors(error, req, res);
    }
};
// GET the form for adding a new job
const getNewJob = (req, res) => {
    try {
        res.render('newJob', {});
    } catch (error) {
        handleErrors(error, req, res);
    }
    
};
// GET a specific jobs for editing
const editJob = async (req, res,next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            req.flash('error', 'Job not found');
            return res.status(404).redirect('/jobs');
        } 
        res.render('job', { job });
    } catch (error) {
        handleErrors(error, req, res); 
    }
};
// POST an updated jobs
const updateJob = async (req, res, next) => {
    try {
        const updatedJobs = await Job.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedJobs) {
            req.flash('error', 'Job not found');
            return res.status(404).redirect('/jobs');
        }
        res.redirect('/jobs');
    } catch (error) {
        handleErrors(error, req, res, '/jobs/edit/' + req.params.id);
    }
};
// POST to delete a job
const deleteJob = async (req, res, next) => {
    try {
        const deletedJob = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
        if (!deletedJob) {
            req.flash('error', 'Job not found');
            return res.status(404).redirect('/jobs');
        }
        req.flash('success', 'Job was deleted');
        res.redirect('/jobs');
    } catch (error) {
        handleErrors(error, req, res, '/jobs');
    }
};

module.exports = {
  getNewJob,  
  getJobs,  
  addJob,
  editJob,
  updateJob,
  deleteJob
};