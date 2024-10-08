import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";

defineComponent({
    selector: "obi-checkgroup",
    template:
        `<group-component>
            <obi-button cmd-for='op in opzioni' @click='updateValue' :prepend='$.valore == $.op.value ? "check" : null' :label='op.label' :value='op.value' :relevance='$.valore == $.op.value ? "primary" : null' :disabled="disabled" :variant='variant'></obi-button>
        </group-component>`,
    options: {
        inputs: ["opzioni", "valore", "disabled", "variant", "required", "disabled"],
        actions: {
            isValid: function () {
                if (this.required) return this.valore != null && this.valore != "" && this.valore != 0;
                return true;
            },
            updateValidity: function () {
            },
            updateValue: function (evt) {
                let _val = evt.currentTarget.getAttribute("value");
                if (isNaN(parseFloat(_val))) this.valore = _val; else this.valore = parseFloat(_val);
            }
        },
        computed: {
            value() {
                return this.valore;
            },
        },
    }
});

defineComponent({
    selector: "obi-checkgroup-component",
    template:
        `<test-template name='OBI CHECKGROUP' description='' :code='code' :data='inputData'>
            <section actions slot='actions'>
                <obi-select :valore='variante' label='Variante' :opzioni='varianti'></obi-select>
                <obi-checkbox label='Disabilita' :valore='disabled' button></obi-checkbox>
            </section>
        </test-template>`,
    options: {
        dataset: {
            inputData: {
                valore: 1,
                opzioni: [
                    { label: "Elemento 1", value: 1 },
                    { label: "Elemento 2", value: 2 },
                    { label: "Elemento 3", value: 3 },
                    { label: "Elemento 4", value: 4 },
                ]
            },
            disabled: false,
            variante: "",
            varianti: [
                { label: "nessuna", value: "" },
                { label: "filled", value: "filled" },
                { label: "outlined", value: "outlined" },
                { label: "elevated", value: "elevated" },
            ]
        },
        computed: {
            code: function () {
                let _disabled = this.disabled ? " disabled" : "";
                let _variante = this.variante ? `variant='${this.variante}'` : "";
                return "<obi-checkgroup :opzioni='data.opzioni' :valore='data.valore' " + _variante + _disabled + "></obi-checkgroup>"
            }
        },
    }
});