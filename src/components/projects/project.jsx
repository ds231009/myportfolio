import styles from "./project.module.css"

function Project(project) {
    project = project.projects;
    console.log(project.tech);
    return (
        <div className={styles.project}>
            {/*<div className={styles.image}>Image placeholder</div>*/}
            <div className={styles.projectContent}>
                <div className={styles.header}>
                    <h2 className={styles.projectName}>{project.name}</h2>
                    <span className={styles.dateLoc}>{project.date} @ {project.location}</span>
                </div>
                <p className={styles.projectDescription}>{project.description}</p>
                    <div className={styles.programs}>
                    {
                        project.tech.software.map((program) =>
                            <div className={`${styles.programItem} ${styles.software}`} key={program}>{program}</div>
                        )
                    }
                    {
                        project.tech.technique.map((program) =>
                            <div className={`${styles.programItem} ${styles.technique}`} key={program}>{program}</div>
                        )
                    }
                    </div>
            </div>
        </div>
    )
}

export default Project
