const conf = require("../Config");
const Pool = require("pg").Pool;

const pool = new Pool(conf.pool);
console.log("anubhab",pool, "bahbuna");

const bcrypt = require("bcrypt");
const { request, response } = require("express");
const saltRounds = 10;
const validateUser = (request, response) => {
  console.log(
    "in validateUser func: recieved data is",
    request.body,
    request.params
  );
  const { studID, pwd } = request.body;

  pool.query(
    "SELECT * FROM user_password WHERE id = $1",
    [studID],
    (error, results) => {
      if (error) {
        console.log(error);
        response.send({ err: error });
      } else {
        if (results.rows.length > 0) {
          bcrypt.compare(pwd, results.rows[0].hashed_password, (error, res) => {
            if (res) {
              request.session.user = results;
              response.send({
                success: true,
                msg: "Successfully logged In with userId = ".concat(studID),
              });
            } else {
              response.send({
                success: false,
                msg: "Wrong User Credentials !",
              });
            }
          });
        } else {
          response
            .status(200)
            .json({ success: false, msg: "NO such User exists !" });
        }
      }
    }
  );
};

//internal testing func
const populateHashTable = (req, res) => {
  const id = req.params.ID;
  const password = req.params.pwd;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }
    pool.query(
      "INSERT INTO user_password (ID, hashed_password) VALUES ($1,$2)",
      [id, hash],
      (err, result) => {
        if (err) {
          console.log(err);
        }
      }
    );
  });
  res.send({ id: id, password: password });
};


const getStudentInfo = (request, response) => {
  const studID = request.body.userID;
  console.log("fetch-student-info got uid = ", studID);
  pool.query(
    "select * from takes natural inner join student where student.Id = takes.Id and student.Id = $1 order by student.Id, year, semester",
    [studID],
    (error, results) => {
      if (error) {
        throw error;
      }
      // console.log(results)
      response.status(200).json(results.rows);
    }
  );
};

