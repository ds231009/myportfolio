import styles from './wordleStyle.module.css'

import { useState, useEffect } from "react";
import {enteredWord, getWord} from "./logic.js";

export default function Wordle() {
    const [solution,setSolution] = useState("")
    const [solutionLength] = useState(5)
    const [isGameOver,setIsGameOver] = useState(false)
    const [board, setBoard] = useState(
        Array(6).fill(null).map(() => Array(solutionLength).fill({ letter: "", status: "empty" }))
    );
    const [currentCell, setCurrentCell] = useState({ row: 0, col: 0 });

    function newGame() {}

    function updateCell(row, col, newCell) {
        setBoard(prevBoard =>
            prevBoard.map((r, rIndex) =>
                r.map((cell, cIndex) =>
                    rIndex === row && cIndex === col ? newCell : cell
                )
            )
        );
    }

    useEffect(() => {
        async function fetchSolution() {
            const word = await getWord(solutionLength);
            setSolution(word);
        }

        fetchSolution();
    }, []);


    useEffect(() => {
        function handleKeyDown(event) {

            const key = event.key;
            const  {row, col} = currentCell;

            if (isGameOver || row === 6) return

            if (event.code.substring(0,3) === "Key") {
                 if (col  === solutionLength) {
                    return
                 }
                 else {
                     updateCell(row, col, {letter: key.toUpperCase(), status: "filled"});
                     setCurrentCell({row, col: col + 1})
                 }
            }
            if (key === "Enter") {
                if (col === solutionLength) {
                    let result = enteredWord(board[currentCell.row], solution, solutionLength);
                    setCurrentCell({row: row + 1, col: 0})
                    if (result[1]) {
                        setIsGameOver("win")
                    }
                    else if (row  === 5) {
                        setIsGameOver("loss")
                    }
                    for (let i = 0; i < solutionLength; i++) {
                        if (result[0][i]) {
                            let status = (result[1]) ? "solved" : result[0][i].status
                            updateCell(row, result[0][i].id, {letter: result[0][i].char, status: status});
                        }
                    }

                }
            }
            if (key === "Backspace") {
                setCurrentCell(prev => {
                    const newCol = Math.max(prev.col - 1, 0); // prevent negative
                    updateCell(prev.row, newCol, {letter: "", status: ""}); // clear the correct cell
                    return { row: prev.row, col: newCol };
                });
            }

        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [currentCell])

    return (
        <>
            <div className={styles.WordleGame}>
                <h1>Wordle</h1>
                <div className="hud">
                    <button onClick={newGame()}>Try another one</button>
                </div>
                <div className={styles.game}>
                    {isGameOver ? <div id="overlay">
                            {
                                isGameOver === "loss"
                                    ?
                                    "You lost. The word was: " + solution
                                    :
                                    "Win"
                            }
                    </div>
                        : null}
                    <div  className={`${styles.board} ${isGameOver ? styles.over : ""}`}>
                        {board.map((row, rowIndex) => (
                            <div className={styles.row} key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <div
                                        className={`${styles.cell} ${cell.status ? styles[cell.status] : ""}`}
                                        key={colIndex}
                                    >
                                        {cell.letter}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}