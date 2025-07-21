import { DOM, useState, useEffect, useContext } from "../react.js";
import { Example } from "./Context.js";

export default function () {
    console.log("render textbind");

    const context = useContext(Example);
    console.log("textbind context", context);

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
