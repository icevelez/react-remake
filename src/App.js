import { DOM, useState } from "../react.js";

import Counter from "./Counter.js";
import TextBind from "./TextBind.js";

export default function () {
    console.log("render app");

    const [showPlayground, setShowPlayground] = useState(false);

    return DOM.div([
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
    ]);
}
