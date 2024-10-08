import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { Collection } from "../../LAMP/RenderModule/modules/enumerators.js";

var today = new Date();

defineComponent({
    selector: "obi-date",
    template:
        `<float-container obi-date :disabled='disabled'>
            <obi-textbox placeholder='gg/mm/aaaa' :valore='print_date' :label='label' append="<obi-button prepend='calendar_month' icon></obi-button>"
            :filter='input_filter' :format='##/##/####' @keyup='editDate' @click='select' :disabled='disabled' float-toggle></obi-textbox>
            <div floating-item date-calendar>
                <div name="selectors">
                    <div name="month_selector">
                        <obi-button prepend='chevron_left' @click='prevMonth'></obi-button>
                        <obi-button :label='month_display' @click="viewMonth"></obi-button>
                        <obi-button prepend='chevron_right' @click='nextMonth'></obi-button>
                    </div>
                    <obi-button style='height: 20px; min-height: unset; max-width: 20px;' icon @click='setToday'><obi-icon nome='circle'></obi-icon></obi-button>
                    <div name="year_selector">
                        <obi-button prepend='chevron_left' @click='prevYear'></obi-button>
                        <obi-button :label='year_display' @click="viewYears"></obi-button>
                        <obi-button prepend='chevron_right' @click='nextYear'></obi-button>
                    </div>
                </div>
                <div cmd-if="$.view == 'month'" name="months_section" @render='scrollView'>
                    <label cmd-for='month in months' @click='setMonth' :value='month' :current=':index == ($.date_display.getMonth())'>{{month}}</label>
                </div>
                <div cmd-elseif="$.view == 'year'" name="years_section" @render='scrollView'>
                    <label cmd-for='year in years' @click='setYear' :value='year' :current='$.isThisYear($.year)'>{{year}}</label>
                </div>
                <div cmd-else="$.view == 'grid'" name="month_grid">
                    <span>Lu</span>
                    <span>Ma</span>
                    <span>Me</span>
                    <span>Gi</span>
                    <span>Ve</span>
                    <span>Sa</span>
                    <span>Do</span>
                    <label cmd-for='day in grid_days' :class='day.type' :selected='day.selected' :value='$.stampDate($.day.date)' @click='setDate' float-toggle cmd-model='day.num'></label>
                </div>
            </div>
        </float-container>`,
    options: {
        inputs: ["valore", "label", "required", "disabled"],
        dataset: {
            months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            months_short: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
            week_days: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
            week_days_short: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
            week_days_single: ["L", "M", "M", "G", "V", "S", "D"],
            view: "grid",
            input_format: "##/##/####",
            input_filter: /\D/g,
            current_date: undefined,
            print_date: "",
        },
        computed: {
            /**valore della data di navigazione corrente*/
            date_display: function () {
                return isValidDate(this.current_date) ? this.current_date : (isValidDate(this.value) ? this.value : new Date(today.getFullYear(), today.getMonth(), 1));
            },
            years: function () {
                let current = new Date().getFullYear();
                let years = [];
                let y = current - 100;
                let max = current + 25;
                while (y < max) {
                    years.push(y);
                    y++;
                }
                return years;
            },
            month_display: function () {
                var month = this.months_short[new Date(this.date_display).getMonth()];
                return month
            },
            year_display: function () {
                var year = new Date(this.date_display).getFullYear();
                return year;
            },
            grid_days: function () {
                var days = [];
                var display = new Date();
                if (this.date_display instanceof Date) display = this.date_display;

                const types = {
                    selected: "select",
                    previous: "prev",
                    post: "post",
                    current: "month",
                    today: "today"
                }

                //set PREVIOUS DAYS
                var first_date = new Date(display.getFullYear(), display.getMonth(), 1);
                var first_date_day = first_date.getDay() == 0 ? 7 : first_date.getDay();

                for (let i = first_date_day - 1; i > 0; i--) {
                    let _temp = new Date(display.getFullYear(), display.getMonth(), 1);
                    _temp.setDate(first_date.getDate() - i);
                    days.push({ date: _temp, num: _temp.getDate(), type: types.previous, selected: isSelectedDate(_temp, parseDate(this.print_date)) });
                }

                //setup MONTH and POST DAYS
                var last_date = new Date(
                    display.getMonth() == 11 ? display.getFullYear() + 1 : display.getFullYear(),
                    display.getMonth() == 11 ? 0 : display.getMonth() + 1,
                    1);
                const diffTime = Math.abs(last_date - first_date);
                var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                if (Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 31) diffDays = 31;

                last_date.setDate(last_date.getDate() - 1);
                var last_date_day = 7 - (last_date.getDay() == 0 ? 7 : last_date.getDay());
                if ((days.length + diffDays + last_date_day - 1) / 7 < 5) last_date_day += 7;

                for (let i = 0; i < (diffDays + last_date_day); i++) {
                    let _temp = new Date(display.getFullYear(), display.getMonth(), 1);
                    _temp.setDate(first_date.getDate() + i);
                    let isToday = _temp.getDate() == today.getDate() && _temp.getMonth() == today.getMonth() && _temp.getFullYear() == today.getFullYear();
                    let _type = i >= diffDays ? types.post : (isToday ? types.today : types.current);
                    days.push({ date: _temp, num: _temp.getDate(), type: _type, selected: isSelectedDate(_temp, parseDate(this.print_date)) });
                }

                function isSelectedDate(date, selected) {
                    if (selected && date) {
                        return date.getDate() == selected.getDate() && date.getMonth() == selected.getMonth() && date.getFullYear() == selected.getFullYear();
                    }
                    return false;
                }

                return days;
            },
            /**Valore della data di stampa in formato data */
            value: function () {
                return parseDate(this.print_date);
            },
        },
        actions: {
            scrollView: function (element) {
                if (element) {
                    var current = element.querySelector("label[current]");
                    if (current) element.scrollTop = current.offsetTop - 130;
                }
            },
            setToday: function () {
                this.valore = new Date();
                this.update();
                this.view = 'grid';
            },
            viewMonth: function () {
                this.view = this.view == 'month' ? 'grid' : 'month';
            },
            setMonth: function (evt) {
                var month = evt.currentTarget.getAttribute("value");
                this.navigateDate(new Date(this.date_display.getFullYear(), this.months.indexOf(month), 1));
                this.view = "grid";
            },
            nextMonth: function () {
                let _date = this.date_display;
                this.navigateDate(new Date(
                    _date.getMonth() == 11 ? _date.getFullYear() + 1 : _date.getFullYear(),
                    _date.getMonth() == 11 ? 0 : _date.getMonth() + 1,
                    1));
            },
            prevMonth: function () {
                let _date = this.date_display;
                this.navigateDate(new Date(
                    _date.getMonth() == 0 ? _date.getFullYear() - 1 : _date.getFullYear(),
                    _date.getMonth() == 0 ? 11 : _date.getMonth() - 1,
                    1));
            },
            viewYears: function () {
                this.view = this.view == 'year' ? 'grid' : 'year';
            },
            scrollYears: function () {
                var element = this.__element.querySelector("div[name='years_section']");
                var current = element.querySelector("label[current]");
                element.scrollTop = current.offsetTop;
            },
            setYear: function (evt) {
                var year = evt.currentTarget.getAttribute("value");
                this.navigateDate(new Date(year, this.date_display.getMonth(), 1));
                this.view = "grid";
            },
            nextYear: function () {
                let _date = this.date_display;
                this.navigateDate(new Date(_date.getFullYear() + 1, _date.getMonth(), 1));
            },
            prevYear: function () {
                let _date = this.date_display;
                this.navigateDate(new Date(_date.getFullYear() - 1, _date.getMonth(), 1));
            },
            isThisYear: function (year) {
                return year == this.year_display;
            },
            stampDate: function (datetime) {
                return stampDateIta(datetime);
            },
            update() {
                if (isValidDate(this.valore)) this.current_date = this.valore;
                this.print_date = stampDateIta(this.valore);
            },
            setDate(evt) {
                this.valore = parseDate(evt.currentTarget.getAttribute("value"));
                this.update();
            },
            navigateDate(datetime) {
                if (typeof datetime === "string") datetime = parseDate(datetime);
                this.current_date = datetime;
            },
            editDate(evt) {
                let datetime = parseDate(this.print_date);
                if (datetime) this.current_date = datetime;
                this.valore = datetime;
            }
        },
        events: [
            {
                name: Collection.node_event.progress,
                action: function (state) {
                    if (state == Collection.lifecycle.mounted) {
                        if (isValidDate(this.valore)) this.update();
                    }
                }
            }
        ]
    }
});

