import { DOM, useState } from "../react.js";

import { Example } from "./Context.js";

import Counter from "./Counter.js";
import TextBind from "./TextBind.js";

export default function () {
    console.log("render app");

    const [message, setMessage] = useState("Message From App");
    const [showPlayground, setShowPlayground] = useState(false);

    const contextValue = {
        message,
        setMessage,
    };

    return Example.Provider(contextValue, DOM.div([
        DOM.div([
            DOM.h1(message)
        ]),
        DOM.component(Counter, { id: "example" }),
        DOM.br(),
        DOM.div([
            DOM.button("Click Me Show Playground", { onclick: () => setShowPlayground(!showPlayground) })
        ]),
        DOM.component(TextBind),
        DOM.br(),
        DOM.br(),
        showPlayground ? DOM.lazy("/src/Playground.js", () => DOM.div([
            DOM.h1("Loading Playground")
        ])) : null,
    ]));
}
