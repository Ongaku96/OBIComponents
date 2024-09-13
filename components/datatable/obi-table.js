import { Support } from '../../LAMP/RenderModule/modules/library.js';
import { defineComponent } from '../../LAMP/RenderModule/LampRender.js';
import { Collection } from '../../LAMP/RenderModule/modules/enumerators.js';
import { obiStampDate, obiAlert, obiLoader } from '../../core.js';
import Perform from '../../src/performanceWatcher.js';

export const columnTypes = {
    icon: "icon",
    image: "image",
    code: "code",
    currency: "currency",
    datetime: "datetime",
    number: "number",
    function: "function",
    boolean: "boolean",
}

defineComponent({
    selector: 'obi-table',
    template: `<div obi-table>
            <slot name='filtro'></slot>
            <div table-filters margin-updown='sm'>
                <obi-chip cmd-if='Array.isArray($.listaFiltri) && $.listaFiltri.length > 1' :relevance='danger' @click='cleanFilters'><obi-icon nome='remove'></obi-icon></obi-chip>
                <obi-chip cmd-for='filter in filter_list' :relevance='neutral' :label='filter.label' @click='$.removeFilter($.filter)' prepend='close'></obi-chip>
            </div>
            <div table-data-container>
                <table>
                    <thead>
                        <tr>
                            <th cmd-for="item in colonne" :name='$.item.name || $.item' @click='sort'>
                                <span prepend cmd-if='$.isAsc($.item.name || $.item)' class='material-symbols-outlined'>arrow_drop_up</span>
                                <span prepend cmd-elseif='$.isDesc($.item.name || $.item)' class='material-symbols-outlined'>arrow_drop_down</span>
                                {{$.item.label || $.item}}
                            </th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        <div table-pager>
            <group-component>
                <obi-button icon @click='firstPage' :disabled='$.page<=0'><obi-icon nome='first_page'></icon></obi-button>
                <obi-button icon @click='prevPage' :disabled='$.page<=0'><obi-icon nome='navigate_before'></icon></obi-button>
                <obi-button icon @click='nextPage' :disabled='$.page>=$.last_page'><obi-icon nome='navigate_next'></icon></obi-button>
                <obi-button icon @click='lastPage' :disabled='$.page>=$.last_page'><obi-icon nome='last_page'></icon></obi-button>
            </group-component>
            <span>{{($.count_first + 1) + " - " + $.count_last + " su " + $.count}}</span>
            <obi-select :valore='righe' :opzioni='countOptions' @changed='update'></obi-select>
        </div>
    </div>`,
    options: {
        inputs: ['colonne', 'dati', 'chiave', 'ordine', "righe", "filtro"],
        dataset: {
            id: "",
            page: 0,
            righe: 25,
            count: 0,
            direzione: "",
            ordine: "",
            view: [],
            listaFiltri: [],
            countOptions: [
                { label: "5", value: 5 },
                { label: "10", value: 10 },
                { label: "25", value: 25 },
                { label: "50", value: 50 },
                { label: "100", value: 100 },
            ],
        },
        storage: {
            datatable: [],
        },
        actions: {
            update() {
                obiLoader(async () => {
                    this.__storage.datatable = Support.deepClone(this.dati);
                    this.updateView();
                }, this.__node);
            },
            updateView() {
                this.filterData(this.__storage.datatable).then(async (filteredData) => {
                    this.sortData(filteredData).then((sortedData) => {
                        const data = this.getViewData(sortedData);
                        if (Array.isArray(data)) {
                            var template = document.createElement("tbody");
                            data.map((item) => {
                                let row = document.createElement("tr");
                                if (this.chiave && this.chiave in item) {
                                    row.setAttribute("value", Reflect.get(item, this.chiave));
                                    row.addEventListener("click", (evt) => { this.triggerRowClick(evt); });
                                }
                                for (const col of this.colonne) {
                                    let cell = document.createElement("td");
                                    if (typeof col == "object" && "type" in col) cell.setAttribute("type", col.type);
                                    cell.innerHTML = this.renderValue(item[col.name ?? col], col);
                                    row.appendChild(cell);
                                }
                                template.appendChild(row);
                            });

                            var body = this.__element.querySelector("tbody");
                            if (body != null) body.replaceWith(template);
                        }
                    });
                });
            },
            getViewData(data) {
                if (!data) return [];
                this.count = data.length;
                return data.slice(this.count_first, this.count_last);
            },
            firstPage() {
                this.page = 0;
                this.updateView();
            },
            lastPage() {
                this.page = this.last_page;
                this.updateView();
            },
            nextPage() {
                if (this.count_last < this.count) this.page += 1;
                this.updateView();
            },
            prevPage() {
                if (this.page > 0) this.page -= 1;
                this.updateView();
            },
            sort(evt) {
                let _element = evt.currentTarget;
                let _sort = _element.getAttribute("name");
                if (this.ordine == _sort) {
                    switch (this.direzione) {
                        case "desc":
                            this.ordine = "";
                            this.direzione = "";
                            break;
                        case "asc": this.direzione = "desc"; break;
                        default: this.direzione = "asc"; break;
                    }
                } else {
                    this.ordine = _sort
                    this.direzione = "asc";
                }
                this.updateView();
            },
            triggerRowClick(evt) {
                let _target = evt.currentTarget;
                let _value = _target.getAttribute("value");
                this.__node.trigger("rowclick", this.dati.find(e => e[this.chiave] == _value));
            },
            isAsc(col) {
                return this.direzione == "asc" && col == this.ordine;
            },
            isDesc(col) {
                return this.direzione == "desc" && col == this.ordine;
            },
            removeFilter(item) {
                if (item != null) {
                    this.listaFiltri = this.listaFiltri.filter(f => Reflect.get(f, item.key) != item.value);
                    if (this.filtro) {
                        if (item.key in this.filtro) this.filtro[item.key] = "";
                        if (this.listaFiltri.length == 0) this.listaFiltri.push(this.filtro);
                    }
                    this.refreshFilter();
                }
                else {
                    this.cleanFilters();
                }
            },
            addFilter(item) {
                this.listaFiltri.push(item);
                this.refreshFilter();
            },
            cleanFilters() {
                this.listaFiltri = this.filtro ? [this.filtro] : [];
                this.refreshFilter();
            },
            refreshFilter() {
                this.updateView();
            },
            async filterData(listaDati) {
                let filters = getFilter(this.listaFiltri);
                if (Object.keys(filters).length > 0)
                    Perform.measure(() => { listaDati = listaDati.filter(item => checkFilter(item, filters)) }, "OBI-TABLE.filter");
                return listaDati;
            },
            async sortData(listaDati) {
                if (this.ordine) Perform.measure(() => { listaDati = listaDati.sort((Support.dynamicSort(this.ordine, this.direzione == "desc"))) }, "OBI-TABLE.sort");
                return listaDati;
            },
            export(filename = "report", options = null) {
                var csv = "";
                //#region HEADERS
                var columns = (options && options.labels) || this.colonne || Object.keys(this.dati[0]) || []; //ottengo la lista di colonne
                if (options && options.displayLabels) { //controllo se le colonne vanno stampate
                    let row = ""; //stampo le colonne
                    for (const item of columns) {
                        let column = item.label || item;
                        row += `${column};`;
                    }
                    csv += `${row.slice(0, row.length - 1)}\r\n`; //aggiungo la riga alla tabella
                }
                //#endregion
                //#region DATA
                //ottengo la lista dei dati
                this.filterData(this.__storage.datatable).then(async (filteredData) => {
                    this.sortData(filteredData).then((data) => {
                        for (const item of data) {
                            let row = "";//stampo i dati
                            for (const col of columns) {
                                let value = Reflect.get(item, col.name || col); //ottengo il valore
                                if (!(options && options.cleanData)) { //controllo se il valore va formattato
                                    if (typeof col == "object" && "format" in col && typeof col.format == "function") { //controllo se è stata specificata una formattazione
                                        value = col.format.call(this, value);
                                    }
                                    else { //formatto il valore in base alle impostazioni del componente
                                        this.__node.settings && "formatters" in this.__node.settings ? Support.format(value, this.__node.settings.formatters) : value;
                                    }
                                }
                                row += `${value};`; //stampo il valore nella riga
                            }
                            csv += `${row.slice(0, row.length - 1)}\r\n`; //aggiungo la riga alla tabella
                        }

                        //#region FILE
                        //rimuovo gli spazi e li sostituisco con underscore
                        filename = filename.replace(/ /g, "_");
                        //decodifico il csv in un indirizzo uri
                        var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);

                        //creo un nuovo elemento hypertext
                        var link = document.createElement("a");
                        link.href = uri;

                        //rendo l'elemento invisibile
                        link.style = "visibility:hidden";
                        link.download = filename + ".csv";

                        //apro il documento in modo che avvii il download automatico
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        //#endregion
                    });
                });
                //#endregion
            },
            renderValue(value, column) {
                if (column != null && typeof column == "object" && "type" in column) {
                    switch (column.type) {
                        case columnTypes.icon: return `<span rounded class="material-symbols-outlined">${value}</span>`;
                        case columnTypes.image: return value ? `<img :src="${value}" rounded/>` : `<span class="material-symbols-outlined" rounded>image</span>`;
                        case columnTypes.code: return value.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
                        case columnTypes.currency: return `${value.toLocaleString("it-IT", { style: "decimal", maximumFractionDigits: 2 })}€`;
                        case columnTypes.datetime: return obiStampDate(value);
                        case columnTypes.function: return column.format.call(this, value);
                        case columnTypes.boolean:
                            if (typeof value === "string") value = Boolean.parseBoolean(value);
                            return `<span rounded class="material-symbols-outlined" text-color='${value ? "success" : "danger"}'>${value ? "check" : "close"}</span>`;
                    }
                }
                return Support.format(value, this.__node.settings.formatters);
            },
            //options: {
            //    labels?: string[] | { label: string, name: string, format: func<string> }, //lista delle colonne da stampare
            //    displayLabels?: bool, //aggiunge le intestazioni come prima riga se true
            //    viewAll?: bool, //applica i filtri della tabella se false,
            //    cleanData: bool, //non formatta i dati
            //}
        },
        computed: {
            last_page: function () { return Math.ceil(this.count / this.righe) - 1; },
            count_first: function () {
                let _first = this.page * this.righe;
                return _first > this.count ? 0 : this.page * this.righe;
            },
            count_last: function () {
                return this.count_first + this.righe <= this.count ? this.count_first + this.righe : this.count;
            },
            filter_list: function () {
                let labels = [];
                if (Array.isArray(this.listaFiltri)) {
                    for (const item of this.listaFiltri) {
                        let keys = Object.keys(item);
                        for (const key of keys) {
                            let value = Reflect.get(item, key);
                            if (value) labels.push({ label: `${key}: ${value}`, key: key, value: value });
                        }
                    }
                }
                if (labels.length) this.updateView();
                return labels;
            }
        },
        events: [
            {
                name: Collection.node_event.progress,
                action(state) {
                    if (state == Collection.lifecycle.mounted) {
                        this.id = Support.uniqueID();
                        if (this.filtro) this.listaFiltri.push(this.filtro);
                        this.update();
                    }
                }
            }
        ],
        settings: {
            formatters: [
                {
                    type: "string",
                    stamp: function (value) {
                        let splitted = value.split("T")[0].split("-");
                        let date = new Date(parseInt(splitted[0]), splitted[1] - 1, parseInt(splitted[2]));

                        if (date && date != "Invalid Date") {
                            if (date.getFullYear() == 9999) return "";
                            return `${("00" + date.getDate()).padRight(2)}-${("00" + (date.getMonth() + 1)).padRight(2)}-${date.getFullYear()}`;
                        }
                        return value;
                    }
                }
            ]
        },
    }
});

