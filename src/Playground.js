import { DOM, useContext, useState, useEffect } from "../react.js";
import { Example } from "./Context.js";

import Comp from "./Comp.js";

export default function (props) {
    console.log("exec playground");

    const { count, setCount } = useContext(Example);
    const [names, setNames] = useState(['ice', 'ian', 'takeru', 'piox']);

    function addName(event) {
        if (event.key !== "Enter") return;
        setNames((names) => {
            names.push(event.target.value);
            return names;
        })
        event.target.value = "";
    }

    return DOM.div({ style: "border-style: solid; border-color: red;" }, [
        DOM.div([
            DOM.button("Add to Counter", {
                onclick: () => {
                    setCount((previous_count) => previous_count + 1);
                }
            }),
            DOM.br(),
            DOM.br(),
        ]),
        DOM.div([
            DOM.label("Add Name"),
            DOM.input({
                type: "text",
                onkeypress: addName
            })
        ]),
        DOM.br(),
        DOM.div([
            DOM.label("Change name of no.1 (" + names[0]?.toUpperCase() + ")"),
            DOM.input({
                type: "text",
                value: names[0],
                oninput: (event) => setNames((names) => {
                    names[0] = event.target.value;
                    return names;
                })
            })
        ]),
        DOM.div(
            names.length <= 0 ? [
                DOM.h1("Empty list")
            ] : names.map((name, i) => {
                return DOM.component(Comp, { name, setNames, i })
            })
        ),
        DOM.br(),
    ])
}
