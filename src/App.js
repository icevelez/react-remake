import { DOM, useState } from "../react.js";

import Counter from "./Counter.js";
import Playground from "./Playground.js";
import TextBind from "./TextBind.js";

export default function () {
    console.log("render app");

    const [count, setCount] = useState(0);
    const [message, setMessage] = useState("Message From App");
    const [showPlayground, setShowPlayground] = useState(false);

    return DOM.div({ style: "border-style: solid; border-color: black;" }, [
        DOM.div([
            DOM.h1(`${message}`),
            DOM.h1(`${count}`),
            DOM.button("Click Me", {
                onclick: () => {
                    setCount(count + 1);
                }
            }),
            DOM.button("Show Playground", {
                onclick: () => {
                    setShowPlayground(!showPlayground);
                }
            })
        ]),
        showPlayground ? DOM.component(Playground, { count, setCount }) : null,
        DOM.component(Counter, { id: "x app", count, setCount }),
        DOM.component(TextBind, { message, setMessage, }),
    ]);
}
