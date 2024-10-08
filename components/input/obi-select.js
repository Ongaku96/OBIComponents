import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import "../../LAMP/RenderModule/modules/global.js";

defineComponent({
    selector: "obi-select",
    template:
        `<float-container obi-select :valid='$.valore != null && $.valore != 0 && $.valore != ""' :disabled="disabled">
	        <div text-input :disabled="disabled">
		        <div cmd-if='prepend' prepend>{{prepend}}</div>
                <label input float-toggle :disabled="disabled">{{selected}}</label>
		        <label title for='input' cmd-if='$.label'>{{label}}</label>
		        <div cmd-if='append' append>{{append}}</div>
		        <div text-indicator></div>
	        </div>
	        <div text-support>
		        <span message cmd-if='!$.validated && $.messaggio' class='txt-body2'>{{messaggio}}</span>
		        <span message cmd-if='$.validated && !$.valid' class='txt-body2' >{{!$.valid}}</span>
		        <span message cmd-if='$.validated && $.valid' class='txt-body2'>{{valid}}</span>
	        </div>
            <obi-list floating-item interact variant='elevated'>
                <list-item float-toggle cmd-for='item in opzioni' :value='$.item.value' @click='select'>{{item.label}}</list-item>
            </obi-list>
        </float-container>`,
    options: {
        dataset: {
            valid: "",
            invalid: "This value is invalid. Please check your input.",
            validated: false,
        },
        inputs: ["opzioni", "label", "valore", "messaggio", "prepend", "append", "placeholder", "required", "disabled"],
        computed: {
            selected: function () {
                if (!isNaN(parseFloat(this.valore))) this.valore = parseFloat(this.valore);
                let _selected = this.valore ? this.opzioni.find(e => e.value == this.valore) : null;
                return _selected ? _selected.label : "";
            },
            valid: function () {
                return this.required == null || this.required != null && this.valore;
            },
            value() {
                return this.valore;
            },
        },
        actions: {
            select: function (evt) {
                let _value = evt.currentTarget.getAttribute("value");
                let nan = isNaN(parseInt(_value));
                if (!nan) _value = parseInt(_value);
                let temp = _value ? _value : (nan ? "" : 0);
                if (temp != this.valore) {
                    this.valore = temp;
                    this.__node.trigger("changed", temp);
                }
            },
            checkText: function (evt) {
                let valore = this.opzioni.find(e => e.text === this.selected_text)
                if (valore == null) this.valore = 0; else this.valore = valore.value;
            }
        }
    }
}
);

defineComponent({
    selector: "obi-select-component",
    template:
        `<test-template name='OBI SELECT' description='' :code='code' :data='opzioni'>
            <section actions slot='actions'>
                <obi-checkbox label='Combobox' :valore='combobox' button></obi-checkbox>
                <obi-checkbox label='Disabilita' :valore='disabled' button></obi-checkbox>
                <obi-checkbox label='Prepend' :valore='prepend' button></obi-checkbox>
                <obi-checkbox label='Append' :valore='append' button></obi-checkbox>
            </section>
        </test-template>`,
    options: {
        dataset: {
            opzioni: [
                { label: "elemento 1", value: 1 },
                { label: "elemento 2", value: 2 },
                { label: "elemento 3", value: 3 },
            ],
            variante: "",
            varianti: [
                { label: "standard", value: "" },
                { label: "filled", value: "filled" },
                { label: "outlined", value: "outlined" }
            ],
            disabled: false,
            prepend: false,
            append: false,
            combobox: false,
        },
        computed: {
            code: function () {

                let _variant = this.variante ? " variant='" + this.variante + "'" : "";
                let _disabled = this.disabled ? " disabled" : "";
                let _label = !this.placeholder ? " label='label'" : "";
                let _prepend = this.prepend ? " prepend='+39'" : "";
                let _append = this.append ? " append='€'" : "";

                let code = this.combobox ? "<obi-combobox valore='' " + _label + _variant + _disabled + _prepend + _append + " :opzioni='data'></obi-combobox>" :
                    "<obi-select " + _label + _variant + _disabled + _prepend + _append + " :opzioni='data'></obi-select>";

                return code
            }
        },
    }
});