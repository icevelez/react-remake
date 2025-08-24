import { createContext, DOM, useContext, useMemo, useState } from "../react.js";
import { Example } from "./Context.js";

import Counter from "./Counter.js";
import Playground from "./Playground.js";
import TextBind from "./TextBind.js";

export default function () {
    console.log("exec app");

    const [count, setCount] = useState(0);
    const [message, setMessage] = useState("Message From App");

    return Example.Provider(
        { count, setCount, message, setMessage },
        () => DOM.div({ style: "border-style: solid; border-color: black;" }, [
            DOM.div([
                DOM.h1(`${message}`),
                DOM.h1(`${count}`),
                DOM.button("Click Me", {
                    onclick: () => {
                        setCount((count) => count + 1);
                    }
                }),
            ]),
            useMemo(DOM.component(Playground), []),
            useMemo(DOM.component(Counter, { id: "x app" }), [count]),
            useMemo(DOM.component(TextBind), [message]),
        ]),
    );
}
