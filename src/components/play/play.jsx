import {Link, Route, Routes} from "react-router-dom";
import Home from "./playHome.jsx";
import Projects from "../projects/projects.jsx";
import Sudoku from "./sudoku.jsx";
import Wordle from "./games/wordle/wordle.jsx";
import Str8ts from "./games/str8ts/str8ts.jsx";

import styles from  "./play.module.css"

function Play() {

    return (
      <div className={styles.play}>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="str8ts" element={<Str8ts />} />
              <Route path="sudoku" element={<Sudoku />} />
              <Route path="wordle" element={<Wordle />} />
              <Route path="ubongo" element={<Sudoku />} />
              <Route path="*" element={<Home />} />
          </Routes>
      </div>
  )
}

export default Play
