import { Router } from "express";
import { addLectureToCourseById, createCourse, deleteCourse, getAllCourses, getLecturesByCourseId, removeLectureFromCourse, updateCourse } from "../controllers/course.controller.js";
import { authorizedRoles, authorizedSubscriber, isLoggedIn } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = Router();

router
.route('/')
.get(getAllCourses)
.post( isLoggedIn, authorizedRoles('ADMIN') , upload.single('thumbnail'),createCourse);

router
.route('/:courseid')
.get(isLoggedIn, authorizedSubscriber,getLecturesByCourseId)
.put( isLoggedIn, authorizedRoles('ADMIN') , updateCourse)
.delete( isLoggedIn, authorizedRoles('ADMIN') , deleteCourse, removeLectureFromCourse
)
// Added authorizeSubscribers to check if user is admin or subscribed if not then forbid the access to the lectures
.post(
    isLoggedIn, authorizedRoles('ADMIN') , upload.single('lecture'),
    addLectureToCourseById 
)
;

export default router;