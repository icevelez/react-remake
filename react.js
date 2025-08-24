const dev = false; // enable or disable console.log
const IS_VIRTUAL_ELEMENT = Symbol("is_virtual_element");
const IS_ASYNC = Symbol("is_async");

/** @type {Map<string, any>} */
const RealDOMCache = new Map();

/** @type {Map<string, any>} */
const DOMCache = new Map();

/** @type {Record<string, HTMLElement>} */
const RealDOM = new Proxy({}, {
    get(_, tag) {
        if (typeof tag !== 'string') throw new Error("tag is not a string");

        let cache = RealDOMCache.get(tag);

        if (!cache) {
            cache = function (vnode) {
                if (!vnode[IS_VIRTUAL_ELEMENT]) {
                    throw new Error("vnode is not a \"IS_VIRTUAL_ELEMENT\"");
                }

                if (tag === "comment") {
                    const element = document.createComment(vnode.comment || "");
                    vnode.DOM = element;
                    return element;
                }

                const element = document.createElement(tag);

                if (vnode.textContent) {
                    element.textContent = vnode.textContent;
                }

                if (vnode.attributes) {
                    for (const key in vnode.attributes) {
                        if (key.startsWith("on") && typeof vnode.attributes[key] === 'function') {
                            element[key] = vnode.attributes[key];
                        } else {
                            element.setAttribute(key, vnode.attributes[key]);
                        }
                    }
                }

                if (Array.isArray(vnode.children)) {
                    for (let i = 0; i < vnode.children.length; i++) {
                        let child = vnode.children[i];

                        if (!child) {
                            child = vnode.children[i] = DOM.comment("empty");
                            element.append(render(child, element));
                            continue;
                        }

                        element.append(render(child, element));
                    }
                }

                vnode.DOM = element;
                return element;
            }

            RealDOMCache.set(tag, cache);
        }

        return cache;
    }
});

/** @typedef {{ tag:string, textContent: string | null, attributes: Record<string, any>, children: vNode[], [IS_VIRTUAL_ELEMENT]: boolean, }} vNode */

/** @typedef {(text:string | Record<string, any> | any[], attribute:Record<string, any> | any[], children:any[]) => vNode} vElement */
/** @typedef {{ (import_url:string, fallback:(props:Record<string, any>) => vNode, props:Record<string, any>) => vNode, async : () => Promise<() => vNode>, [IS_ASYNC] : boolean }} vLazy */
/** @typedef {(component:Function, props:Record<string, any>) => vNode} vComponent */

/** @type {{ [x:string] : vElement, lazy : vLazy, component : vComponent }} */
export const DOM = new Proxy({}, {
    get(_, tag) {
        if (typeof tag !== 'string') throw new Error("tag is not a string");

        let cache = DOMCache.get(tag);

        if (!cache) {
            cache = tag === "comment" ? function (comment = "") {
                return {
                    tag,
                    comment,
                    attributes: {},
                    [IS_VIRTUAL_ELEMENT]: true,
                }
            } : tag === "lazy" ? function (import_url, fallback, props) {
                const node = () => fallback(props);
                node.async = async () => {
                    const component = await import(import_url);
                    if (!component.default || typeof component.default !== "function") throw new Error("component is not a function");
                    return () => component.default(props);
                };
                node[IS_ASYNC] = true;
                return node;
            } : tag === "component" ? function (component, props = {}) {
                return () => component(props);
            } : function (...args) {
                let text, attributes, children;

                if (typeof args[0] === "string") text = args[0];
                if (typeof args[0] === "object" && !Array.isArray(args[0])) attributes = args[0];
                if (typeof args[1] === "object" && !Array.isArray(args[1])) attributes = args[1];

                if (Array.isArray(args[0])) children = args[0];
                if (Array.isArray(args[1])) children = args[1];
                if (Array.isArray(args[2])) children = args[2];

                return {
                    tag,
                    textContent: text || null,
                    attributes: attributes || {},
                    children: children || [],
                    [IS_VIRTUAL_ELEMENT]: true,
                };
            };

            DOMCache.set(tag, cache);
        }

        return cache;
    }
});

