import styles from "./Footer.module.css"

import { useEffect, useRef, useState } from "react";

export default function FooterCanvas() {
    const canvasRef = useRef(null);
    const mouseX = useRef(0);
    const [canvasPos, setCanvasPos] = useState({ left:0, x: 0, y: 0, width: 0, height: 0 });

    const changeCanvasPos = (rect) => {
        setCanvasPos({
            left: rect.left,
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
        });
    };

    useEffect(() => {
        const handleClick = (e) => {
            console.log("Mouse X:", e.clientX, "Mouse Y:", e.clientY);
        };

        window.addEventListener("click", handleClick);

        // Cleanup
        return () => {
            window.removeEventListener("click", handleClick);
        };
    }, []); // empty deps → run once on mount

    // Track mouse X
    useEffect(() => {
        const handleMove = (e) => {
            mouseX.current = e.clientX;
            // console.log(mouseX.current)
        };

        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    // Canvas animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        changeCanvasPos(canvas.getBoundingClientRect());

        let frame;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            // rectangle centered around mouse X
            const rectW = 60;
            const rectH = 20;

            const x = mouseX.current - canvasPos.left - rectW / 2;
            const y = height / 2 - rectH / 2;

            ctx.fillStyle = "#4aacff";
            ctx.fillRect(x, y, rectW, rectH);

            frame = requestAnimationFrame(render);
        };

        frame = requestAnimationFrame(render);

        return () => cancelAnimationFrame(frame);
    }, []);

    // Resize canvas to match device pixel ratio (for crispness)
    useEffect(() => {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            canvas.getContext("2d").scale(dpr, dpr);
        };

        resize();
        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <footer
            style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "20px",
                background: "#111",
            }}
        >
            <span style={{ color: "white", fontSize: "1rem" }}>footer text</span>
            {canvasPos.left} {canvasPos.right}
            <canvas
                ref={canvasRef}
                className={styles.footerCanvas}
            />
        </footer>
    );
}
