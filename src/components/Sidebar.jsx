import {Link} from "react-router-dom";

function Sidebar() {

  return (
      <aside>
          <nav>
              <Link to="/projects" >Projects</Link>
              <Link to="/education">Education</Link>
              <Link to="/experience">Experience</Link>
              <Link to="/play">Play a game</Link>
          </nav>
      </aside>
  )
}

export default Sidebar
