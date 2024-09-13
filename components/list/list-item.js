import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";

defineComponent({
    selector: "list-item",
    template:
        `<div list-item :title='testo'>
            <div prepend cmd-if='$.prepend'>{{prepend}}</div>
            <obi-title cmd-if='$.testo != null || $.descrizione != null' :titolo='testo' :descrizione='descrizione'></obi-title>
            <div append cmd-if='$.append'>{{append}}</div>
            <div append cmd-if='$.isCheckable' cmd-model='append'><obi-checkbox :valore='valore' :radio='isRadio'></obi-checkbox></div>
        </div>`,
    options: {
        inputs: ["testo", "descrizione", "prepend", "append", "valore"],
        computed: {
            isCheckable: function () { return this.__element.hasAttribute("check"); },
            isRadio: function () { return this.__element.getAttribute("check") == "radio" }
        }
    }
});