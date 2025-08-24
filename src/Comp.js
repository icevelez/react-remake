import { DOM } from "../react.js";

export default function (props) {
    console.log("exec comp");

    return DOM.div([
        DOM.h1(`${props.i + 1}. ${props.name.toUpperCase()}`),
        DOM.button("Delete", {
            onclick: () => props.setNames((names) => {
                names.splice(props.i, 1);
                return names;
            })
        }),
        DOM.span(" "),
        DOM.input({
            type: "text",
            value: props.name,
            oninput: (event) => props.setNames((names) => {
                names[props.i] = event.target.value;
                return names;
            })
        })
    ])
}
