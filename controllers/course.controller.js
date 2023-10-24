import path from "path";
import asyncHandler from "../middleware/asyncHandler.middleware.js";
import Course from "../models/course.model.js"
import AppError from "../utils/AppError.js"
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

/**
 * @ALL_COURSES
 * @ROUTE @GET {{URL}}/api/v1/courses
 * @ACCESS Public
 */
export const getAllCourses = asyncHandler(async (req, res, next) => {
    try {
        // Find all the courses without lectures
       const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success: true,
            message: 'All courses',
            courses,
        })
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }
});

/**
 * @GET_LECTURES_BY_COURSE_ID
 * @ROUTE @POST {{URL}}/api/v1/courses/:id
 * @ACCESS Private(ADMIN, subscribed users only)
 */
export const getLecturesByCourseId = asyncHandler(async(req, res, next) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);

        if (!course) {
            return next(
                new AppError('Invalid courseid', 400)
            );
        }

        res.status(200).json({
            success: true,
            message: 'Course lectures fetched successfully',
            lectures: course.lectures
        })
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }

});

/**
 * @CREATE_COURSE
 * @ROUTE @POST {{URL}}/api/v1/courses
 * @ACCESS Private (admin only)
 */
export const createCourse = asyncHandler(async  (req, res, next) => {
    const { title, description, category, createdBy } = req.body;

    if (!title || !description ||! category || ! createdBy) {
        return next(new AppError('All fields are required', 400));
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id:'Dummy',
            secure_url: 'Dummy'
        },
    });
    if (!course) {
        return next(
          new AppError('Course could not be created, please try again', 400)
        );
      }

       // Run only if user sends a file
    if (req.file) {
        try{
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms', // Save files in a folder named lms
          });  

          // If success
          if (result) {
            // Set the public_id and secure_url in array
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
          }

           // After successful upload remove the file from local storage
          fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
         // Empty the uploads directory without deleting the uploads directory
         for(const file of await fs.readdir('uploads')) {
            await fs.unlink(path.join('uploads/', file));
         }

         // Send the error message
         return next(
            new AppError(
                JSON.stringify(error) || 'File not uploaded, please try again', 400
            )
         );
    }
 }

    // Save the changes
    await course.save();

    res.status(201).json({
        success: true,
        message: 'Course created successfuly',
        course,
    });
});

/**
 * @UPDATE_COURSE_BY_ID
 * @ROUTE @PUT {{URL}}/api/v1/courses/:id
 * @ACCESS Private (Admin only)
 */
export const updateCourse = asyncHandler(async  (req, res, next) => {
    try {
         // Extracting the course id from the request params
         const { courseId } = req.params;

          // Finding the course using the course id
         const course = await Course.findByIdAndUpdate(
            courseId,
            {
              $set: req.body, // This will only update the fields which are present  
            },
            {
                runValidators: true, // This will run the validation checks on the new data
            }
         )

         // If no course found then send the response for the same
         if (!course) {
            return next(
                new AppError('Course does not exists', 400)
            );
         }

          // Sending the response after success
         res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
         })
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }
});

/**
 * @DELETE_COURSE_BY_ID
 * @ROUTE @DELETE {{URL}}/api/v1/courses/:id
 * @ACCESS Private (Admin only)
 */
export const deleteCourse = asyncHandler(async  (req, res, next) => {
    try {
    // Extracting id from the request parameters
    const { courseId } = req.params;
    const course = await Course.findByIdAndDelete(courseId);

    // If course not find send the message as stated below
        if (!course) {
            return next(
                new AppError('Course does not exists with given id', 500));
        }


    await Course.findByIdAndDelete(courseId);

     // Send the message as response
    res.status(200).json({
        success: true,
        message: 'Course deleted succefully!'
    })
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }
});

/**
 * @ADD_LECTURE
 * @ROUTE @POST {{URL}}/api/v1/courses/:id
 * @ACCESS Private (Admin Only)
 */
export const addLectureToCourseById = asyncHandler(async (req, res, next) => {
     const { title, description } = req.body;
     const { courseId } = req.params;

     
     if (!title || !description) {
        return next(
            new AppError('all fields are required ', 500)
        )
     }

     const course = await Course.findById(courseId);

     if (!course) {
        return next(
            new AppError('Course with given id does not exist!', 400)
        )
     }

     const lectureData = {
        title,
        description,
        lecture: {}
     }

      // Run only if user sends a file
     if (req.file) {
        try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms', // Save files in a folder named lms
            chunk_size: 50000000, // 50 mb size
            resource_type: 'video',
        });

        // If success
        if (result) {
            // Set the public_id and secure_url in array
            lectureData.lecture.public_id = result.public_id; 
            lectureData.lecture.secure_url = result.secure_url; 
        }

         // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
     } catch (error) {
         // Empty the uploads directory without deleting the uploads directory
         for (const file of await fs.readdir('uploads/')) {
            await fs.unlink(path.join('uploads/', file));
     }

     // Send the error message
     return next(
        new AppError(
          JSON.stringify(error) || 'File not uploaded, please try again',
          400
        )
      );
    }
}

     course.lectures.push(lectureData);

     course.numbersOfLectures = course.lecture.length;

     // Save the course object
     await course.save();

     res.status(200).json({
        success: true,
        message: 'Lecture added successfully',
        course
     });
     });

  /**
 * @Remove_LECTURE
 * @ROUTE @DELETE {{URL}}/api/v1/courses/:courseId/lectures/:lectureId
 * @ACCESS Private (Admin only)
 */
export const removeLectureFromCourse = asyncHandler(async (req, res, next) => {
    // Grabbing the courseId and lectureId from req.query
  const { courseId, lectureId } = req.query;

  console.log(courseId);

  // Checking if both courseId and lectureId are present
  if (!courseId) {
    return next(new AppError('Course ID is required', 400));
  }

  if (!lectureId) {
    return next(new AppError('Lecture ID is required', 400));
  }

  // Find the course uding the courseId
  const course = await Course.findById(courseId);

  // If no course send custom message
  if (!course) {
    return next(new AppError('Invalid ID or Course does not exist.', 404));
  }

  // Find the index of the lecture using the lectureId
  const lectureIndex = course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId.toString()
  );

  // If returned index is -1 then send error as mentioned below
  if (lectureIndex === -1) {
    return next(new AppError('Lecture does not exist.', 404));
  }

  // Delete the lecture from cloudinary
  await cloudinary.v2.uploader.destroy(
    course.lectures[lectureIndex].lecture.public_id,
    {
      resource_type: 'video',
    }
  );

  // Remove the lecture from the array
  course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectres array length
  course.numberOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  // Return response
  res.status(200).json({
    success: true,
    message: 'Course lecture removed successfully',
  });
});