import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Table = (p) => {
  const data = p.d;
  return (
    <table className="insTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Course ID </th>
          <th>Title</th>
          <th>Credits</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.course_id}</td>
              <td>{e.title}</td>
              <td>{e.credits}</td>
              <td>
                <button
                  className="tableButton"
                  onClick={() => {
                    // alert(
                    //   "Visit website of course  " +
                    //     e.course_id +
                    //     " ( " +
                    //     e.dept_name +
                    //     " )"
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

export default function AllCourses(props) {
  const [data, setData] = useState([{}]);
  const [msg, setMsg] = useState("Please log in");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(0);

  const refreshOnSpot = () => window.location.reload(true);
  const navigate = useNavigate();
  const refreshToCourseWebsite = (p) => {
    navigate("/course/" + p);
  };

  const fetchData = async (e) => {
    // e.preventDefault();
    axios
      .get("http://localhost:3001/fetchALLCourses")
      .then((res) => {
        // console.log("All Courses", res);
        setData(res.data);
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

  const a = data.map((e) => {
    return e.dept_name;
  });
  const dept = [...new Set(a)]; //get unique depts

  return (
    <>
      <div className="pageCourse">
        <div className="introBox">
          {!isLoggedIn && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && (
            <>
              <div className="loggedIn">
                <div className="loggedIn-left">
                  All Courses Page <br />
                  <hr />
                  USER {userID}
                </div>

                <div className="loggedIn-right">
                  <p>
                    List of all available Courses <br />
                    Department wise
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {isLoggedIn && (
          <div className="homeContent">
            <div className="tableHomeContent">
              {dept.map((e, index) => {
                return (
                  <div key={index} className="year-box">
                    {data.filter((f) => {
                      return f.dept_name === e;
                    }).length > 0 && (
                      <div>
                        <label>Dept {e}</label>
                        <Table
                          key={e + "Dept"}
                          d={data.filter((f) => {
                            return f.dept_name === e;
                          })}
                          f={refreshToCourseWebsite}
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
