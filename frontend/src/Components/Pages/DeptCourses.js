import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";


const Table = (p) => {
    const data = p.d;
    return (
      <table className="insTable">
        <thead>
          <tr>
            <th>Index</th>
            <th>Course ID</th>
            <th>Course Name</th>
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
                <td><button className="regButton" onClick=
                    {()=>{
                        // alert("Visit website of course "+e.title);
                        p.f(e.course_id);
                        }}>Course Website</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };




export default function AllCoursesOfDept(props) {
    const {dept_name} = useParams()


    const [data, setData] = useState([{}]);
    const [msg, setMsg] = useState("Please log in");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userID, setUserID] = useState(0);

    const refreshOnSpot = () => window.location.reload(true)
    const navigate = useNavigate()
    const refreshToCourseWebsite = (p) => {
        navigate('/course/'+p)
    }


    const fetchData = async (e) => {
      // e.preventDefault();
      axios
          .post("http://localhost:3001/fetchALLCoursesOfDept",{
            dName : e
          })
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
            fetchData(dept_name);
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
                  {dept_name} Dept. Page <br />
                  <hr />
                  USER {userID}
                </div>

                <div className="loggedIn-right">
                  <p>
                    
                    Head over to any Course Website for detailed Info <br/>
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
                  <label>Find your Course</label>
                  <Table d={data} f={refreshToCourseWebsite} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}



