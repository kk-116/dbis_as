import React from "react";

export default function About() {
  return (
  
      <div className="pageHome">
        <div className="introBox expandedIntroBox">
          <div className="loggedOut aboutUs">
            <label> MADE WITH 🧡 BY ANUBHAB & KAMAL </label>
            <hr />
            <p>
              You can find us here:
              <br />
              IIT Bombay, Hostel 9<br />
              Room 249 & 251
              <br />
              Powai, Maharashtra - 400076
            </p>
            <p className="centered">
              For further queries, connect with Us{" "}<br/>
              <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
				<button className="regButton">HERE</button>
			  </a>
            </p>
          </div>
        </div>
      </div>
   
  );
}
