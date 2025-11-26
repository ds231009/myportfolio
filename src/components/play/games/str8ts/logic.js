// var solution = null
// var solutionLength = 5
// const fieldCon = document.getElementById("fieldCon")
// var tries = [[]]
// var elementField = Array.from({ length: 6}, () => Array(solutionLength).fill(null));
// var isGameOver = false

// export function getWord() {
export async function getWord(solutionLength) {
    // var data = await getData(solutionLength);
    // if (!data) return null;
    //
    // data = data.filter(w => w.tags[0].substring(2,14) > 1);
    //
    // const randomIndex = Math.floor(Math.random() * data.length);
    // const randomWord = data[randomIndex].word.toLocaleUpperCase();

    // return randomWord;
    return "GREEN"
}

export async function getData(solutionLength) {
    const characters = "abcdefghijklmnopqrstuvwxyz"

    const randomInd = Math.floor(Math.random() * characters.length);
    let char = characters.charAt(randomInd);

    const url = `https://api.datamuse.com/words?max=99&sp=${char}${"?".repeat(solutionLength - 1)}&md=f`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();
        return result
    } catch (error) {
        console.error(error.message);
    }
}
//
// export async function printField(solution) {
//     solution = await getWord();
//     const field = document.createElement("div")
//     field.id = "field"
//     fieldCon.appendChild(field)
//
//     for (let i = 0; i < 6; i++) {
//         let row = document.createElement("div")
//         row.classList.add("row")
//         for (let j = 0; j < solutionLength; j++) {
//             let cell = document.createElement("div")
//             cell.classList.add("cell")
//             cell.classList.add("empty")
//
//             cell.dataset.row = i
//             cell.dataset.column = j
//
//             elementField[i][j] = cell
//
//             row.appendChild(cell)
//         }
//         field.appendChild(row)
//     }
//
// }
//
export function enteredWord(word, solution, solutionLength) {
    let tempSolution = [...solution]
    let result = [];
    let gameOver = false;

    console.log(word, solution, solutionLength)

    for (let i = 0; i < solutionLength; i++) {
        console.log(word[i].letter, tempSolution[i])
        if (word[i].letter === tempSolution[i]) {
            result.push({id: i, char: word[i].letter, status: "true"});
            tempSolution[i] = null
            word[i].letter = null
        };
    }

    if (result.length === solutionLength) gameOver = true;

    tempSolution = new Set(tempSolution)

    for (let i = 0; i < solutionLength; i++) {
        if (!word[i].letter) continue
        if (tempSolution.has(word[i].letter)) {
            result.push({id: i, char: word[i].letter, status: "candid"});
            tempSolution.delete(word[i].letter)
            word[i].letter = null
        }
        else {
            result.push({id: i, char: word[i].letter, status: "wrong"});
            tempSolution.delete(word[i].letter)
            word[i].letter = null
        }
    }
    return [result, gameOver];
}
//
export function gameOver() {}
// export function gameOver() {
//     isGameOver = true
//
//     const field = document.getElementById("field");
//     field.classList.add("paused");
//
//     const overlay = document.createElement("div");
//     overlay.id = "overlay";
//
//     const message = document.createElement("span");
//     message.innerText = "You finished the game!";
//     overlay.appendChild(message);
//
//     document.getElementById("fieldCon").appendChild(overlay);
// }
//
// export function fillCell(cell, content) {
//     cell.innerText = content
//     cell.classList.add("candid")
//     cell.classList.remove("empty")
//
//     tries[cell.dataset.row][cell.dataset.column] = content
// }
//
// export function deleteLetter(cell) {
//     cell.innerText = null
//     cell.classList.remove("candid")
//
//     tries[cell.dataset.row].splice([cell.dataset.column], 1)
// }
//
// export function candicCell(cell, content) {
//     cell.innerText = content
//     cell.classList.add("candid")
// }
//
// export function newGame() {
//     // TODO
// }


// export function handleKeydown(e) {
//     const key = e.key;
//
//     if (isGameOver) return
//     if (e.code.substring(0,3) === "Key") {
//         cell = elementField[tries.length - 1][tries[tries.length - 1].length]
//         if (tries[tries.length - 1].length != solutionLength) fillCell(cell, key.toLocaleUpperCase())
//     }
//     if (key === "Enter") {
//         if (tries[tries.length - 1].length === solutionLength) enteredWord(tries[tries.length - 1])
//     }
//     if (key === "Backspace") {
//         cell = elementField[tries.length - 1][tries[tries.length - 1].length - 1]
//         if (tries[tries.length - 1].length >= 0) deleteLetter(cell)
//     }
// }
//
