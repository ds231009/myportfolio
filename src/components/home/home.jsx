import { useState, useEffect } from "react";

import styles from "./home.module.css"

function Home(system) {
    const text = "I am a dual bachelor student \n Junior Data Scientist \n Full Stack Developer and \n aspiring UI/UX Designer";
    const [index, setIndex] = useState(0);
    const [timout, setTimout] = useState(50);

    useEffect(() => {
        if (index < text.length) {
            text[index] === " " ? setTimout(200) : setTimout(100);
            const timeout = setTimeout(() => {
                setIndex(index + 1);
            }, timout);
            return () => clearTimeout(timeout);
        }
    }, [index]);

    return (
      <div className={styles.home}>
          {system.system}
          <h1 className={styles.name}>Julian Pecho</h1>
          {/*<div className={styles.sub}>I am a student and aspiring Data Scientist</div>*/}
          <div className={styles.sub}>
              {text.slice(0,index)}
              {/*<span className={styles.cursor}>|</span>*/}
          </div>
      </div>
  )
}

export default Home
