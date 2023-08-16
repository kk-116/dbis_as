import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Table = (p) => {
  const data = p.d;
  return (
    <table className="insTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Dept Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => {
          return (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{e.dept_name}</td>
              <td>
                <button
                  className="regButton"
                  onClick={() => {
                    // alert("Visit website of dept " + e.dept_name);
                    p.f(e.dept_name);
                  }}
                >
                  Dept Website
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default function AllDepts(props) {
  const [data, setData] = useState([{}]);
  const [msg, setMsg] = useState("Please log in");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(0);

  const refreshOnSpot = () => window.location.reload(true);
  const navigate = useNavigate();
  const refreshToDeptWebsite = (p) => {
    navigate("/course/running/" + p);
  };

  const fetchData = async (e) => {
    // e.preventDefault();
    axios
      .get("http://localhost:3001/fetchALLDepts")
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

  return (
    <>
      <div className="pageCourse">
        <div className="introBox">
          {!isLoggedIn && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && (
            <>
              <div className="loggedIn">
                <div className="loggedIn-left">
                  Dept. Course Page <br />
                  <hr />
                  USER {userID}
                </div>

                <div className="loggedIn-right">
                  <p>
                    
                    Check out our New All Courses Page <br/>
                    <Link to="/course">
                      <button className="tableButton promo">
                          Beta version
                      </button>
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {isLoggedIn && (
          <div className="homeContent">
            <div className="tableHomeContent">
              <div className="year-box">
                <div>
                  <label>Select your search Department</label>
                  <Table d={data} f={refreshToDeptWebsite} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
