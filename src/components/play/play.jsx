import {Link, Route, Routes} from "react-router-dom";
import Home from "./playHome.jsx";
import Projects from "../projects/projects.jsx";
import Sudoku from "./sudoku.jsx";

function Play() {

    return (
      <div className={"Play"}>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="str8ts" element={<Sudoku />} />
              <Route path="sudoku" element={<Sudoku />} />
              <Route path="wordle" element={<Sudoku />} />
              <Route path="ubongo" element={<Sudoku />} />
              <Route path="*" element={<Home />} />
          </Routes>
      </div>
  )
}

export default Play