let currentInstance = null;
let useStateCounter = 0;
let useEffectQueue = [];

export function createContext() {
    const context = {
        id: Symbol("context"),
        /**
         * @param {any} value
         * @param {() => vNode} vnode_fn
         */
        Provider: function (value, child) {
            if (typeof child === "object" && child[IS_VIRTUAL_ELEMENT]) throw new Error("child should be a callback that returns a vnode, not a vnode directly");
            if (typeof child !== "function") throw new Error("child is not a function");

            return {
                id: this,
                tag: "provider",
                context: new Map(),
                value,
                child,
                [IS_VIRTUAL_ELEMENT]: true,
            };
        }
    };
    return context;
}

/**
 * @param {Symbol} key
 */
export function useContext(context) {
    if (!currentInstance) throw new Error("useContext must be used in a component");
    return currentInstance.contexts.get(context) ?? context.defaultValue;
}

export function useEffect(effectFn, deps) {
    const instance = currentInstance;
    const index = useStateCounter++;

    const oldDeps = instance.effectDeps?.[index];
    const hasChanged = !oldDeps || deps.some((d, i) => d !== oldDeps[i]);

    if (hasChanged) {
        useEffectQueue.push(() => {
            if (typeof instance.cleanupFns?.[index] === 'function') {
                instance.cleanupFns[index]();
            }
            const cleanup = effectFn();
            if (!instance.cleanupFns) instance.cleanupFns = [];
            instance.cleanupFns[index] = cleanup;
        });
    }

    if (!instance.effectDeps) instance.effectDeps = [];
    instance.effectDeps[index] = deps;
}

function runEffects() {
    for (const effect of useEffectQueue) {
        effect();
    }
    useEffectQueue = [];
}

/**
 * @template {any} T
 * @param {T} initial_value
 * @returns {[T, (new_value:T | (current_value:T) => T) => void]}
 */
export function useState(initial_value) {
    if (!currentInstance) throw new Error("cannot instantiate \"useState\" outside of a component");

    const instance = currentInstance;
    const index = useStateCounter;
    if (instance.stateStack[index] === null || instance.stateStack[index] === undefined) {
        instance.stateStack[index] = initial_value;
    }

    const setValue = (new_value) => {
        if (typeof new_value === "function") {
            instance.stateStack[index] = new_value(instance.stateStack[index]);
        } else {
            instance.stateStack[index] = new_value;
        }

        useStateCounter = 0;
        currentInstance = instance;
        const newVNode = instance.component();
        diff(instance.parentDom, instance.vnode, newVNode);
        instance.vnode = newVNode;

        runEffects();
    };

    const value = instance.stateStack[index];
    useStateCounter++;
    return [value, setValue];
}

export function useMemo(factory, deps) {
    if (!currentInstance) throw new Error("cannot use useMemo outside of a component");

    const instance = currentInstance;
    const index = useStateCounter++;

    if (!instance.memoValues) instance.memoValues = [];
    if (!instance.memoDeps) instance.memoDeps = [];

    const oldDeps = instance.memoDeps[index];
    const hasChanged = !oldDeps || deps.some((d, i) => d !== oldDeps[i]);

    if (hasChanged) {
        instance.memoValues[index] = factory();
        instance.memoDeps[index] = deps;
    }

    return instance.memoValues[index];
}

function createComponentInstance(component, parentDom) {
    return {
        component,
        memoValues: [],
        memoDeps: [],
        effectDeps: [],
        cleanupFns: [],
        parentDom,
        vnode: null,
        dom: null,
        stateStack: [],
        contexts: new Map(),
    };
}

export function mount(component, options) {
    const dom_tree = render(component, options.target);
    options.target.appendChild(dom_tree);
}