const getALLInstructors = (request, response) => {
  pool.query(
    "select ID, name, dept_name from instructor order by dept_name asc",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};
const getALLCourse = (request, response) => {
  pool.query(
    "select course_id, title, dept_name, credits from course order by dept_name asc",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getInstructorInfo = (request, response) => {
  const teachID = request.body.userID;
  console.log("fetch-instructor-info got uid = ", teachID);
  // pool.query('select * from takes natural inner join student where student.Id = takes.Id and student.Id = $1 order by student.Id, year, semester',[studID], (error, results) => {
  pool.query(
    "select ID, name, dept_name from instructor where student.Id = takes.Id and student.Id = $1 order by student.Id, year, semester",
    [studID],
    (error, results) => {
      if (error) {
        throw error;
      }
      // console.log(results)
      response.status(200).json(results.rows);
    }
  );
};

const multipleQuery = (request, response) => {
  pool.query(
    "select course_id, title from course order by dept_name asc",
    (error, results1) => {
      if (error) {
        throw error;
      }
      pool.query(
        "select name from instructor order by dept_name asc",
        (error, results2) => {
          if (error) {
            throw error;
          }
          response.status(200).json({ a: results2.rows, b: results1.rows });
        }
      );
    }
  );
};

const validateStudent = (request, response) => {
  const studID = request.body.userID;
  console.log("fetch-student-existance got uid = ", studID);
  pool.query(
    "SELECT * FROM student WHERE id = $1",
    [studID],
    (error, results) => {
      if (error) {
        console.log(error);
        response.send({ success: false, msg: "Database Error", err: error });
      } else {
        if (results.rows.length > 0) {
          response.send({
            success: true,
            msg: "Successfully logged In with userId = ".concat(studID),
            studData: results.rows,
          });
        } else {
          response
            .status(200)
            .json({ success: false, msg: "Logged In user is Not a student !" });
        }
      }
    }
  );
};

const validateStudAndFetch = (request, response) => {
  const uID = request.body.userID;
  pool.query(
    "SELECT * FROM student WHERE id = $1",
    [uID],
    (error1, results1) => {
      if (error1) {
        console.log("err1");
        throw error1;
      }
      if (results1.rows.length > 0) {
        //coming here means student exists
        pool.query(
          "select * from student natural inner join takes,course where takes.course_id = course.course_id and student.Id = takes.Id and student.Id = $1 order by student.Id, year desc, semester",
          [uID],
          (error2, results2) => {
            if (error2) {
              console.log("err2");
              throw error2;
            }
            pool.query(
              "select year,semester from reg_dates where start_time <= CURRENT_TIMESTAMP(0) and end_time >= CURRENT_TIMESTAMP(0) order by start_time DESC, year DESC",
              (error3, results3) => {
                if (error3) {
                  throw error3;
                }
                if (results3.rows.length > 0) {
                  //reg period is active
                  response.status(200).json({
                    success: true,
                    reg: true,
                    studData: results2.rows,
                    year: results3.rows[0].year,
                    sem: results3.rows[0].semester,
                  });
                } else {
                  //reg is closed but we should get curr sem & year info
                  pool.query(
                    "select year,semester from reg_dates where end_time <= CURRENT_TIMESTAMP(0) order by end_time DESC, year DESC",
                    (error4, results4) => {
                      if (error4) {
                        throw error4;
                      }
                      response.status(200).json({
                        success: true,
                        reg: false,
                        studData: results2.rows,
                        year: results4.rows[0].year,
                        sem: results4.rows[0].semester,
                      });
                    }
                  );
                }
              }
            );
          }
        );
      } else {
        console.log("anubhab3");
        //coming here means user is not a student
        response.status(200).json({ success: false });
      }
    }
  );
};

const validateStudAndFetchRegCourses = async (request, response) => {
  const uID = request.body.userID;
  // const currYear = request.body.currYear;
  // const currSem = request.body.currSem;
  // console.log(uID, currYear, currSem);

  pool.query(
    "SELECT * FROM student WHERE id = $1",
    [uID],
    (error1, results1) => {
      console.log("anubhab1");
      if (error1) {
        console.log("err1");
        throw error1;
      }
      console.log("anubhab2", results1.rows);
      if (results1.rows.length > 0) {
        //coming here means student exists
        pool.query(
          "select year,semester from reg_dates where start_time <= CURRENT_TIMESTAMP(0) and end_time >= CURRENT_TIMESTAMP(0) order by start_time DESC, year DESC",
          (error3, results3) => {
            if (error3) {
              throw error3;
            }
            if (results3.rows.length > 0) {
              //reg period is active
              // "select * from course, section where course.course_id=section.course_id and semester = $1 and year = $2 order by dept_name, sec_id, title",
              pool.query(
                "select * from takes natural inner join course natural inner join section where takes.id=$1 and takes.year=$2 and takes.semester=$3",
                [uID, results3.rows[0].year, results3.rows[0].semester],
                (error2, results2) => {
                  //registered courses
                  if (error2) {
                    throw error2;
                  }
                  pool.query(
                    "with co(cid,title,dept_name,credits) as (select * from course where course.course_id not in (select c.course_id from takes natural inner join course as c natural inner join section  where takes.id=$1 and takes.year=$2 and takes.semester=$3)) select * from co,section where section.year=$2 and section.semester=$3 and co.cid = section.course_id order by sec_id",
                    [uID, results3.rows[0].year, results3.rows[0].semester],
                    (error3, results3) => {
                      //pending courses
                      if (error3) {
                        throw error3;
                      }
                      response.status(200).json({
                        stud: true,
                        reg: true,
                        courseData: results3.rows,
                        doneData: results2.rows,
                        year: results3.rows[0].year,
                        sem: results3.rows[0].semester,
                      }); //here current sem filter is already applied
                    }
                  );
                }
              );
            } else {
              console.log("anubhab3");
              //coming here means reg date is passed
              response.status(200).json({ stud: true, reg: false });
            }
          }
        );
      } else {
        console.log("anubhab3");
        //coming here means user is not a student
        response.status(200).json({ stud: false });
      }
    }
  );
};

//no student validation required
const fetchCourseInfo = async (request, response) => {
  // const uID = request.body.userID
  const cID = request.body.courseID;
  console.log("cid got", cID);

  pool.query("select * from course where course_id=$1", [cID], (err, res) => {
    if (err) {
      throw err;
    }
    if (res.rows.length > 0) {
      //ie course exists
      const courseInfo = res.rows; //will have cid, cname, credits, dept.
      pool.query(
        "select year,semester from reg_dates where start_time <= CURRENT_TIMESTAMP(0) and end_time >= CURRENT_TIMESTAMP(0) order by start_time DESC, year DESC",
        (error1, results1) => {
          if (error1) {
            throw error1;
          }
          if (results1.rows.length > 0) {
            console.log(
              "current year & sem",
              results1.rows[0].year,
              results1.rows[0].semester
            );
            pool.query(
              "select * from course, section where course.course_id = section.course_id and course.course_id=$1 order by sec_id asc",
              [cID],
              (error2, results2) => {
                if (error2) {
                  throw error2;
                }
                // console.log(results)  results1.rows[0].year, results1.rows[0].semester
                var taught;
                if (results2.rows.length > 0) {
                  taught = true;
                } else {
                  //the course was never taught
                  // response.status(200).json({
                  //   success: false,
                  //   msg: "No record as this course was never taught nor taken by any student.",
                  // });
                  taught = false;
                }

                pool.query(
                  "select prereq.prereq_id, c.title, c.dept_name, c.credits  from course, prereq, course as c where course.course_id = prereq.course_id and course.course_id=$1 and c.course_id = prereq.prereq_id",
                  [cID],
                  (error3, results3) => {
                    //for prereq data
                    if (error3) {
                      throw error3;
                    }
                    pool.query(
                      "select instructor.id, teaches.year, teaches.semester, teaches.sec_id, instructor.name, instructor.dept_name from teaches, instructor where teaches.id = instructor.id and course_id =$1",
                      [cID],
                      (error4, results4) => {
                        //for instructor data
                        if (error4) {
                          throw error4;
                        }

                        if (taught) {
                          //taught true
                          if (results3.rows.length > 0) {
                            if (results4.rows.length > 0) {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: true,
                                ins: true,
                                reg: true,
                                taught: true,
                                courseData: results2.rows,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                                prereqData: results3.rows,
                                instructorData: results4.rows,
                              });
                            } else {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: true,
                                ins: false,
                                reg: true,
                                taught: true,
                                courseData: results2.rows,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                                prereqData: results3.rows,
                              });
                            }
                          } else {
                            if (results4.rows.length > 0) {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: false,
                                ins: true,
                                reg: true,
                                taught: true,
                                courseData: results2.rows,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                                instructorData: results4.rows,
                              });
                            } else {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: false,
                                ins: false,
                                reg: true,
                                taught: true,
                                courseData: results2.rows,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                              });
                            }
                          }
                        } else {
                          //taught false -> no course data
                          if (results3.rows.length > 0) {
                            if (results4.rows.length > 0) {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: true,
                                ins: true,
                                reg: true,
                                taught: false,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                                prereqData: results3.rows,
                                instructorData: results4.rows,
                              });
                            } else {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: true,
                                ins: false,
                                reg: true,
                                taught: false,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                                prereqData: results3.rows,
                              });
                            }
                          } else {
                            if (results4.rows.length > 0) {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: false,
                                ins: true,
                                reg: true,
                                taught: false,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                                instructorData: results4.rows,
                              });
                            } else {
                              response.status(200).json({
                                success: true,
                                courseInfo: courseInfo,
                                pre: false,
                                ins: false,
                                reg: true,
                                taught: false,
                                currYear: results1.rows[0].year,
                                currSem: results1.rows[0].semester,
                              });
                            }
                          }
                        }
                      }
                    );
                  }
                );
              }
            );
          } else {
            //is when u are out of reg window and current semester does exist - will find & return
            pool.query(
              "select year,semester from reg_dates where end_time <= CURRENT_TIMESTAMP(0) order by end_time DESC, year DESC",
              (error_1, results_1) => {
                if (error_1) {
                  throw error_1;
                }
                if (results_1.rows.length > 0) {
                  console.log(
                    "current year & sem",
                    results_1.rows[0].year,
                    results_1.rows[0].semester
                  );
                  pool.query(
                    "select * from course, section where course.course_id = section.course_id and course.course_id=$1 order by sec_id asc",
                    [cID],
                    (error2, results2) => {
                      if (error2) {
                        throw error2;
                      }
                      var taught;
                      if (results2.rows.length > 0) {
                        taught = true;
                      } else {
                        //the course was never taught
                        // response.status(200).json({
                        //   success: false,
                        //   msg: "No record as this course was never taught nor taken by any student.",
                        // });
                        taught = false;
                      }
                      pool.query(
                        "select prereq.prereq_id, c.title, c.dept_name, c.credits  from course, prereq, course as c where course.course_id = prereq.course_id and course.course_id=$1 and c.course_id = prereq.prereq_id",
                        [cID],
                        (error3, results3) => {
                          //for prereq data
                          if (error3) {
                            throw error3;
                          }
                          pool.query(
                            "select instructor.id, teaches.year, teaches.semester, teaches.sec_id, instructor.name, instructor.dept_name from teaches, instructor where teaches.id = instructor.id and course_id =$1",
                            [cID],
                            (error4, results4) => {
                              //for instructor data
                              if (error4) {
                                throw error4;
                              }

                              if (taught) {
                                //taught true
                                if (results3.rows.length > 0) {
                                  if (results4.rows.length > 0) {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: true,
                                      ins: true,
                                      reg: false,
                                      taught: true,
                                      courseData: results2.rows,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                      prereqData: results3.rows,
                                      instructorData: results4.rows,
                                    });
                                  } else {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: true,
                                      ins: false,
                                      reg: false,
                                      taught: true,
                                      courseData: results2.rows,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                      prereqData: results3.rows,
                                    });
                                  }
                                } else {
                                  if (results4.rows.length > 0) {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: false,
                                      ins: true,
                                      reg: false,
                                      taught: true,
                                      courseData: results2.rows,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                      instructorData: results4.rows,
                                    });
                                  } else {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: false,
                                      ins: false,
                                      reg: false,
                                      taught: true,
                                      courseData: results2.rows,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                    });
                                  }
                                }
                              } else {
                                //taught false -> no course data
                                if (results3.rows.length > 0) {
                                  if (results4.rows.length > 0) {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: true,
                                      ins: true,
                                      reg: false,
                                      taught: false,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                      prereqData: results3.rows,
                                      instructorData: results4.rows,
                                    });
                                  } else {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: true,
                                      ins: false,
                                      reg: false,
                                      taught: false,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                      prereqData: results3.rows,
                                    });
                                  }
                                } else {
                                  if (results4.rows.length > 0) {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: false,
                                      ins: true,
                                      reg: false,
                                      taught: false,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                      instructorData: results4.rows,
                                    });
                                  } else {
                                    response.status(200).json({
                                      success: true,
                                      courseInfo: courseInfo,
                                      pre: false,
                                      ins: false,
                                      reg: false,
                                      taught: false,
                                      currYear: results_1.rows[0].year,
                                      currSem: results_1.rows[0].semester,
                                    });
                                  }
                                }
                              }
                            }
                          );
                        }
                      );
                    }
                  );
                } else {
                  //is when u are out of reg window and current semester does exist - will find & return
                  response.status(200).json({
                    success: false,
                    msg: "The current Reg window doesn't exist & there is No semester running in the University!",
                  });
                }
              }
            );
          }
        }
      );
    } else {
      //course doesn't exist
      response
        .status(200)
        .json({
          success: false,
          msg: "This Course DOES NOT exists in University Database!",
        });
    }
  });
};



