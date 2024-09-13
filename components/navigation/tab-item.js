import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { clickRippleEvent } from "../../src/support.js";

defineComponent({
    selector: "tab-item",
    template:
        `<a tab-item :attivo='$.attivo != ""' :title='titolo' :href='link'>
            <div container>
                <obi-icon :nome='icona' :logo='logo'></obi-icon>
                <span cmd-model='titolo' class='txt-body2'>{{titolo}}</span>
                <obi-badge cmd-if='!(!$.badge || $.badge === 0)' :testo='badge'></obi-badge>
            </div>
        </a>`,
    options: {
        inputs: ["link", "icona", "logo", "titolo", "badge", "attivo"],
        events: [clickRippleEvent]
    }
});