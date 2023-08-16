import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const TableCourses = (p) => {
  const data = p.d;
  return (
    <table className="insTable">
      <thead>
        <tr>
          <th>Index</th>

          <th>Section</th>
          <th>Venue</th>
          <th>Time Slot</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>

              <td>{e.sec_id}</td>
              <td>
                Room {e.room_number}, {e.building}
              </td>
              <td>{e.time_slot_id}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const TableIns = (p) => {
  const data = p.d;
  return (
    <table className="insTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Instructor ID </th>
          <th>Name</th>
          <th>Dept. name</th>
          <th>Year</th>
          <th>Semester</th>
          <th>Section</th>
          <th>Instructor's</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.id}</td>
              <td>{e.name}</td>
              <td>{e.dept_name}</td>
              <td>{e.year}</td>
              <td>{e.semester}</td>
              <td>{e.sec_id}</td>
              <td>
                <button
                  className="regButton"
                  onClick={() => {
                    // alert(
                    //   "Visit website of Prof " +
                    //     e.name +
                    //     "of dept " +
                    //     e.dept_name
                    // );
                    p.f(e.id);
                  }}
                >
                  Website
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const TablePrereq = (p) => {
  const data = p.d;
  return (
    <table className="insTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Course ID </th>
          <th>Title</th>
          <th>Dept. name</th>
          <th>Credits</th>
          <th>Course's</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.prereq_id}</td>
              <td>{e.title}</td>
              <td>{e.dept_name}</td>
              <td>{e.credits}</td>
              <td>
                <button
                  className="regButton"
                  onClick={() => {
                    // alert(
                    //   "Visit website of course  " +
                    //     e.course_id +
                    //     " ( " +
                    //     e.dept_name +
                    //     " )"
                    // );
                    p.f(e.prereq_id);
                  }}
                >
                  Website
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default function CourseInfo(props) {
  const { cid } = useParams();

  const [Coursedata, setCourseData] = useState([{}]);
  const [CourseInfo, setCourseInfo] = useState([{}]);
  const [insData, setInsData] = useState([{}]);
  const [prereqData, setPrereqData] = useState([{}]);

  const [year, setYear] = useState("");
  const [sem, setSem] = useState("");

  const [success, setSuccess] = useState(false);
  const [isIns, setIsIns] = useState(false);
  const [isPrereq, setIsPrereq] = useState(false);
  const [taught, setTaught] = useState(false);

  const [msg, setMsg] = useState("Please log in");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(0);

  const refreshOnSpot = () => window.location.reload(true);
  const navigate = useNavigate();
  const refreshToCourseWebsite = (p) => {
    navigate("/course/" + p);
    refreshOnSpot();
  };
  const refreshToProfWebsite = (p) => {
    navigate("/instructor/" + p);
    refreshOnSpot();
  };

  const fetchData = async (e) => {
    // e.preventDefault();
    axios
      .post("http://localhost:3001/fetchCourseInfo", { courseID: cid })
      .then((res) => {
        console.log("this Course", res);
        if (res.data.success) {
          setSuccess(true);
          setYear(res.data.currYear);
          setSem(res.data.currSem);
          setCourseInfo(res.data.courseInfo);
          //-----------------------------------courseData --> based on taught boolean val
          if (res.data.taught) {
            setCourseData(res.data.courseData);
            setTaught(true);
          } else {
            setCourseData([]);
            setTaught(false);
          }
          //-----------------------------------instructor
          if (res.data.ins) {
            setInsData(res.data.instructorData);
            setIsIns(true);
          } else {
            setInsData([]);
            setIsIns(false);
          }
          //-----------------------------------prereq
          if (res.data.pre) {
            setPrereqData(res.data.prereqData);
            setIsPrereq(true);
          } else {
            setPrereqData([]);
            setIsPrereq(false);
          }
        } else {
          setSuccess(false);
          setCourseData([]);
          setMsg(res.data.msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    axios.get("http://localhost:3001/login-session").then((res) => {
      console.log("Courses-use-effect's", res);
      if (res.data.loggedIn) {
        setMsg("Already logged In");
        setIsLoggedIn(true);
        setUserID(res.data.user.rows[0].id);
        fetchData(res.data.user.rows[0].id);
      } else {
        setMsg("Please log In");
        setIsLoggedIn(false);
        setUserID(0);
      }
    });
  }, []);

  return (
    <>
      <div className="pageCourse">
        <div className="introBox">
          {!isLoggedIn && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && (
            <>
              <div className="loggedIn">
                <div className="loggedIn-left">
                  Course Info Page <br />
                  <hr />
                  USER {userID}
                </div>

                <div className="loggedIn-right">
                  {console.log("anubhab", CourseInfo)}
                  <b>ID</b> <em>{CourseInfo[0].course_id} </em>
                  <br />
                  <b>Name </b> <em>{CourseInfo[0].title}</em> <br />
                  <b>Credits </b>
                  <em>{CourseInfo[0].credits}</em> <br />
                  <b>Dept</b> <em>{CourseInfo[0].dept_name}</em>
                </div>
              </div>
            </>
          )}
        </div>

        {isLoggedIn && (
          <div className="homeContent">
            <div className="tableHomeContent">
              {success ? (
                <>
                  <div className="year-box">
                    {taught ? (
                      <>
                        <div>
                          <label>
                            Current Semester : {year}, {sem}
                          </label><br/>
                          <label>More Details Section-wise</label>
                          <TableCourses d={Coursedata} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label>
                            Current Semester : {year}, {sem}
                          </label>
                          <br/>
                          <label>
                            No Section Info available for this Course. <br />{" "}
                            Maybe never taught or taken.{" "}
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="year-box">
                    {isPrereq ? (
                      <>
                        <div>
                          <label>Course Prerequisites</label>
                          <TablePrereq
                            d={prereqData}
                            f={refreshToCourseWebsite}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <label>No Prerequisites for this Course</label>
                      </>
                    )}
                  </div>

                  <div className="year-box">
                    {isIns ? (
                      <>
                        <div>
                          <label>Course Instructors</label>
                          <TableIns d={insData} f={refreshToProfWebsite} />
                        </div>
                      </>
                    ) : (
                      <>
                        <label>
                          No Instructor Data available for this Course
                        </label>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="year-box">
                    <div>
                      <label>ERROR ~ {msg}</label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