const getAllDepts = (request, response) => {
  pool.query(
    "select year,semester from reg_dates where start_time <= CURRENT_TIMESTAMP(0) and end_time >= CURRENT_TIMESTAMP(0) order by start_time DESC, year DESC",
    (error1, results1) => {
      if (error1) {
        throw error1;
      }
      if (results1.rows.length > 0) {
        pool.query(
          "select distinct course.dept_name from course,section where section.course_id = course.course_id and year=$1 and semester=$2",
          [results1.rows[0].year,results1.rows[0].semester],
          (error, results) => {
            if (error) {
              throw error;
            }
            response.status(200).json(results.rows);
          }
        );
      }
    });

};

const fetchDeptCourses = (request, response) => {
  const dName = request.body.dName;
  pool.query(
    "select year,semester from reg_dates where start_time <= CURRENT_TIMESTAMP(0) and end_time >= CURRENT_TIMESTAMP(0) order by start_time DESC, year DESC",
    (error1, results1) => {
      if (error1) {
        throw error1;
      }
      if (results1.rows.length > 0) {
        pool.query(
          "select  course.course_id,course.title,course.credits,course.dept_name from course,section where course.dept_name = $1 and section.course_id = course.course_id and year=$2 and semester=$3",
          [dName,results1.rows[0].year,results1.rows[0].semester],
          (error, results) => {
            if (error) {
              throw error;
            }
            response.status(200).json(results.rows);
          }
        );
      }
    });
};

