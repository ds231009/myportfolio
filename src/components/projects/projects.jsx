import styles from "./projects.module.css"

import Project from "./project.jsx";

function Projects() {
    const projects = [
        {
            "name" : "Esports Broadcasting",
            "description" : "Making startup. Numbers go up and down and up again",
            "tech" :
                {
                    "software": [],
                    "technique": ["Market Research","Business Model"]
                },
            "date": "June 2025",
            "location" : "USTP"
        },
        {
            "name" : "Okay AI, how does AI influence IT Security?",
            "description" : "Creating a local agent-based AI reasearch assistant for scientific papers",
            "tech" :
                {
                    "software": [],
                    "technique": ["Market Research","Business Model"]
                },
            "date": "June 2025",
            "location" : "USTP"
        },
        {
            "name" : "Humanities last patronus? Benchmarking AI",
            "description" : "Benchmarking AI models on there knowledge about Harry Potter with a xy, Co author of Humanities Last Exam",
            "tech" :
                {
                    "software": ["Py"],
                    "technique": ["Machine Learning"]
                },
            "date": "June 2025",
            "location" : "USTP"
        },
        {
            "name" : "Creative Code Lab I",
            "description" : "Creating a 2D Browser Game. Implementing a lot ja ja",
            "tech" :
                {
                    "software":  ["DHTML", "Figma", "Photoshop"],
                    "technique": ["Machine Learning"]
                },
            "date": "June 2025",
            "location" : "USTP"
        },
        {
            "name" : "Creative Code Lab II",
            "description" : "Creating a Full Stack application in REACT and node.js + Database",
            "tech" :
                {
                    "software":  ["React", "node.js", "MySQL", "Figma"],
                    "technique": ["Machine Learning"]
                },
            "date": "June 2025",
            "location" : "USTP"
        }
    ]

    return (
      <div className={styles.projects}>
          {projects.map((project) =>
          <Project key={project.name} projects={project} />
          )}
      </div>
  )
}

export default Projects
