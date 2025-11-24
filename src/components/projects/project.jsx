function Project(project) {
    project = project.projects;

    return (
        <div className={"project"}>
            <div></div>
            <div>
                <div>{project.name}</div>
                <div>Desc</div>
                <div>
                    {
                        project.program.map((program) =>
                            <div>{program}</div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Project
