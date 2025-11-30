import { useEffect } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function useAnonymousAnalytics() {
    useEffect(() => {
        const logVisit = async () => {
            // 1. Check if we already logged this user in this session
            const sessionKey = 'site_visit_session_id';
            let sessionId = sessionStorage.getItem(sessionKey);

            if (sessionId) {
                // We already logged them this time they opened the browser.
                // You can comment this return out if you want to log EVERY page view.
                return;
            }

            // Generate a new random ID for this session
            sessionId = Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem(sessionKey, sessionId);

            const db = getFirestore();

            // 2. Gather Basic Data
            const visitData = {
                sessionId: sessionId, // Helps group actions by one visitor
                timestamp: serverTimestamp(),
                page: window.location.pathname,
                referrer: document.referrer || "Direct", // Where they came from (Google, Twitter, etc)
                language: navigator.language || "Unknown",
                screenSize: `${window.screen.width}x${window.screen.height}`,
                windowSize: `${window.innerWidth}x${window.innerHeight}`,
                userAgent: navigator.userAgent, // Browser & OS info
                platform: navigator.platform || "Unknown"
            };

            try {
                // 3. Save to Firestore (Public Collection)
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'site_traffic');

                await addDoc(logsRef, visitData);
                console.log("Anonymous visit logged:", visitData);
            } catch (error) {
                console.error("Analytics Error:", error);
            }
        };

        logVisit();
    }, []);
}