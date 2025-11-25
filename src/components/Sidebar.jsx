import styles from './Sidebar.module.css';

import {Link, useLocation, useParams} from "react-router-dom";

function Sidebar() {
    const id = useLocation()
    var path = id.pathname.split('/').slice(1)
    console.log(id,path)

    const navLinks = [
        { path: "/projects", label: "Projects" },
        { path: "/education", label: "Education" },
        { path: "/experience", label: "Experience" },
        { path: "/play", label: "Play a game" }
    ];
    return (
        <aside>
            <nav>
                {navLinks.map(link => (
                    <div className=
                             {`${styles.link} ${link.path === "/" + path[0] ? styles.active : ""}`}
                    >
                        {/*{link.path === "/" + path[0] ? <div className={styles.line}/> : null}*/}
                        <div className={styles.line}/>

                        <Link key={link.label} to={link.path}>
                            {link.label}
                        </Link>

                        {link.path === "/" + path[0] ?
                            <Link to={"/"}>✗
                            </Link>
                            :
                            null}
                    </div>
                ))}
            </nav>

        </aside>
        )
    }

export default Sidebar
