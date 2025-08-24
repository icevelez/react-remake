import { DOM, useContext } from "../react.js";
import { Example } from "./Context.js";

export default function (props) {
    console.log("exec textbind");

    const { message, setMessage } = useContext(Example);

    return DOM.div({ style: "border-style: solid; border-color: purple;" }, [
        DOM.h1("Hello " + message),
        DOM.div([
            DOM.label("Type message:"),
            DOM.input({ type: "text", value: message, oninput: (e) => setMessage(e.target.value) }),
        ]),
    ])
}
