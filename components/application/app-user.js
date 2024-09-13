import UserHandler from "../../LAMP/UserModule/LampAccess.js";
import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { clickRippleEvent } from "../../src/support.js";
import { Collection } from "../../LAMP/RenderModule/modules/enumerators.js";
import { obiAlert } from "../../core.js";
const keyStore = "ActiveStore";
defineComponent({
    selector: "app-user",
    template:
        `<float-container user-area>
        <a float-toggle tool-item>
            <obi-title cmd-if='$.utente && ($.utente?.username || $.utente?.ruolo)' :titolo='utente.username' :descrizione='nome_negozio' size='sm'></obi-title>
            <obi-icon cmd-if='!utente.profilo' nome='person' relevance='secondary' circle></obi-icon>
            <obi-logo cmd-if='$.utente.profilo' :link='utente.profilo'></obi-logo>
        </a>
        <obi-card user-details floating-item='bottom right'>
            <obi-cover cmd-if='$.utente && ($.utente?.nome || $.utente?.cognome)' :titolo='$.utente?.nome + \" \" + $.utente?.cognome' :link='season' size='md'></obi-cover>
            <obi-cover cmd-else :titolo='utente.username' :link='season' size='md'></obi-cover>
            <card-body>
                <div dettagli>
                    <obi-label icona='badge' titolo='Ruolo:' :valore='utente.ruolo'></obi-label>
                    <obi-label cmd-if='"reparto" in $.utente' icona='work' titolo='Reparto:' :valore='utente.reparto'></obi-label>
                    <obi-label icona='mail' titolo='Email:' :valore='utente.email'></obi-label>
                    <obi-label cmd-if='"telefono" in $.utente' icona='call' titolo='Telefono:' :valore='utente.telefono'></obi-label>
                </div>

                <div negozi cmd-if='$.utente && $.utente?.negozi != null && $.utente?.negozi?.length > 0'>
                    <obi-headline>NEGOZI</obi-headline>
                    <section lista='negozi'>
                        <obi-chip cmd-for='neg in utente.negozi' @click='setNegozioAttivo' :relevance='$.neg.id == $.negozio ? "primary" : ""' :value='neg.id'>{{neg.nome}}</obi-chip>
                    </section>
                </div>
            
                <div fornitori cmd-if='$.utente?.fornitori != null && $.utente?.fornitori?.length > 0'>
                    <obi-headline>FORNITORI</obi-headline>
                    <section lista='fornitori'>
                        <obi-chip cmd-for='forn in utente.fornitori'>{{forn.nome}}</obi-chip>
                    </section>
                </div>
            </card-body>
            <card-action>
                <obi-button prepend='edit' label='Modifica' @click='openEditor' relevance='secondary'></obi-button>
                <obi-button prepend='logout' label='logout' @click='logout' variant='filled'></obi-button>
            </card-action>
        </obi-card>
        <obi-modal>
            <obi-card>
                <card-body display-grid='blog'>
                    <obi-label padding='sm' size='md' grid-article flex-size='auto' label='Aggiorna i tuoi dati'></obi-label>
                    <div grid-article>
                        <div display-row='wrap'>
                            <obi-textbox name='nome' flex-size='auto' label='Nome' :valore='utente.nome' required variant='filled'></obi-textbox>
                            <obi-textbox name='cognome' flex-size='auto' label='Cognome' :valore='utente.cognome' required variant='filled'></obi-textbox>
                        </div>
                        <div display-row='wrap'>
                            <obi-textbox name='email' flex-size='auto' label='email' :valore='utente.email' type='email' required variant='filled'></obi-textbox>
                            <obi-textbox cmd-if='"telefono" in $.utente' flex-size='auto' label='telefono' :valore='utente.telefono' type="number" variant='filled'></obi-textbox>
                            <obi-textbox cmd-if='"reparto" in $.utente' flex-size='auto' label='reparto' :valore='utente.reparto' variant='filled'></obi-textbox>
                        </div>
                        <div display-grid='blog' padding='sm' relevance='secondary' rounded>
                            <obi-label size='sm'padding='sm' grid-article label='Modifica Password'></obi-label>
                            <obi-textbox type='password' name='currentPassword' grid-article @keyup='checkCurrentPassword' label='Password Attuale' :valore='password.old' required variant='rounded'></obi-textbox>
                            <obi-textbox type='password' name='newPassword' grid-article @keyup='checkDifferentPassword' label='Nuova Password' :valore='password.updated' required variant='rounded'></obi-textbox>
                            <obi-textbox type='password' name='repeatPassword' grid-article @change='checkSamePassword' label='Ripeti la Nuova Password' :valore='password.repeat' required variant='rounded'></obi-textbox>
                        </div>
                    </div>
                </card-body>
                <card-action>
                    <obi-button label='Aggiorna' relevance='success' append='save' @click='edit'></obi-button>
                </card-action>
            </obi-card>
        </obi-modal>
     </float-container>`,
    options: {
        inputs: ["utente", "negozio"],
        dataset: {
            utente: { username: "", nome: "", cognome: "", ruolo: "", reparto: " ", email: "", telefono: "", password: "", negozi: [], fornitori: [], default: true },
            password: { old: "", updated: "", repeat: "" }
        },
        computed: {
            season: function () {
                var mm = new Date().getMonth() + 1;
                if (mm == 12 || (mm > 0 && mm < 3)) {
                    return "http://swita000006.de.obi.net/_webframework/OBIComponents/resources/images/backgroundOBI_winter.jpg";
                }
                if (mm > 5 && mm < 9) {
                    return "http://swita000006.de.obi.net/_webframework/OBIComponents/resources/images/backgroundOBI_summer.jpg";
                }
                if (mm > 8 && mm < 12) {
                    return "http://swita000006.de.obi.net/_webframework/OBIComponents/resources/images/backgroundOBI_autumn.jpg";
                }
                if (mm > 2 && mm < 6) {
                    return "http://swita000006.de.obi.net/_webframework/OBIComponents/resources/images/backgroundOBI_spring.jpg";
                }
                return "http://swita000006.de.obi.net/_webframework/OBIComponents/resources/images/backgroundOBI.jpg";
            },
            nome_negozio: function () {
                let user = UserHandler.instance.user;
                if (this.negozio && user && user.negozi)
                    return user.negozi.find(n => n.id == this.negozio)?.nome;
                return null;
            },
            modal: function () { return this.__node.getChildContext("obi-modal"); },
        },
        actions: {
            logout() {
                UserHandler.instance.logout();
                this.__node.trigger("logout", this.utente);
            },
            setNegozioAttivo(evt) {
                this.updateNgozio(evt.currentTarget.getAttribute("value"));
            },
            updateNgozio(neg) {
                this.negozio = neg;
                sessionStorage.setItem(keyStore, this.negozio);
            },
            openEditor() {
                this.modal.showModal();
            },
            edit() {
                if (!this.utente.email) {
                    this.__node.getChildContext("obi-textbox[name='email']").invalid = true;
                    obiAlert("Inserire un indirizzo email.", { type: 'warning' });
                    return;
                }
                if (this.password.updated) {
                    if (!(this.checkCurrentPassword() && this.checkSamePassword() && this.checkDifferentPassword())) return;
                    this.utente.password = this.password.updated;
                }
                this.__node.trigger("edit", this.utente);
                this.modal.closeModal();
            },
            //Controlla che la password attuale corrisponda
            checkCurrentPassword() {
                if (this.password.old != this.utente.password) {
                    this.__node.getChildContext("obi-textbox[name='currentPassword']").invalid = true;
                    this.__node.getChildContext("obi-textbox[name='currentPassword']").messaggio = "Inserire la password corretta.";
                    return false;
                }
                this.__node.getChildContext("obi-textbox[name='currentPassword']").invalid = false;
                this.__node.getChildContext("obi-textbox[name='currentPassword']").messaggio = "";
                return true;
            },
            //controlla che la password ripetuta sia uguale a quella nuova
            checkSamePassword() {
                if (this.password.repeat != this.password.updated) {
                    this.__node.getChildContext("obi-textbox[name='repeatPassword']").invalid = true;
                    this.__node.getChildContext("obi-textbox[name='repeatPassword']").messaggio = "Le password non corrispondono.";
                    return false;
                }
                this.__node.getChildContext("obi-textbox[name='repeatPassword']").invalid = false;
                this.__node.getChildContext("obi-textbox[name='repeatPassword']").messaggio = "";
                return true;
            },
            //Controlla che la nuova password sia diversa da quella attuale
            checkDifferentPassword() {
                if (this.password.updated == this.password.old) {
                    this.__node.getChildContext("obi-textbox[name='newPassword']").invalid = true;
                    this.__node.getChildContext("obi-textbox[name='newPassword']").messaggio = "Inserire una password diversa da quella attuale.";
                    return false;
                }
                this.__node.getChildContext("obi-textbox[name='newPassword']").invalid = false;
                this.__node.getChildContext("obi-textbox[name='newPassword']").messaggio = "";
                return true;
            },
            scrollNegozi: function () {
                if (this.__element) {
                    var lista = this.__element.querySelector("section[lista='negozi']");
                    if (lista) {
                        var chip = lista.querySelector("div[relevance='primary']");
                        if (chip) lista.scrollTop = chip.offsetTop - 50;
                    }
                }
            },
        },
        events: [clickRippleEvent,
            {
                name: Collection.node_event.progress,
                action: function (state) {
                    if (state == Collection.lifecycle.mounted && !this.utente.default) {
                        if (UserHandler.instance.logged) this.utente = UserHandler.instance.user;
                        if (this.utente.negozi && this.utente.negozi.length && !this.negozio) this.updateNgozio(sessionStorage.getItem(keyStore) || this.utente.negozi[0].id);
                    }
                }
            }
        ]
    }
});