/**
 * Controlla che le date siano uguali
 *
 * @param {...{}} dateSet
 * @returns {boolean}
 */
function sameDate(...dateSet) {
    if (dateSet = null || dateSet.length == 0) return false;
    let i = 0;
    let last = dateSet[i++];
    while (i < dateSet.length) {
        if (!isValidDate(dateSet[i])) return false;
        if (!(last.getFullYear() === date.getFullYear() && last.getMonth() === date.getMonth() && last.getDate() === date.getDate())) return false;
        i++;
    }
    return true;
}
/**Controlla che le date siano valide */
function isValidDate(datetime) { return datetime != null && datetime.toString != "Invalid Date"; }
/**Converte una stringa in un oggetto di tipo Data */
function parseDate(datestring, _default = null) {
    if (datestring) {
        let _split = datestring.split("/");
        return new Date(Date.UTC(Number(_split[2]), Number(_split[1]) - 1, Number(_split[0])));
    }
    return _default;
}

defineComponent({
    selector: "obi-date-component",
    template:
        `<test-template name='OBI DATE PICKER' description='' :code='code'>
            <section actions slot='actions'>
                <obi-select :valore='variante' label='Variante' :opzioni='varianti'></obi-select>
                <obi-checkbox label='Disabilita' :valore='disabled' button></obi-checkbox>
            </section>
        </test-template>`,
    options: {
        dataset: {
            variante: "",
            varianti: [
                { label: "standard", value: "" },
                { label: "filled", value: "filled" },
                { label: "outlined", value: "outlined" }
            ],
            disabled: false,
        },
        computed: {
            code: function () {

                let _variant = this.variante ? " variant='" + this.variante + "'" : "";
                let _disabled = this.disabled ? " disabled" : "";

                return "<obi-date label='label' " + _disabled + _variant + "></obi-date>"
            }
        },
        actions: {
            toggle: function (field) {
                this[field] = !this[field];
            }
        },
    }
});

export function stampDateIta(datetime) {
    try {
        if (datetime instanceof Date) {
            let _day = ("0" + datetime.getDate()).padRight(2);
            let _month = ("0" + (datetime.getMonth() + 1)).padRight(2);
            return _day + "/" + _month + "/" + datetime.getFullYear();
        }
    }
    catch (ex) {
        console.error(ex);
    }
    return datetime;
}