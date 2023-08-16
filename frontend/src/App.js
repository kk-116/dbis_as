import "./App.css";
import "./Components/CSS/Home.css";
import "./Components/CSS/Instructor.css";
import "./Components/CSS/Course.css";
import "./Components/CSS/Registration.css";
import Login from "./Components/Pages/Login";
import axios from "axios";
// import { useState, useEffect } from 'react';

import React from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import About from "./Components/Pages/About";
import Home from "./Components/Pages/Home";
import NoMatch from "./Components/Pages/NoMatch";
import { Navbar } from "./Components/UI/Navbar";
import AllInstructors from "./Components/Pages/Instructors";
import AllCourses from "./Components/Pages/Courses";
import Registration from "./Components/Pages/Registration";
import CourseInfo from "./Components/Pages/CourseInfo";
import AllDepts from "./Components/Pages/Depts";
import AllCoursesOfDept from "./Components/Pages/DeptCourses";
import InstructorInfo from "./Components/Pages/InstructorInfo";

function App() {
  axios.defaults.withCredentials = true;

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Home />}></Route>
          <Route exact path="/home" element={<Home />}></Route>
          <Route exact path="/about" element={<About />}></Route>
          <Route exact path="/login" element={<Login />}></Route>
          <Route exact path="/instructor" element={<AllInstructors />}></Route>
          <Route exact path="/instructor/:instructor_id" element={<InstructorInfo />}></Route>
          <Route exact path="/course" element={<AllCourses />}></Route>
          <Route exact path="/home/registration" element={<Registration />}></Route>
          <Route exact path="/course/running/" element={<AllDepts />}></Route>
          <Route exact path="/course/running/:dept_name" element={<AllCoursesOfDept />}></Route>
          <Route exact path="/course/:cid" element={<CourseInfo />}></Route>

          <Route exact path="*" element={<NoMatch />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;