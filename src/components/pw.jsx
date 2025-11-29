import React from "react";

export default function PasswordCheck() {
    const userInput = window.prompt("Enter the password:");

    if (userInput === "mySecret123") {
        alert("Access granted!");
    } else {
        alert("Incorrect password.");
    }

    return (
        <button>
            Check Password
        </button>
    );
}
