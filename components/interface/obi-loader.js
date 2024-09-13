import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { Collection } from "../../LAMP/RenderModule/modules/enumerators.js";
import { vNode } from "../../LAMP/RenderModule/modules/virtualizer.js";

let loaderTemplate = {
    default: `<span square></span>`,
    button: `<span cell></span>`,
    table: `<span row></span><span rectangle></span>`,
    input: `<span row></span>`,
    list: `<span cell></span><span row='3'></span><span cell></span><span row='3'></span><span cell></span><span row='3'></span>`,
}

defineComponent({
    selector: "obi-loader",
    template: '<div skeleton-loader></div>',
    options: {
        action: {
            remove() {
                this.__node.dismiss();
            }
        },
        events: [
            {
                name: Collection.node_event.render,
                action: function () {
                    let template = loaderTemplate[this.__element.getAttribute("type") || "default"];
                    this.__element.insertAdjacentHTML("afterbegin", template);
                }
            }
        ]
    }
});

/**
 * Attach the skeleton loader to the component until the async operation isn't completed
 *
 * @export
 * @param {*} action
 * @param {...{}} vnodes
 */
export default function loader(action, ...vnodes) {
    const process = {
        stillRunning: true,
    }
    for (const item of vnodes) {
        if (item != null) {
            if (isSkeleton(item)) {
                item.vnode.reference[0].setAttribute("disabled", "disabled");
                item.vnode.reference[0].insertAdjacentHTML("afterbegin", `<div skeleton-loader>${loaderTemplate[item.skeleton || "default"]}</div>`);
            } else {
                let node = !(item instanceof vNode) && "virtual" in item ? item.virtual : item;
                loadingAnimation(node.reference[0], process);
            }
        }
    }
    return action().then((result) => {
        process.stillRunning = false;
        for (const item of vnodes) {
            if (item != null) {
                if (isSkeleton(item)) {
                    item.vnode.reference[0].querySelector("[skeleton-loader]")?.remove();
                    item.vnode.reference[0].removeAttribute("disabled");
                } else {
                    let node = !(item instanceof vNode) && "virtual" in item ? item.virtual : item;
                    node.reference[0].setAttribute("loading", "100");
                    sleep(100).then(() => {
                        node.reference[0].removeAttribute("loading");
                    });
                }
            }
        }
        return result;
    });
    async function loadingAnimation(node, process) {
        let i = 0;

        while (i < 90 && process.stillRunning) {
            await sleep(10).then(() => { node.setAttribute("loading", i++); });
        }
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function isSkeleton(object) {
        return typeof object == "object" && "vnode" in object && "skeleton" in object;
    }
}