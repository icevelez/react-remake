import { DOM, useState } from "../react.js";

export default function () {
    console.log("render playground");

    const [count, setCount] = useState(0);
    const [names, setNames] = useState(['ice', 'ian', 'takeru', 'piox']);

    function addName(event) {
        if (event.key !== "Enter") return;
        setNames((names) => {
            names.push(event.target.value);
            return names;
        })
        event.target.value = "";
    }

    return DOM.div([
        DOM.div([
            DOM.p("Counter: " + count),
            DOM.button("Click Me", {
                onclick: () => setCount(count + 1)
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
            DOM.label("Change name of no.1 (" + names[0].toUpperCase() + ")"),
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
                return DOM.div([
                    DOM.h1(`${i + 1}. ${name.toUpperCase()}`),
                    DOM.button("Delete", {
                        onclick: () => setNames((names) => {
                            names.splice(i, 1);
                            return names;
                        })
                    }),
                    DOM.input({
                        type: "text",
                        value: names[i],
                        oninput: (event) => setNames((names) => {
                            names[i] = event.target.value;
                            return names;
                        })
                    })
                ])
            })
        ),
        DOM.br(),
    ])
}
