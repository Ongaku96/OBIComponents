import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import "./tab-item.js";

defineComponent({
    selector: "obi-tab",
    template: `<div obi-tab></div>`
});

defineComponent({
    selector: "obi-tabs-component",
    template:
        `<test-template name='OBI TABS' description='' :code='code' :data='pages'>
            <section actions slot='actions'>
                <obi-checkbox :valore='filled' label='Filled' button></obi-checkbox>
            </section>
        </test-template>`,
    options: {
        dataset: {
            pages: [
                { page: "Tab 1", icon: "star", active: true },
                { page: "Tab 2", icon: "star", active: false },
                { page: "Tab 3", icon: "star", active: false },
            ],
            filled: false,

        },
        computed: {
            code: function () {
                return `<obi-tab` + (this.filled ? " variant='filled'" : "") + `>
                            <tab-item cmd-for='item in data' :titolo="item.page" :icona="item.icon" :attivo="item.active"></tab-item>
                        </obi-tab>`
            }
        }
    }
});