const fetchInstructorInfo = async (request, response) => {
  const insID = request.body.insID;
  console.log(" instructor id got", insID);

  pool.query(
    "select year,semester from reg_dates where start_time <= CURRENT_TIMESTAMP(0) and end_time >= CURRENT_TIMESTAMP(0) order by start_time DESC, year DESC",
    (error1, results1) => {
      if (error1) {
        throw error1;
      }
      if (results1.rows.length > 0) {
        console.log(
          "current year & sem",
          results1.rows[0].year,
          results1.rows[0].semester
        );
        pool.query(
          "select * from instructor where ID = $1",
          [insID],

          (error2, results2) => {
            if (error2) {
              throw error2;
            }
            // console.log(results)  results1.rows[0].year, results1.rows[0].semester
            if (results2.rows.length > 0) {
              pool.query(
                //distinct so that multiple sections are avoided
                "select distinct course.course_id,year,semester,title,dept_name,credits from teaches,course where teaches.course_id = course.course_id and Id = $1 and year <= $2 order by year desc,semester desc, course.course_id asc",
                [insID, results1.rows[0].year],
                (error3, results3) => {
                  //for prereq data
                  if (error3) {
                    throw error3;
                  }
                  if (results3.rows.length > 0) {
                    response.status(200).json({
                      success: true,
                      taught: true,
                      reg: true,
                      instructorData: results2.rows,
                      currYear: results1.rows[0].year,
                      currSem: results1.rows[0].semester,
                      courseData: results3.rows,
                    });
                  } else {
                    response.status(200).json({
                      success: true,
                      taught: false,
                      reg: true,
                      instructorData: results2.rows,
                      currYear: results1.rows[0].year,
                      currSem: results1.rows[0].semester,
                    });
                  }
                }
              );
            } else {
              response.status(200).json({
                success: false,
                msg: "No such Instructor exist in our University Database.",
              });
            }
          }
        );
      } else {
        //is when u are out of reg window and current semester does exist - will find & return
        pool.query(
          "select year,semester from reg_dates where end_time <= CURRENT_TIMESTAMP(0) order by end_time DESC, year DESC",
          (error_1, results_1) => {
            if (error_1) {
              throw error_1;
            }
            if (results_1.rows.length > 0) {
              console.log(
                "current year & sem",
                results_1.rows[0].year,
                results_1.rows[0].semester
              );
              pool.query(
                "select * from instructor where ID = $1",
                [insID],

                (error2, results2) => {
                  if (error2) {
                    throw error2;
                  }
                  // console.log(results)  results1.rows[0].year, results1.rows[0].semester
                  if (results2.rows.length > 0) {
                    pool.query(
                      "select course.course_id,sec_id,year,semester,title,dept_name,credits from teaches,course where teaches.course_id = course.course_id and Id = $1 and year <= $2 order by year desc,semester desc",
                      [insID, results_1.rows[0].year],
                      (error3, results3) => {
                        //for prereq data
                        if (error3) {
                          throw error3;
                        }
                        if (results3.rows.length > 0) {
                          response.status(200).json({
                            success: true,
                            taught: true,
                            reg: false,
                            instructorData: results2.rows,
                            currYear: results_1.rows[0].year,
                            currSem: results_1.rows[0].semester,
                            courseData: results3.rows,
                          });
                        } else {
                          response.status(200).json({
                            success: true,
                            taught: false,
                            reg: false,
                            instructorData: results2.rows,
                            currYear: results_1.rows[0].year,
                            currSem: results_1.rows[0].semester,
                          });
                        }
                      }
                    );
                  } else {
                    response.status(200).json({
                      success: false,
                      msg: "No such Instructor exists.",
                    });
                  }
                }
              );
            } else {
              //is when u are out of reg window and current semester does exist - will find & return
              response.status(200).json({
                success: false,
                msg: "The current Reg window doesn't exist & there is No semester running in the college ! Go play with Yourself...",
              });
            }
          }
        );
      }
    }
  );
};