function render(vnode, target = null) {
    if (vnode.tag === 'provider') {
        currentInstance.contexts.set(vnode.id, vnode.value);
        return render(vnode.child, target);
    }

    if (typeof vnode === "function") {
        useStateCounter = 0;
        const instance = createComponentInstance(vnode, target);
        instance.contexts = currentInstance ? new Map(currentInstance.contexts) : new Map();
        currentInstance = instance;
        const result = vnode();
        instance.vnode = result;
        const dom = render(result, target);
        instance.dom = dom;
        runEffects();
        vnode._instance = instance;

        if (vnode[IS_ASYNC]) {
            const result = vnode.async();
            const placeholder = dom;
            instance.dom = placeholder;
            result.then(resolvedVNode => {
                currentInstance = instance;
                instance.vnode = resolvedVNode;
                const dom = render(resolvedVNode, target);
                runEffects();
                vnode._instance = instance;
                target.replaceChild(dom, placeholder);
                instance.dom = dom;
            });
            return placeholder;
        }

        if (dev) console.log("[react-remake.js]: render");
        return dom;
    }

    return RealDOM[vnode.tag](vnode);
}

function diff(parent, oldVNode, newVNode) {
    if (oldVNode === newVNode) {
        if (dev) console.log("[react-remake.js]: skipping the same vnode");
        return;
    }

    if (!oldVNode && !newVNode) {
        return;
    }

    if ((newVNode && newVNode.tag === "provider") || (oldVNode && oldVNode.tag === "provider")) {
        currentInstance.contexts.set(newVNode.id, newVNode.value);
        diff(parent, oldVNode.child, newVNode.child);
        return;
    }

    if (typeof newVNode === "function" && oldVNode) {
        useStateCounter = 0;
        const instance = oldVNode?._instance || createComponentInstance(newVNode, parent);
        instance.contexts = currentInstance ? new Map(currentInstance.contexts) : new Map();
        currentInstance = instance;

        if (newVNode[IS_ASYNC]) {
            const result = newVNode.async();
            result.then(resolvedVNode => {
                diff(parent, instance.vnode || oldVNode, resolvedVNode);
                runEffects();
                newVNode._instance = instance;
            });
            return;
        }

        const result = newVNode();
        diff(parent, instance?.vnode || oldVNode, result);
        runEffects();
        instance.vnode = result;
        newVNode._instance = instance;
        newVNode._instance.dom = result.DOM;
        return;
    }

    if (!oldVNode) {
        const newEl = render(newVNode, parent);
        newVNode.DOM = newEl;
        if (dev) console.log("[react-remake.js]: append element");
        parent.append(newEl);
        return;
    }

    if (!newVNode) {
        if (dev) console.log("[react-remake.js]: remove element");
        parent.removeChild(oldVNode.DOM || oldVNode._instance.dom);
        return;
    }

    if (oldVNode.tag !== newVNode.tag) {
        const newEl = render(newVNode, parent);
        newVNode.DOM = newEl;
        if (dev) console.log("[react-remake.js]: replace element");
        parent.replaceChild(newEl, oldVNode.DOM || oldVNode._instance.dom);
        return;
    }

    const el = oldVNode.DOM || oldVNode._instance.dom;
    newVNode.DOM = el;

    // Update text content
    if (oldVNode.textContent !== newVNode.textContent) {
        if (dev) console.log("[react-remake.js]: update text");
        el.textContent = newVNode.textContent || "";
    }

    // Update attributes
    const oldAttrs = new Set(Object.keys(oldVNode.attributes));
    const newAttrs = new Set(Object.keys(newVNode.attributes));

    for (const key in oldAttrs.difference(newAttrs)) {
        el.removeAttribute(key);
    }

    for (const key of newAttrs) {
        if (dev) console.log("[react-remake.js]: set attribute:", key);
        if (key === "value" || (key.startsWith("on") && typeof newVNode.attributes[key] === 'function')) {
            el[key] = newVNode.attributes[key];
        } else {
            el.setAttribute(key, newVNode.attributes[key]);
        }
    }

    // Diff children
    const oldChildren = oldVNode.children || [];
    const newChildren = newVNode.children || [];
    const max = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < max; i++) {
        if (!newChildren[i]) newChildren[i] = DOM.comment("empty");
        diff(el, oldChildren[i], newChildren[i]);
    }
}
