import { DOM, useState, useEffect, useContext } from "../react.js";
import { Example } from "./Context.js";

import TextBind from "./TextBind.js";

export default function (props) {
    console.log("render counter");

    const { count, setCount } = props;

    return DOM.div({ style: "border-style: solid; border-color: yellow;" }, [
        DOM.h1("Prop " + props?.id),
        DOM.h1("Count " + count),
        DOM.button({ onclick: () => setCount(count + 1) }, [
            DOM.span("Click Me: " + count),
        ]),
    ])
}
