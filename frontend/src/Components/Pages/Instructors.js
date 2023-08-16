import React, {useEffect, useState} from 'react'
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const Table = (p) => {
    const data = p.d;
    return (
      <table className="insTable">
        <thead>
          <tr>
            <th>Index</th>
            <th>ID </th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e, index) => {
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td><button className='tableButton' onClick=
                    {()=>{
                        // alert("Visit website of Prof. "+e.name +" ( "+e.dept_name+" )");
                        p.f(e.id);
                        }}>Website</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };




export default function AllInstructors(props) {
    const [data, setData] = useState([{}]);
    const [msg, setMsg] = useState("Please log in");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userID, setUserID] = useState("");

    const refreshOnSpot = () => window.location.reload(true)
    const navigate = useNavigate()
    const refreshToProfWebsite = (p) => {
        navigate('/instructor/'+p)
    }


    const fetchData = async (e) => {
    // e.preventDefault();
    axios
        .get("http://localhost:3001/fetchALLInstructors")
        .then((res) => {
            // console.log("All instructors", res);
            setData(res.data);
        })
        .catch((err) => {
            console.log(err);
        });
    };
    useEffect(() => {
    axios.get("http://localhost:3001/login-session").then((res) => {
        console.log("Instructor-use-effect's", res);
        if (res.data.loggedIn) {
            setMsg("Already logged In");
            setIsLoggedIn(true);
            setUserID(res.data.user.rows[0].id);
            fetchData(res.data.user.rows[0].id);
        } else {
            setMsg("Please log In");
            setIsLoggedIn(false);
            setUserID("");
        }
    });
    }, []);

    const a = data.map((e) => {
      return e.dept_name;
    });
    const dept = [...new Set(a)]; //get unique depts
  
    
    return (
      <>
      <div className="pageInstructor">
        <div className="introBox">
          {!isLoggedIn && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && (
            <>
              <div className="loggedIn">
                
                <div className="loggedIn-left">
                  Welcome to Instrutors Page <br />
                  <hr />
                  USER {userID}
                </div>

                <div className="loggedIn-right">
                  <p>List of all available Instructors <br/>Department wise</p>
                </div>
              
              </div>
            </>
          )}
        </div>

        {isLoggedIn  && (
          <div className="homeContent">
            <div className="tableHomeContent">
              {dept.map((e, index) => {
                return (
                  <div key={index} className="year-box">
                    {data.filter((f) => {
                      return f.dept_name === e ;
                    }).length > 0 && (
                      <div>
                        <label>Dept {e}</label>
                        <Table
                          key={e + "Dept"}
                          d={data.filter((f) => {
                            return f.dept_name === e;
                          })}
                          f = {refreshToProfWebsite}
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
    )
}



