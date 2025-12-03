const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get single course
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.status(500).send('Server error');
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ msg: 'Already enrolled in this course' });
    }

    const enrollment = new Enrollment({
      user: req.user.id,
      course: req.params.courseId
    });

    await enrollment.save();
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user's enrolled courses
exports.getUserCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', ['title', 'description', 'instructor', 'imageUrl']);

    res.json(enrollments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update course progress
exports.updateProgress = async (req, res) => {
  const { progress } = req.body;

  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user.id, course: req.params.courseId },
      { $set: { progress } },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({ msg: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};