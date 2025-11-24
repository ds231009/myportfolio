import {Link, Route, Routes} from "react-router-dom";
import Projects from "../projects/projects.jsx";
import Education from "../education/education.jsx";
import Experience from "../experience/experience.jsx";

function Play() {

    return (
      <div className={"Home"}>
          <nav>
              <Link to="/play/sudoku" >Sudoku</Link>
              <Link to="/play/str8ts">Str8ts</Link>
              <Link to="/play/wordle">Wordle</Link>
              <Link to="/play/ubongo">Ubongo</Link>
          </nav>
      </div>
  )
}

export default Play
