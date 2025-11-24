import {Route, Routes} from "react-router-dom";
import Home from "../home/home.jsx";
import Projects from "../projects/projects.jsx";
import Education from "../education/education.jsx";
import Experience from "../experience/experience.jsx";

function Play() {

    return (
      <div className={"Play"}>
          Play
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="projects" element={<Projects />} />
              <Route path="*" element={<Home />} />
          </Routes>
      </div>
  )
}

export default Play
