import Project from "./project.jsx";

function Projects() {
    const projects = [
        {"name" : "Project A",  "description" : "A simple project", "program" : ["A","B"]},
        {"name" : "Project B",  "description" : "A simple project", "program" : ["B"]},
        {"name" : "Project C",  "description" : "A simple project", "program" : []},
    ]

    return (
      <div className={"projects"}>
          {projects.map((project) =>
          <Project key={project.name} projects={project} />
          )}
      </div>
  )
}

export default Projects
