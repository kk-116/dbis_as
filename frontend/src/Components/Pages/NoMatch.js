import React from "react";

export default function NoMatch() {
  return (
    <>
      <div className="pageHome">
        <div className="introBox">
          <div className="loggedOut">
            <label> No Match found for this URL :(</label>
          </div>
        </div>
      </div>
    </>
  );
}
