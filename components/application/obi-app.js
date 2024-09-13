import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";

defineComponent({
    selector: "obi-app",
    template: `<div obi-app>
        <app-header :titolo='titolo' :clean='$.clean != null' :fixed='$.fixed != null' :link='home'>
            <slot name='tool'></slot>
        </app-header>
        <slot name="navigation"></slot>
        <slot name="content"></slot>
        <slot name="footer"></slot>
    </div>`,
    options: {
        inputs: ["titolo", "clean", "fixed", "home"]
    }
});

defineComponent({
    selector: "obi-app-component",
    template: `<test-template name='OBI APP' description='' :code='template' just-code>
    <section actions slot='actions'>
        <obi-checkbox :valore='collapsed' label='Collapsed' button></obi-checkbox>
    </section>
</test-template>`,
    options: {
        dataset: {
            template:
                `<obi-app id='myApp' titolo='Titolo Progetto'> /** aggiungere gli attributi clean='' e fixed='' per personalizzare l'header*/
    <div app-tool slot='tool'></div> /**Aggiunge item al'header -> vedere il componente app-header in interfaccia*/
    <obi-nav slot='navigation'></obi-nav> /**Aggiunge la navigazione -> vedere il componente obi-nav in navigazione*/
    <app-content></app-content> /**Contenitore del corpo dell'applicazione */
</obi-app>
                `,
        }
    }
})