defineComponent({
    selector: "obi-table-component",
    template:
        `<test-template name='OBI DATA TABLE' description='' :code='code' :data='table'>
            <section actions slot='actions'>
                <obi-select :valore='relevance' label='Colori' :opzioni='colors'></obi-select>
                <obi-checkbox label='Interact' :valore='selectable' button></obi-checkbox>
            </section>
        </test-template>`,
    options: {
        dataset: {
            table: {
                list: elabData(1000),
                columns: ["id", "nome", "datetime"],
                filtro: {},
            },
            model: {
                nome: "",
                datetime: null,
            },
            relevance: "",
            colors: [
                { label: "Nessun colore", value: "" },
                { label: "Primary", value: "primary" },
                { label: "Secondary", value: "secondary" },
                { label: "Tertiary", value: "tertiary" },
                { label: "Success", value: "success" },
                { label: "Warning", value: "warning" },
                { label: "Danger", value: "danger" },
                { label: "Info", value: "info" },
                { label: "Neutral", value: "neutral" },
                { label: "Dark", value: "dark" },
            ],
            selectable: false,
        },
        computed: {
            dataset: {
                limit: 50,
            },
            code: function () {
                return `<obi-table :dati='list' :colonne='columns' ${this.selectable ? "interact" : ""} ${this.relevance ? "alternate='" + this.relevance + "'" : ""}></obi-table>`;
            },
        },
    }
});