//--------------------------------------------------kamal's
const insertIntoTable = async (request, response) => {
  const studID = request.body.studID;
  const cID = request.body.cID;
  const curr_year = request.body.year;
  const curr_sem = request.body.sem;
  const sec_id = request.body.sec_id;
  const cred = request.body.credits;
  pool.query("select * from prereq where course_id=$1", [cID], (err, res) => {
    if (err) {
      throw err;
    }
    if (res.rows.length > 0) {
      //course has prereqs
      pool.query(
        //check prereq
        "with pre(cid) as (select p.prereq_id from prereq as p where p.course_id = $1),c1(val1) as ( select count(*) from prereq where course_id = $1 group by course_id),c2(val2) as (select count(*) from takes,pre where takes.course_id = pre.cid and (year < $2 or (year = $2 and semester = 'Spring' and $3 = 'Fall')) and takes.grade != 'F' and takes.grade != 'NA' and takes.id = $4 group by takes.id)select * from c1,c2 where c1.val1 = c2.val2",
        [cID, curr_year, curr_sem, studID],
        (error, results0) => {
          if (error) {
            throw error;
          }
          if (results0.rows.length > 0) {
            //so prereq is satisfied

            //we will first get info of course being registered
            pool.query(
              "select * from section natural full outer join time_slot where course_id=$1 and year=$2 and semester=$3 and sec_id=$4",
              [cID, curr_year, curr_sem, sec_id],
              (error1, results1) => {
                if (error1) {
                  throw error1;
                }
                const curr_ts = results1.rows;
                //we will 2nd get info of all courses already registered
                pool.query(
                  "select * from takes natural inner join section  natural full outer join time_slot where takes.id=$1 and takes.year=$2 and takes.semester=$3",
                  [studID, curr_year, curr_sem],
                  (error2, results2) => {
                    if (error2) {
                      throw error2;
                    }
                    const done_ts = results2.rows;
                    //now execute comparision------------------------//
                    var clash = false;
                    for (i in curr_ts) {
                      for (j in done_ts) {
                        if (
                          curr_ts[i].time_slot_id === done_ts[j].time_slot_id
                        ) {
                          // if(curr_ts[i].day === done_ts[j].day){}
                          clash = true;
                          break;
                        }
                      }
                      if (clash) break;
                    }
                    if (clash) {
                      response
                        .status(200)
                        .json({ success: false, msg: "Slot clash happened" });
                    } else {
                      pool.query(
                        //final insertion
                        "INSERT INTO takes ('id','course_id','sec_id','semester','year','grade') VALUES ($1,$2,$3,$4,$5,$6)",
                        [studID, cID, sec_id, curr_sem, curr_year, "NA"],
                        (error, results) => {
                          if (error) {
                            throw error;
                          }
                          response.status(200).json({
                            success: true,
                            msg: "Successfully updated Tables for Course Registration",
                          });
                          // pool.query(
                          //   "UPDATE student SET tot_cred = tot_cred + $1 WHERE Id = $2;",
                          //   [cred, studID],
                          //   (error, results2) => {
                          //     if (error) {
                          //       throw error;
                          //     }
                          //   }
                          // );
                        }
                      );
                    }
                  }
                );
              }
            );
          } else {
            response
              .status(200)
              .json({ success: false, msg: "Prerequisite not satisfied" });
          }
        }
      );
    } else {
      //no prereqs, so satisfied

      //we will first get info of course being registered
      pool.query(
        "select * from section natural full outer join time_slot where course_id=$1 and year=$2 and semester=$3 and sec_id=$4",
        [cID, curr_year, curr_sem, sec_id],
        (error1, results1) => {
          if (error1) {
            throw error1;
          }
          const curr_ts = results1.rows;
          //we will 2nd get info of all courses already registered
          pool.query(
            "select * from takes natural inner join section  natural full outer join time_slot where takes.id=$1 and takes.year=$2 and takes.semester=$3",
            [studID, curr_year, curr_sem],
            (error2, results2) => {
              if (error2) {
                throw error2;
              }
              const done_ts = results2.rows;
              //now execute comparision------------------------//
              var clash = false;
              for (i in curr_ts) {
                for (j in done_ts) {
                  if (curr_ts[i].time_slot_id === done_ts[j].time_slot_id) {
                    // if(curr_ts[i].day === done_ts[j].day){}
                    clash = true;
                    break;
                  }
                }
                if (clash) break;
              }
              if (clash) {
                response
                  .status(200)
                  .json({ success: false, msg: "Slot clash happened" });
              } else {
                pool.query(
                  //final insertion
                  "INSERT INTO takes (ID,course_id,sec_id,semester,year,grade) VALUES ($1,$2,$3,$4,$5,$6)",
                  [studID, cID, sec_id, curr_sem, curr_year, "NA"],
                  (error, results) => {
                    if (error) {
                      throw error;
                    }
                    response.status(200).json({
                      success: true,
                      msg: "Successfully updated Tables for Course Registration",
                    });
                    // pool.query(
                    //   "UPDATE student SET tot_cred = tot_cred + $1 WHERE Id = $2;",
                    //   [cred, studID],
                    //   (error, results2) => {
                    //     if (error) {
                    //       throw error;
                    //     }
                    //   }
                    // );
                  }
                );
              }
            }
          );
        }
      );
    }
  });
};

