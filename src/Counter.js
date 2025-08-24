import { DOM, useContext } from "../react.js";
import { Example } from "./Context.js";

export default function (props) {
    console.log("exec counter");

    const { count, setCount } = useContext(Example);

    return DOM.div({ style: "border-style: solid; border-color: yellow;" }, [
        DOM.h1("Prop " + props?.id),
        DOM.h1("Count " + count),
        DOM.button({
            onclick: () => setCount((c) => c + 1)
        }, [
            DOM.span("Click Me to change counter"),
        ]),
    ])
}