function randomDate() {
    return new Date(Math.random() * (2024 - 2020 + 1) + 2020,
        Math.random() * (12) + 1,
        Math.random() * (29) + 1);
}

function elabData(limit) {
    var list = [];
    for (let i = 0; i < limit; i++) {
        list.push({ id: i, nome: Support.uniqueID(), datetime: randomDate() });
    }
    return list;
}
//AND tra proprietà diverse e OR tra stesse proprietà
function checkFilter(data, filters) {
    if (data == null) return false;
    //Controllo per ogni proprietà se una sola condizione risulta vera allora la proprietà è vera
    //ma se anche una sola proprietà non rispetta nessuna condizione, essendo le varie proprietà in AND di conseguenza nessuna è giusta.
    for (const key of Object.keys(filters)) {
        if (filters[key].length && filters[key].find(value => condition(data[key], value)) == null) return false;
    }
    return true;

    function condition(value, filter) {
        if (filter) return typeof value === "string" ? value.includes(filter) : filter == value;
        return false;
    }
}

function getFilter(filters) {
    let filter = {};
    for (const item of filters) {
        let props = Object.keys(item);
        for (const key of props) {
            if (item[key])
                if (key in filter) filter[key].push(item[key]); else filter[key] = [item[key]];
        }
    }
    return filter;
}