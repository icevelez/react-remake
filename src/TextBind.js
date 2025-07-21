import { DOM, useState, useEffect, useContext } from "../react.js";
import { Example } from "./Context.js";

export default function () {
    console.log("render textbind");

    const context = useContext(Example);

    return DOM.div([
        DOM.h1("Hello " + context.message),
        DOM.div([
            DOM.label("Type message:"),
            DOM.input({ type: "text", value: context.message, oninput: (e) => context.setMessage(e.target.value) }),
        ]),
    ])
}
