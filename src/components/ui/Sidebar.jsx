import styles from './Sidebar.module.css';

import {Link, useLocation, useParams} from "react-router-dom";

function Sidebar() {
    const location = useLocation();
    const path = location.pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings
    console.log(location, path);

    const navLinks = [
        {
            path: "/projects",
            label: "Projects",
            subpaths:
                [
                    {
                        path: "/cpi",
                        label: "Esports Broadcasting"
                    },
                    {
                        path: "/ai-agent",
                        label: "Okay AI, how does AI influence IT Security?"
                    },
                    {
                        path: "/ai-benchmark",
                        label: "Humanities last patronus? Benchmarking AI"
                    },
                    {
                        path: "/ccl1",
                        label: "Creative Code Lab I"
                    },
                    {
                        path: "/ccl2",
                        label: "Creative Code Lab II"
                    }
                ],
        },
        {
            path: "/education",
            label: "Education",
            subpaths: []
        },
        {
            path: "/experience",
            label: "Experience",
            subpaths: []
        },
        {
            path: "/play",
            label: "Play a game",
            subpaths:
                [
                    {
                        path: "/wordle",
                        label: "Wordle"
                    },
                    {
                        path: "/str8ts",
                        label: "Str8ts"
                    }
                ],
        }
    ];



    return (
        <aside>
            <nav>
                {navLinks.map(link => (
                    <div className=
                             {styles.link}
                    >
                        <div className=
                             {`${styles.path} ${link.path === "/" + path[0] ? styles.active : ""}`}
                        >
                            <Link key={link.label} to={link.path}>
                                {link.label}
                            </Link>

                            {(link.path === "/" + path[0] &&  !(path[1])) ?
                                <Link to={"/"}>✗
                                </Link>
                                :
                                null
                            }
                        </div>
                        <div className={styles.subpaths}>
                            {path[1] && link.path === "/" + path[0] ? (
                                link.subpaths.map(sublink => {
                                    const isActive = sublink.path === "/" + path[1];

                                    return (
                                        <div
                                            key={sublink.label}
                                            className={
                                            `${styles.subpath} 
                                            ${isActive ? styles.active : ""}
                                            `}
                                        >
                                            {!(isActive) ? (
                                                // ACTIVE: clickable link
                                                <Link to={link.path + sublink.path}>
                                                    {sublink.label}
                                                </Link>
                                            ) : (
                                                // NOT ACTIVE: plain text (no link)
                                                <span>{sublink.label}</span>
                                            )}

                                            {/* Close button only on active */}
                                            {isActive && (
                                                <Link to={"/" + path[0]}>✗</Link>
                                            )}
                                        </div>
                                    );
                                })
                            ) : null}
                        </div>

                    </div>
                ))}

            </nav>

        </aside>
        )
    }

export default Sidebar
