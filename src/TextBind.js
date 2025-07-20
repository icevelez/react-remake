import { DOM, useState, useEffect } from "../react.js";

export default function () {
    console.log("render textbind");

    const [message, setMessage] = useState("World!");

    useEffect(() => {
        console.log("message changed:", message);
        return () => console.log("counter cleanup");
    }, [message]);

    return DOM.div([
        DOM.h1("Hello " + message),
        DOM.div([
            DOM.label("Type message:"),
            DOM.input({ type: "text", value: message, oninput: (e) => setMessage(e.target.value) }),
        ]),
    ])
}
