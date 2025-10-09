import React, { useEffect } from "react";
import Experience from "./Experience/Experience";

const App: React.FC = () => {
  useEffect(() => {
    new Experience("#sketch");
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "black",
      }}
    >
      <div id="sketch"></div>
      <div className="loader-screen">
        <div className="loading-container">
          <div className="loading">
            <span style={{ "--i": 0 } as React.CSSProperties}>L</span>
            <span style={{ "--i": 1 } as React.CSSProperties}>O</span>
            <span style={{ "--i": 2 } as React.CSSProperties}>A</span>
            <span style={{ "--i": 3 } as React.CSSProperties}>D</span>
            <span style={{ "--i": 4 } as React.CSSProperties}>I</span>
            <span style={{ "--i": 5 } as React.CSSProperties}>N</span>
            <span style={{ "--i": 6 } as React.CSSProperties}>G</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
