import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { Collection } from "../../LAMP/RenderModule/modules/enumerators.js";
import "../../LAMP/RenderModule/modules/global.js";

defineComponent({
    selector: "obi-combobox",
    template:
        `<float-container obi-combobox :disabled="disabled">
            <obi-textbox float-toggle @keydown='checkText' :variant='variant' :append='append' :prepend='prepend'
                :label='label' :valore='selected_text' :messaggio='messaggio' :placeholder='placeholder' @click='select' :disabled="disabled">
            </obi-textbox>
            <obi-list floating-item interact variant='elevated'>
                <list-item float-toggle cmd-for='item in opzioni' :value='$.item.value' @click='select' cmd-filter='$.value ? true : item.label.toLowerCase().includes($.selected_text.toLowerCase())'>{{item.label}}</list-item>
            </obi-list>
        </float-container>`,
    options: {
        dataset: {
            selected_text: "",
            first_render: true,
        },
        inputs: ["opzioni", "label", "valore", "messaggio", "prepend", "append", "placeholder", "variant", "required", "disabled"],
        actions: {
            isValid: function () {
                let _reference = this.__node.refernce[0];
                return _reference ? checkValue(_reference.getAttribute("format", this.value)) : true;
                function checkValue(check, value) {
                    if (check) {
                        switch (check) {
                            case "email":
                                return Collection.regexp.mail.test(value);
                            case "multiemail":
                                return Collection.regexp.multiplemail.test(value);
                            case "numeric":
                                return Collection.regexp.numeric.test(value);
                            case "textual":
                                return Collection.regexp.textual.test(value);
                            case "date":
                                return Collection.regexp.dateformat.test(value);
                        }
                    }
                    return true;
                }
            },
            updateValidity: function () {
                let _reference = this.__node.refernce[0];
                if (_reference) {
                    let _check = _reference.getAttribute("format");
                    if (_check) {
                        let _valid = 0;
                        if (_me.value) _valid = _me.isValid() ? 1 : -1;
                        switch (_valid) {
                            case 1:
                                render.firstChild.classList.remove("invalid");
                                render.firstChild.classList.add("valid");
                                break;
                            case -1:
                                render.firstChild.classList.remove("valid");
                                render.firstChild.classList.add("invalid");
                                break;
                            default:
                                render.firstChild.classList.remove("invalid");
                                render.firstChild.classList.remove("valid");
                                break;
                        }
                    }
                }
            },
            select: function (evt) {
                let _option = evt.currentTarget;
                if (_option && _option.hasAttribute("value")) {
                    let _value = _option.getAttribute("value");
                    if (!isNaN(parseInt(_value))) _value = parseInt(_value);
                    if (_value != null) {
                        this.selected_text = _value ? _option.innerText : "";
                        this.valore = _value ? _value : 0;
                    }
                }
            },
            checkText: function (evt) {
                let text = evt.target.value;
                let valore = this.opzioni.find(e => e.label === text.trim());
                this.valore = valore.value || 0;
            },
            syncValue: function () {
                let _select = this.valore ? this.opzioni.find(e => e.value == this.valore) : null;
                if (_select != null) this.selected_text = _select.label;
            },
        },
        computed: {
            value: function () {
                return this.valore;
            },
        },
        events: [
            {
                name: Collection.node_event.progress,
                action: function (state) {
                    switch (state) {
                        case Collection.lifecycle.mounted:
                            this.syncValue();
                            break;
                    }
                }
            }
        ]
    }
}
);