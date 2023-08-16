import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

const RegTable = (p) => {
  const options = [
    { label: "-", value: "0" },
    { label: "s1", value: "1" },
    { label: "s2", value: "2" },
    { label: "s3", value: "3" },
  ];
  const optionArr = p.secArrr;
  const data = p.d;
  const c = data.map((e, index) => {
    return { cid: e.course_id, sec: "NA" };
  });

  const [value, setValue] = useState(c);
  // setValue(c);
  const [first, setFirst] = useState(true);
  //why doing this (see first useage below) -> because when filtered data comes in 1st on loadding page, its empty. So c will have [] and it will be set upon value.
  //now later in the loop we are updating the value, but as its [], all updated values are also [].
  //hence 1st time we use c, 2nd time onwards we use value

  function setValue2(course, sec) {
    var v;
    if (first) {
      v = c;
      setFirst(false);
    } else {
      v = value;
    }
    //v is array of jsons
    for (let x in v) {
      if (v[x].cid === course) {
        v[x].sec = sec;
      }
    }
    setValue(v);
  }

  function giveSecList(code) {
    var optionArr2 = [];
    optionArr2.push({ label: "-", value: "0" });
    for (let i in optionArr) {
      if (optionArr[i].code === code) {
        for (let j in optionArr[i].secArr) {
          var t = optionArr[i].secArr[j];
          optionArr2.push({ label: "s" + t, value: t });
        }
      }
    }
    return optionArr2;
  }
  return (
    <table className="homeTable dropTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Course Code</th>
          <th>Course Name</th>
          <th>Dept. Name</th>
          <th>Credits</th>
          <th>Section Choice</th>
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
              <td>{e.dept_name}</td>
              <td>{e.credits}</td>
              <td>
                <>
                  <div>
                    <select
                      // value={value[indexCourse(e.course_id)].sec}
                      value={value.course_id}
                      onChange={(p) => {
                        setValue2(e.course_id, p.target.value);
                      }}
                    >
                      {giveSecList(e.course_id).map((option, index) => (
                        <option key={index} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              </td>
              <td>
                <button
                  className="tableButton"
                  onClick={() => {
                    var s;
                    for (let x in value) {
                      if (value[x].cid === e.course_id) {
                        s = value[x].sec;
                      }
                    }

                    p.f1(true); //display promt
                    p.f2({
                      //set data for prompt box
                      sId: p.sId,
                      cId: e.course_id,
                      year: p.year,
                      sem: p.sem,
                      sec: s,
                      cred: e.credits,
                    });
                  }}
                >
                  Register
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const DoneTable = (p) => {
  const data = p.d;

  return (
    <table className="homeTable dropTable">
      <thead>
        <tr>
          <th>Index</th>
          <th>Course Code</th>
          <th>Course Name</th>
          <th>Dept. Name</th>
          <th>Credits</th>
          <th>Section</th>
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
              <td>{e.sec_id}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const Search = (p) => {
  // note: the id field is mandatory
  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    console.log(string, results);
    var a = results.map((e) => {
      return e.code;
    });
    p.f(a);
  };
  const handleOnHover = (result) => {
    // the item hovered
    console.log(result);
  };
  const handleOnSelect = (item) => {
    // the item selected
    console.log(item);
    p.f([item.code]);
  };
  const handleOnFocus = () => {
    console.log("Focused");
  };
  const formatResult = (item) => {
    return (
      <>
        <span style={{ display: "block", textAlign: "left" }}>
          <em>{item.name}</em>
        </span>
        <span style={{ display: "block", textAlign: "left" }}>
          {item.title}
        </span>
      </>
    );
  };
  return (
    <div className="">
      <header className="">
        <div style={{ width: "400px", marginTop: "10px" }}>
          <ReactSearchAutocomplete
            items={p.items}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            autoFocus
            formatResult={formatResult}
          />
        </div>
      </header>
    </div>
  );
};

export default function Registration(props) {
  const [data, setData] = useState([{}]);
  const [msg, setMsg] = useState("Please log in");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [userID, setUserID] = useState(0);
  const [studData, setStudData] = useState([{}]);
  const [reducedList, setReducedList] = useState([]);
  const [isReg, setReg] = useState(false);
  const [doneData, setdoneData] = useState([{}]);
  const [displayPrompt, setDisplayPrompt] = useState(false);
  const [year, setYear] = useState("");
  const [sem, setSem] = useState("");
  const [regMsg, setRegMsg] = useState("Pending Registration ...");

  const [regData, setRegData] = useState({
    sId: userID,
    cId: "",
    year: year,
    sem: sem,
    sec: "1",
    cred: "",
  });

  const refreshOnSpot = () => window.location.reload(true);
  const navigate = useNavigate();
  const refreshToProfWebsite = (p) => {
    navigate("/instructor/" + p);
  };

  const regFunc = async (p) => {
    if (
      p.sId === null ||
      p.sId === "" ||
      p.cID === null ||
      p.cID === "" ||
      p.year === null ||
      p.year === "" ||
      p.sem === null ||
      p.sem === "" ||
      p.sec === null ||
      p.sec === "NA" ||
      typeof p.sec === "undefined" ||
      p.cred === null
    ) {
      setRegMsg("Invalid data ~ server POST Request Aborted.");
    } else {
      axios
        .post("http://localhost:3001/regCourse", {
          studID: p.sId,
          cID: p.cId,
          year: p.year,
          sem: p.sem,
          sec_id: p.sec,
          credits: p.cred,
        })
        .then((res) => {
          if (res.data.success) {
            setRegMsg(res.data.msg);
          } else {
            setRegMsg(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const validateAndFetchCourses = async (e) => {
    // e.preventDefault();
    axios
      .post("http://localhost:3001/validateStudAndFetchCourses", {
        userID: e,
      })
      .then((res) => {
        console.log("llll", res.data);
        if (res.data.stud) {
          setIsStudent(true);
          if (res.data.reg) {
            setReg(true);
            setData(res.data.courseData);
            setdoneData(res.data.doneData);
            setYear(res.data.year);
            setSem(res.data.sem);
          } else {
            setReg(false);
            setMsg("Reg period has passed. Contact the Academic office");
          }
        } else {
          setIsStudent(false);
          setData([]);
          setMsg(
            "Logged in User is not a Student. Registration info unaccessible."
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axios.get("http://localhost:3001/login-session").then((res) => {
      console.log("Reg-use-effect's", res);
      if (res.data.loggedIn) {
        setMsg("Already logged In");
        setIsLoggedIn(true);
        setUserID(res.data.user.rows[0].id);
        // fetchData(res.data.user.rows[0].id);
        // checkStudent(res.data.user.rows[0].id);//check if the logged in user is a student or not
        validateAndFetchCourses(res.data.user.rows[0].id);
      } else {
        setMsg("Please log In");
        setIsLoggedIn(false);
        setUserID(0);
        setIsStudent(false);
      }
    });
  }, []);

  // const a = data.map((e, index) => {
  //     return ({"id":index,"name":(e.course_id+" "+e.title),"code":e.course_id,"title":e.title});
  //   });
  const b = data.map((e) => {
    return {
      name: e.course_id + " " + e.title,
      code: e.course_id,
      title: e.title,
    };
  });
  const d = data.map((e) => {
    return {
      code: e.course_id,
      title: e.title,
      dept: e.dept_name,
      cred: e.credits,
    };
  });
  const d1 = data.map((e) => {
    return {
      code: e.course_id,
      sec: e.sec_id,
    };
  });
  var tempd = [];
  for (let x in d1) {
    if (tempd.length === 0) {
      var t = [];
      t.push(d1[x].sec);
      tempd.push({ code: d1[x].code, secArr: t });
    } else {
      var match = false;
      for (let y in tempd) {
        if (d1[x].code === tempd[y].code) {
          tempd[y].secArr.push(d1[x].sec);
          match = true;
          break;
        }
      }
      if (!match) {
        var t1 = [];
        t1.push(d1[x].sec);
        tempd.push({ code: d1[x].code, secArr: t1 });
      }
    }
  }
  console.log("k", tempd);
  // const search_data = [...new Set(a)];
  const search_data0 = [...new Set(b.map((e) => JSON.stringify(e)))].map(
    JSON.parse
  ); //get unique years ie ignore multiple sections in search bar results
  const search_data = search_data0.map((e, index) => {
    return { id: index, name: e.name, code: e.code, title: e.title };
  });

  const d0 = [...new Set(d.map((e) => JSON.stringify(e)))].map(JSON.parse);
  const red_data = d0.map((e, index) => {
    return {
      course_id: e.code,
      title: e.title,
      dept_name: e.dept,
      credits: e.cred,
    };
  });

  return (
    <>
      <div className={displayPrompt ? "promptPage" : "hidden"}>
        <div className="promptBox">
          <div className="promptIntro">
            <label>REGISTRATION CONFIRMATION</label>

            <hr />
            <table className="promptTable">
              <tr>
                <th>Attribute</th>
                <th>Value</th>
              </tr>
              <tr>
                <td>Student ID</td>
                <td>{regData.sId}</td>
              </tr>
              <tr>
                <td>Course ID</td>
                <td>{regData.cId}</td>
              </tr>
              <tr>
                <td>Year</td>
                <td>{regData.year}</td>
              </tr>
              <tr>
                <td>Semester</td>
                <td>{regData.sem}</td>
              </tr>
              <tr>
                <td>Course Credits </td>
                <td>{regData.cred}</td>
              </tr>
              <tr>
                <td>Section</td>
                <td>{regData.sec}</td>
              </tr>
            </table>
          </div>
          <div className="promptBody">
            <button
              className="promptButton"
              onClick={() => {
                regFunc(regData);
              }}
            >
              REGISTER
            </button>
            <br />
            <p>Console ~ {regMsg}</p>
            <hr />
            <button
              className="promptButton"
              style={{ marginTop: "40px" }}
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

      <div className="pageRegistration">
        <div className="introBox">
          {!isLoggedIn && <div className="loggedOut">{msg}</div>}
          {isLoggedIn && (
            <>
              <div className="loggedIn">
                {isStudent && (
                  <>
                    <div className="loggedIn-left">
                      Registration Page <br />
                      <hr />
                      STUDENT {userID}
                    </div>

                    <div className="loggedIn-right">
                      <b>Current Year </b>
                      <em>{year}</em> <br />
                      <b>Current Semester</b> <em>{sem}</em>
                    </div>
                  </>
                )}

                {!isStudent && (
                  <>
                    {" "}
                    Logged in user is NOT a Student.
                    <br /> Registration inaccessible.
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {isLoggedIn && isStudent && (
          <div className="homeContent">
            <div className="tableHomeContent">
              <div className="year-box">
                <div>
                  <label>
                    Already Registered courses for the current Semester.
                    <br /> To drop any of these registered courses visit the
                    Home Dashboard.{" "}
                  </label>
                  <DoneTable d={doneData} />
                </div>
              </div>
              {!isReg ? (
                <>
                  <div className="year-box">
                    <label>
                      Registration period has passed for the Current Semester.
                      <br /> Please contact the Academic Office.{" "}
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="year-box">
                    <div>
                      <label>Enter Course name or Course code(Id)</label>
                      <Search items={search_data} f={setReducedList} />
                    </div>
                    <div>
                      {console.log("aa", reducedList)}
                      {console.log(
                        "bb-filtered",
                        red_data.filter((e) =>
                          reducedList.includes(e.course_id)
                        )
                      )}
                      {console.log("bb-original", red_data)}
                      <RegTable
                        // d={red_data}
                        d={red_data.filter((e) =>
                          reducedList.includes(e.course_id)
                        )}
                        f1={setDisplayPrompt}
                        f2={setRegData}
                        year={year}
                        sem={sem}
                        sId={userID}
                        secArrr={tempd}
                      />
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
