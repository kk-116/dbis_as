import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TableCourse = (p) => {
  const data = p.d;
  return (
    <table className="homeTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Course </th>
          <th>Credits</th>
          <th>Grade</th>
          <th>Section ID</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.course_id}</td>
              <td>{e.credits}</td>
              <td>{e.grade}</td>
              <td>{e.sec_id}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const TableDrop = (p) => {
  const data = p.d;
  return (
    <table className="homeTable dropTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Course </th>
          <th>Credits</th>
          <th>Grade</th>
          <th>Section ID</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.course_id}</td>
              <td>{e.credits}</td>
              <td>{e.grade}</td>
              <td>{e.sec_id}</td>
              <td>
                <button
                  className="tableButton"
                  onClick={() => {
                    p.f1(true); //display promt
                    p.f2({
                      //set data for prompt box
                      sId: p.sID,
                      cId: e.course_id,
                      year: p.year,
                      sem: p.sem,
                      sec: e.sec_id,
                      cred: e.credits,
                    });
                  }}
                >
                  Drop
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

function Home(props) {
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState("Please log in");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(0);
  const [isStudent, setIsStudent] = useState(false);
  const [curr_year, setCurrYear] = useState("");
  const [curr_sem, setCurrSem] = useState("");
  const [reg, setReg] = useState(false);

  const [dropMsg, setDropMsg] = useState("Pending Drop ...");
  const [displayPrompt, setDisplayPrompt] = useState(false);
  const [dropData, setDropData] = useState({
    sId: userID,
    cId: "",
    year: curr_year,
    sem: curr_sem,
    sec: "",
    cred: "",
  });

  const refreshOnSpot = () => window.location.reload(true);
  const navigate = useNavigate();
  const refreshToProfWebsite = (p) => {
    navigate("/instructor/" + p);
  };

  const dropFunc = async (p) => {
    axios
      .post("http://localhost:3001/dropCourse", {
        studID: p.sId,
        cID: p.cId,
        year: p.year,
        sem: p.sem,
        sec_id: p.sec,
        credits: p.cred,
      })
      .then((res) => {
        if (res.data.success) {
          setDropMsg(res.data.msg);
        } else {
          setDropMsg(res.data.msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const validateAndFetchData = async (e) => {
    // e.preventDefault();
    axios
      .post("http://localhost:3001/validateStudAndFetchStudInfo", { userID: e })
      .then((res) => {
        console.log("kamal", res);
        if (res.data.success) {
          setIsStudent(true);
          setData(res.data.studData);
          setReg(res.data.reg);
          setCurrSem(res.data.sem);
          setCurrYear(res.data.year);
        } else {
          setIsStudent(false);
          setData([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axios.get("http://localhost:3001/login-session").then((res) => {
      console.log("Home-use-effect's", res);
      if (res.data.loggedIn) {
        setMsg("Already logged In");
        setIsLoggedIn(true);
        setUserID(res.data.user.rows[0].id);
        validateAndFetchData(res.data.user.rows[0].id); //this data from cookie & do everything
      } else {
        setMsg("Please log In");
        setIsLoggedIn(false);
        setUserID(0);
      }
    });
  }, []);

  const a = data.map((e) => {
    return e.year;
  });
  const yr = [...new Set(a)]; //get unique years

  return (
    <>
      <div className={displayPrompt ? "promptPage" : "hidden"}>
        <div className="promptBox">
          <div className="promptIntro">
            <label>DROP CONFIRMATION</label>

            <hr />
            <table className="promptTable">
              <tr>
                <th>Attribute</th>
                <th>Value</th>
              </tr>
              <tr>
                <td>Student ID</td>
                <td>{dropData.sId}</td>
              </tr>
              <tr>
                <td>Course ID</td>
                <td>{dropData.cId}</td>
              </tr>
              <tr>
                <td>Year</td>
                <td>{dropData.year}</td>
              </tr>
              <tr>
                <td>Semester</td>
                <td>{dropData.sem}</td>
              </tr>
              <tr>
                <td>Course Credits </td>
                <td>{dropData.cred}</td>
              </tr>
              <tr>
                <td>Section</td>
                <td>{dropData.sec}</td>
              </tr>
            </table>
          </div>
          <div className="promptBody">
            <button
              className="promptButton"
              onClick={() => {
                dropFunc(dropData);
              }}
            >
              DROP{" "}
            </button>
            <br />
            <p>Console ~ {dropMsg}</p>
            <hr/>
            <button
              className="promptButton" style={{marginTop:"40px"}}
              onClick={() => {
                setDisplayPrompt(false);
                refreshOnSpot();
              }}
            >
              Close{" "}
            </button>
          </div>
        </div>
      </div>

      <div className="pageHome">
        <div className="introBox">
          {!isLoggedIn && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && (
            <>
              <div className="loggedIn">
                {isStudent && (
                  <>
                    <div className="loggedIn-left">
                      Welcome to ASC <br />
                      <hr />
                      STUDENT {userID}
                    </div>

                    <div className="loggedIn-right">
                      <b>ID</b> <em>{data[0].id} </em>
                      <br />
                      <b>Name </b> <em>{data[0].name}</em> <br />
                      <b>Total Credits </b>
                      <em>{data[0].tot_cred}</em> <br />
                      <b>Dept</b> <em>{data[0].dept_name}</em>
                    </div>
                  </>
                )}

                {!isStudent && <> Logged in user is NOT a Student...</>}
              </div>
            </>
          )}
        </div>

        {isLoggedIn && isStudent && (
          <div className="homeContent">
            <div className="tableHomeContent">
              <div className="year-box">
                {data.filter((f) => {
                  return f.year === curr_year && f.semester === curr_sem;
                }).length > 0 ? (
                  <>
                    <div>
                      <label>Current Semester ~ </label>
                      <label>
                        {curr_year}, {curr_sem}
                      </label>
                      <TableDrop
                        d={data.filter((f) => {
                          return (
                            f.year === curr_year && f.semester === curr_sem
                          );
                        })}
                        f1={setDisplayPrompt}
                        f2={setDropData}
                        year={curr_year}
                        sem={curr_sem}
                        sID={userID}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label>
                      No courses yet Registered for the Current Sem ~{" "}
                    </label>
                    <label>
                      {curr_year}, {curr_sem} .
                    </label>
                    <label>Head over to Registration Dashboard.</label>
                  </>
                )}
              </div>

              {yr.map((e, index) => {
                return (
                  <div key={index} className="year-box">
                    {data.filter((f) => {
                      return f.year === e && f.semester === "Fall";
                    }).length > 0 && (
                      <div>
                        <label>{e}, Fall</label>
                        <TableCourse
                          key={e + "Fall-T"}
                          d={data.filter((f) => {
                            return f.year === e && f.semester === "Fall";
                          })}
                        />
                      </div>
                    )}

                    {data.filter((f) => {
                      return f.year === e && f.semester === "Summer";
                    }).length > 0 && (
                      <div>
                        <label>{e}, Summer</label>
                        <TableCourse
                          key={e + "Spring-T"}
                          d={data.filter((f) => {
                            return f.year === e && f.semester === "Summmer";
                          })}
                        />
                      </div>
                    )}

                    {data.filter((f) => {
                      return f.year === e && f.semester === "Spring";
                    }).length > 0 && (
                      <div>
                        <label>{e}, Spring</label>
                        <TableCourse
                          key={e + "Spring-T"}
                          d={data.filter((f) => {
                            return f.year === e && f.semester === "Spring";
                          })}
                        />
                      </div>
                    )}

                    {data.filter((f) => {
                      return f.year === e && f.semester === "Winter";
                    }).length > 0 && (
                      <div>
                        <label>{e}, Spring</label>
                        <TableCourse
                          key={e + "Spring-T"}
                          d={data.filter((f) => {
                            return f.year === e && f.semester === "";
                          })}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
