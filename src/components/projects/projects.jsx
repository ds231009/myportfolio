import Project from "./project.jsx";

function Projects() {
    const projects = ["a","b","c","d"]

    return (
      <div className={"projects"}>
          {projects.map((post) =>
              <div key={post}>
                  {post}
              </div>
          )}
          <Project projects={projects[0]} />
      </div>
  )
}

export default Projects
