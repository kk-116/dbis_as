import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const TableTaught = (p) => {
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
          {/* <th>Section</th> */}
          <th>Year</th>
          <th>Semester</th>
          <th>Course's</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.course_id}</td>
              <td>{e.title}</td>
              <td>{e.dept_name}</td>
              <td>{e.credits}</td>
              {/* <td>{e.sec_id}</td> */}
              <td>{e.year}</td>
              <td>{e.semester}</td>
              <td>
                <button
                  className="tableButton"
                  onClick={() => {
                    // alert(
                    //   "Visit website of Course " +
                    //     e.title +
                    //     ", " +
                    //     e.course_id +
                    //     ". "
                    // );
                    p.f(e.course_id);
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
const TableTaughtThisSem = (p) => {
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
              <td>{e.course_id}</td>
              <td>{e.title}</td>
              <td>{e.dept_name}</td>
              <td>{e.credits}</td>
              <td>
                <button
                  className="tableButton"
                  onClick={() => {
                    // alert(
                    //   "Visit website of Course " +
                    //     e.title +
                    //     ", " +
                    //     e.course_id +
                    //     ". "
                    // );
                    p.f(e.course_id);
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

export default function InstructorInfo(props) {
  const { instructor_id } = useParams();

  const [insData, setInsData] = useState([{}]);
  const [courseData, setCourseData] = useState([{}]);

  const [year, setYear] = useState("");
  const [sem, setSem] = useState("");

  const [success, setSuccess] = useState(false);
  const [reg, setReg] = useState(false);
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
    axios
      .post("http://localhost:3001/fetchInstructor_Info", {
        insID: instructor_id,
      })
      .then((res) => {
        console.log("this Instructor", res);
        if (res.data.success) {
          setSuccess(true);
          setInsData(res.data.instructorData);
          setYear(res.data.currYear);
          setSem(res.data.currSem);
          setReg(res.data.reg);
          //-----------------------------------course
          if (res.data.taught) {
            setCourseData(res.data.courseData);
            setTaught(true);
          } else {
            setCourseData([]);
            setTaught(false);
          }
        } else {
          setSuccess(false);
          setInsData([]);
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
      console.log("Instructor-info-use-effect's", res);
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
      <div className="pageInstructor">
        <div className="introBox">
          {!isLoggedIn && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && !success && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && success && (
            <>
              <div className="loggedIn">
                <div className="loggedIn-left">
                  Instructor Home Page <br />
                  <hr />
                  USER {userID}
                </div>

                <div className="loggedIn-right">
                  <b>ID</b> <em>{insData[0].id} </em>
                  <br />
                  <b>Name </b> <em>Prof. {insData[0].name}</em> <br />
                  <b>Dept</b> <em>{insData[0].dept_name}</em>
                </div>
              </div>
            </>
          )}
        </div>

        {isLoggedIn && success && (
          <div className="homeContent">
            <div className="tableHomeContent">
              {taught ? ( //taught some course now or in past
                <>
                  <div className="year-box">
                    {courseData.filter((e) => {
                      return e.year === year && e.semester === sem;
                    }).length > 0 ? (
                      <div>
                        <label>
                          Courses taught by Prof. {insData[0].name} in the
                          Current Sem ~ {year}, {sem}
                        </label>
                        <TableTaughtThisSem
                          d={courseData.filter((e) => {
                            return e.year === year && e.semester === sem;
                          })}
                          f={refreshToCourseWebsite}
                        />
                      </div>
                    ) : (
                      <>
                        <label>
                          No Courses are being taught by Prof. {insData[0].name}{" "}
                          in the Current Sem ~ {year}, {sem}
                        </label>
                      </>
                    )}
                  </div>
                  <div className="year-box">
                    {courseData.filter((e) => {
                      return e.year !== year || e.semester !== sem;
                    }).length > 0 ? (
                      <div>
                        <label>
                          Data of courses taught in previous Semesters
                        </label>
                        <TableTaught
                          d={courseData.filter((e) => {
                            return e.year !== year || e.semester !== sem;
                          })}
                          f={refreshToCourseWebsite}
                        />
                      </div>
                    ) : (
                      <>
                        <label>
                          No Courses are being taught by Prof. {insData[0].name}{" "}
                          in the Previous Sem 
                        </label>
                      </>
                    )}
                  </div>
                </>
              ) : (
                //never taught anything
                <>
                  <div className="year-box">
                    <label>
                      {" "}
                      Instructor Never taught any course till date. <br /> Or
                      the data is not available. Please contact the Academic
                      Office.{" "}
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {isLoggedIn && <>{success && <></>}</>}
    </>
  );
}
