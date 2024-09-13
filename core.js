
//#region ADAPTER
import { Collection } from "./LAMP/RenderModule/modules/enumerators.js";
import { sendEmailToAssistenza } from "./src/support.js";
import { stampDateIta } from './components/input/obi-date.js';
import loader from "./components/interface/obi-loader.js";
import Dialog from './components/dialog/obi-alert.js';
import { Support } from "./LAMP/RenderModule/modules/library.js";
/**
 * Metodo di stampa e interazione con messaggi a schermo
 * @param {*} message 
 * @param {*} options 
 */
export function obiAlert(message, options, exception = null) {

    if (exception != null && "source" in exception && "message" in exception) {
        if (options.actions == null) options.actions = [];
        options.actions.push({
            name: "Segnala",
            action: () => {
                sendEmailToAssistenza(`OBI Components - Segnalazione errore da ${exception.source}`, exception.message);
            },
            attributes: { variant: "filled" }
        });
        options.timer = 10000;
    }

    Dialog.Instance.stamp(message, options);
}
/**
 * Stampa la data in formato gg/mm/aaaa
 *
 * @export
 * @param {*} datetime
 * @returns {*}
 */
export function obiStampDate(datetime) {
    return stampDateIta(datetime);
}
/**
 * Lega ad un processo asincrono un'animazione di caricamento su elementi a schermo
 *
 * @export
 * @param {*} action
 * @param {...{}} vnodes
 * @returns {*}
 */
export function obiLoader(action, ...vnodes) {
    return loader(action, ...vnodes);
}
/**
 * Imposta un trigger su evento per i nodi virtuali al cui interno poter definire dei processi di download dati senza interrompere il rendering
 *
 * @export
 * @param {*} action
 * @returns {{ name: any; action: (state: any) => any; }}
 */
export function asyncDataLoader(action) {
    return {
        name: Collection.node_event.progress,
        action: async function (state) {
            if (state == Collection.lifecycle.mounted) {
                action.call(this);
            }
        }
    }
}
/**
 * Restituisce un indirizzo url diverso a seconda se il sito gira su localHost o su server
 *
 * @export
 * @param {*} serverUrl indirizzo da restituire sul server
 * @param {*} localUrl indirizzo da restituire in local host
 * @returns {*}
 */
export function dynamicUrl(serverUrl, localUrl) {
    return window.location.host.includes("localhost") ? localUrl : serverUrl;
}
//#endregion

//#region CLASSES
/**
 * Interfaccia di connessione al backend, permette di gestire un AbortController
 *
 * @export
 * @class iService
 * @typedef {iService}
 */
export class iService {

    controllers;

    constructor() {
        this.resetController();
    }

    resetController(key) {
        if (key)
            Reflect.deleteProperty(this.controllers, key);
        else
            this.controllers = {};
    }
    addController(key) {
        if (!key) key = Support.uniqueID();
        this.controllers[key] = new AbortController();
        return this.controllers[key];
    }
    getController(key) {
        return this.controllers[key];
    }

    abort(key, reason = "Interruzione Forzata") {
        if (key)
            this.controllers[key].abort(reason);
        else
            for (const k of Object.values(this.controllers)) {
                k.abort(reason);
            }
    }

}
//#endregion