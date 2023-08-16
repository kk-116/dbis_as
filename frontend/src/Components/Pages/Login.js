import axios from "axios";
// import { Axios } from "axios";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import React, {useRef, useEffect, useState} from 'react';

// const verifyLogin = async (e)=>{
//     e.preventDefault();
//     console.log(e);
//     const formData = new FormData(e.target);
//     const data = Object.fromEntries(formData);
//     // const tokenData = await chrome.storage.sessions.get(['token','account'] && tokenData.token);
//     if(data.login_otp){
//       fetch('/api/v1/accounts/get-otp', {
//         method: "POST",
//         headers: {
//           'Content-Type' : 'application/json',
//           // 'Authorisation' : `Bearer ${tokenData.token}`
//         },
//         body: JSON.stringify({
//           : data.
//         })
//       })
//       .then(response => response.json())
//       .then(data => {
//         setAccountDetails(data)
//       }).catch(e => {
//         console.log('Error!!');
//       });
//     }
//   };

export default function Login(props) {
  const [msg, setMsg] = useState("Please log in");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userID, setUserID] = useState(0);
  useEffect(() => {
    axios.get("http://localhost:3001/login-session").then((res) => {
      console.log("login-use-effect's", res);
      if (res.data.loggedIn) {
        setMsg("Already logged In");
        setIsLoggedIn(true);
        setUserID(res.data.user.rows[0].id);
      } else {
        setMsg("Please log In");
        setIsLoggedIn(false);
        setUserID(0);
      }
    });
  }, []);

  const verifyLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log("ANUBHAB sending -> ", data);
    // const tokenData = await chrome.storage.sessions.get(['token','account'] && tokenData.token);

    axios({
      url: "http://localhost:3001/verify_login",
      method: "POST",
      headers: {
        // 'Content-Type' : 'application/json',
        authorization: "your token comes here",
      },
      data: data,
    })
      .then((res) => {
        console.log(res);
        setMsg(res.data.msg);
        setIsLoggedIn(res.data.success);
        if (res.data.success) {
          refreshToHome();
          refreshOnSpot();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const refreshOnSpot = () => window.location.reload(true);
  const navigate = useNavigate();
  const refreshToHome = () => {
    navigate("/");
  };
  const logout = async () => {
    axios.get("http://localhost:3001/logout-session").then((res) => {
      console.log("log-out's", res);
    });
    refreshToHome();
    refreshOnSpot();
  };

  return (
    <div className="pageLogin">
      {!isLoggedIn && (
        <>
          <div className="formLoginBox">
            <p>Login for Registered Users</p>

            <form className="LoginForm" onSubmit={verifyLogin}>
              <div className="login-entry">
                <label htmlFor="studentID">
                  Student ID
                </label>
                <input
                  type="text"
                  id="studID"
                  placeholder="your id"
                  name="studID"
                />
              </div>
              <div className="login-entry">
                <label htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="pwd"
                  placeholder="your password"
                  name="pwd"
                />
              </div>
              <em>console :~ {msg}</em>
              <button type="submit" value="Log In" className="login-button">
                <span>Log in</span>
              </button>
            </form>
          </div>
        </>
      )}

      {isLoggedIn && (
        <div className="formLoginBox" style={{height:"30%"}}>
            <p>User already logged In</p>
          <div className="LoginForm">  
          <button type="submit" value="Log Out" onClick={logout} className="login-button">
            Log Out
          </button>
          </div>
        </div>
      )}

      {/* <h3> {msg} </h3> */}
    </div>
  );
}
