import { DOM, useState, useEffect } from "../react.js";

import TextBind from "./TextBind.js";

export default function (props) {
    console.log("render counter");

    const [count, setCount] = useState(0);

    return DOM.div([
        DOM.h1("Prop " + props?.id),
        DOM.h1("Count " + count),
        DOM.button({ onclick: () => setCount(count + 1) }, [
            DOM.span("Click Me: " + count),
        ]),
    ])
}
