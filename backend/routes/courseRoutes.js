const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const courseController = require('../controllers/courseController');

// @route   GET api/courses
// @desc    Get all courses
// @access  Public
router.get('/', courseController.getAllCourses);

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', courseController.getCourseById);

// @route   POST api/courses/:courseId/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:courseId/enroll', auth, courseController.enrollCourse);

// @route   GET api/courses/user/courses
// @desc    Get user's enrolled courses
// @access  Private
router.get('/user/courses', auth, courseController.getUserCourses);

// @route   PUT api/courses/:courseId/progress
// @desc    Update course progress
// @access  Private
router.put('/:courseId/progress', auth, courseController.updateProgress);

module.exports = router;