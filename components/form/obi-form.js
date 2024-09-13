import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import Service from "../../LAMP/ServerModule/LampService.js";
import { obiAlert } from "../../core.js";
import { convertModelToFormData as converter } from "../../src/FormData.js";
import log from "../../LAMP/RenderModule/modules/console.js";

defineComponent({
    selector: "obi-form",
    template: `
    <form obi-form @submit='submitForm'>
        <obi-card>
            <card-body>
                <slot name='inputForm'/>
            </card-body>
            <card-action>
                <obi-button relevance='primary' label='Salva' prepend='save' type='submit'></obi-button>
                <!--<obi-button relevance='neutral' label='Annulla' prepend='cancel' @click='closeForm'></obi-button>-->
            </card-action>
        </obi-card>
    </form>`,
    options: {
        inputs: ["submit", "modello", "messaggio", "request"],
        dataset: {
            request: "POST"
        },
        actions: {
            submitForm: function (evt) {
                evt.preventDefault();
                if (evt.submitter.getAttribute("type") == "submit") {
                    this.__node.trigger("submit");
                    if (this.submit) {
                        // let _binding_model = converter(this.modello);
                        let _binding_model = JSON.stringify(this.modello);
                        console.log("OBI-FORM -> Binding Model: ", _binding_model)
                        Service.instance.upload(this.submit, _binding_model, this.request).then(async (res) => {
                            if (res.ok) {
                                this.__node.trigger("submitsuccess", await res.json());
                                if (this.messaggio) obiAlert(this.messaggio, { type: 'success' });
                            } else {
                                this.__node.trigger("submiterror", await res.text());
                            }
                        }).catch((error) => {
                            log(error, "error");
                            this.__node.trigger("submiterror", error.message);
                        });
                    } else {
                        obiAlert("Impossibile connettersi al server", { type: "warning" });
                    }
                }
            },
            closeForm: function (evt) {
                this.__node.trigger("close", evt);
            },
            getformData: function () {
            }
        },
    }
});

defineComponent({
    selector: "obi-form-component",
    template:
        `<test-template name='OBI FORM' :code='code' :data='model'></test-template>`,
    options: {
        dataset: {
            model: {
                nome: "",
                cognome: "",
                genere: 0,
                opzioni: [
                    { label: "Seleziona un genere", value: 0 },
                    { label: "Maschio", value: 1 },
                    { label: "Femmina", value: 2 },
                    { label: "Altro", value: 3 },
                ]
            }
        },
        computed: {
            code: function () {
                return `<obi-form :modello="data" @error="errorEvent" @success="successEvent" @close='closeEvent'>
    <div slot="inputForm">
        <group-component>
            <obi-textbox label="Nome" :valore="data.nome" required='required'></obi-textbox>
            <obi-textbox label="Cognome" :valore="data.cognome"></obi-textbox>
        </group-component>
        <obi-select label="Genere" :opzioni="data.opzioni" :valore="data.genere"></obi-select>
    </div>
</obi-form>`
            }
        }
    }
});