const dropFromTable = async (request, response) => {
  const studID = request.body.studID;
  const cID = request.body.cID;
  const curr_year = request.body.year;
  const curr_sem = request.body.sem;
  const sec_id = request.body.sec_id;
  const cred = request.body.credits;
  pool.query(
    "DELETE FROM takes where id = $1 and course_id = $2 and sec_id = $3 and semester = $4 and year = $5 ",
    [studID, cID, sec_id, curr_sem, curr_year],
    (error, results) => {
      if (error) {
        throw error;
      }
      response
        .status(200)
        .json({ msg: "Successfully updated Tables after Course Droping." });
      // pool.query(
      //   "UPDATE student SET tot_cred = tot_cred - $1 WHERE Id = $2;",
      //   [cred, studID],
      //   (error, results2) => {
      //     if (error) {
      //       throw error;
      //     }

      //   }
      // );
    }
  );
};

module.exports = {
  validateUser,
  populateHashTable,
  getStudentInfo,

  getALLInstructors,
  getInstructorInfo,

  getALLCourse,
  multipleQuery,

  validateStudent,
  validateStudAndFetch,
  validateStudAndFetchRegCourses,
  fetchCourseInfo,

  getAllDepts,
  fetchDeptCourses,
  fetchInstructorInfo,
  insertIntoTable,
  dropFromTable,
};
