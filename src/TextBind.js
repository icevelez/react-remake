import { DOM } from "../react.js";


export default function (props) {
    console.log("render textbind");

    const context = props;

    return DOM.div({ style: "border-style: solid; border-color: purple;" }, [
        DOM.h1("Hello " + context.message),
        DOM.div([
            DOM.label("Type message:"),
            DOM.input({ type: "text", value: context.message, oninput: (e) => context.setMessage(e.target.value) }),
        ]),
    ])
}
