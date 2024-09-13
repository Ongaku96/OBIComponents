import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import Service from "../../LAMP/ServerModule/LampService.js";
import { obiAlert } from "../../core.js";
import { iComponent } from "../../LAMP/RenderModule/modules/types.js";
import { convertModelToFormData as converter } from "../../src/FormData.js";

import "./chat-item.js";
import { Support } from "../../LAMP/RenderModule/modules/library.js";
import log from "../../LAMP/RenderModule/modules/console.js";

export class ObiMessage {
    note = "";
    nome = "";
    allegato = null;
    timeStamp = new Date();
    attributi = [];
    id_allegato = 0;
    last = false;
    profilo = null;
    status = "received";
    isSeparator = false;


    constructor(messaggio, user, allegato = null) {
        this.note = messaggio;
        this.nome = user;
        this.allegato = allegato;
        this.timeStamp = new Date();
        this.status = "created";
        this.id = Support.uniqueID();
    }
    set attributi(array) {
        array.foreach((e) => {
            this.attributi.push({
                label: e.label || null,
                icona: e.icona || null,
                action: e.action || null,
                color: e.color || null,
                params: e.params || null,
                title: e.title || null,
            })
        });
    }
    get isAttachment() { return this.allegato != null || this.id_allegato > 0; }
    get time() { return ("0" + this.timeStamp.getHours()).padRight(2) + ":" + ("0" + this.timeStamp.getMinutes()).padRight(2); }

}

defineComponent({
    selector: "obi-chat",
    template: `
<div obi-chat>
    <div chat-list @dragover='setDroppable' @dragenter='dragFocus' @dragleave='dragBlur' >
        <span placeholder cmd-if='dragger'><obi-icon nome='upload_file'></obi-icon>Rilascia gli allegati</span>
        <chat-item cmd-for='msg in chatItems' :messaggio='msg' :editable='$.isEditable' :removable='$.isRemovable' :admin='$.admin' :replyable='$.isReplyable'></chat-item>
    </div>
    <group-component chat-editor>
        <input name='attachment' type='file' multiple @change='selectFile'/>
        <float-container>
            <obi-button icon float-toggle @click='searchFile'><obi-icon nome='attachment'></obi-icon></obi-button>
            <slot name='attachments' />
        </float-container>
        <obi-textarea :valore='testo' placeholder='Scrivi un messaggio...'></obi-textarea>
        <float-container>
            <obi-button icon float-toggle @click='sendChatMessage'><obi-icon nome='send'></obi-icon></obi-button>
            <slot name='senders' />
        </float-container>
    </group-component>
</div>
    `,
    options: {
        inputs: ["url", "sendUrl", "model", "drop", "editable", "replyable", "removable", "autorefresh", "allowdrop", "admin", "user"],
        dataset: {
            refrehTime: 30000,
            timer: null,
            messages: [],
            testo: "",
            dragger: false,
        },
        computed: {
            chatItems: function () {
                return this.messages;
            },
            isEditable: function () { return this.editable != null; },
            isReplyable: function () { return this.replyable != null; },
            isRemovable: function () { return this.removable != null; },
            hasSendOptions: function () {
                return this.__element.querySelector("[slot='senders']") != null;
            },
            hasAttachOptions: function () {
                return this.__element.querySelector("[slot='attachments']") != null;
            },
            localKey: function () {
                return `chat.unsent.${this.id}`;
            },
        },
        actions: {
            readMessages: async function () {
                if (this.timer != null) clearTimeout(this.timer);
                Service.instance.getJson(this.url).then((data) => {
                    this.updateMessages(data);
                    if (this.autorefresh) this.timer = setTimeout(() => { this.readMessages(); }, this.refrehTime);
                }).catch((error) => {
                    obiAlert("Non è stato possibile leggere i messaggi.", { type: "error" });
                    console.error("ChatComponent: " + error);
                });
            },
            updateMessages: function (list) {
                this.messages.splice(0, this.messages.length);

                let local = this.getLocalMessages();
                if (local && local.length) local.map(m => list.push(m));

                let i = list.length - 1;
                let lastMessage = null;

                while (i >= 0) {
                    let item = list[i];
                    let next = i > 0 ? list[i - 1] : null;

                    item.timeStamp = item.timeStamp instanceof Date ? item.timeStamp : new Date(item.timeStamp) || new Date();
                    if (next) next.timeStamp = next.timeStamp instanceof Date ? next.timeStamp : new Date(next.timeStamp) || new Date();
                    this.messages.unshift(convertMessage(item, (lastMessage != null && lastMessage?.nome != item.nome) || i == list.length - 1, this.user));
                    if ((next && differentDates(item.timeStamp, next.timeStamp)) || i == 0)
                        this.messages.unshift(convertSeparator(item));

                    lastMessage = item;
                    i--;
                }

                function convertSeparator(item) {
                    let msx = new ObiMessage();
                    msx.note = item.timeStamp.toLocaleDateString("it-IT", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                    msx.isSeparator = true;

                    return msx;
                }

                function convertMessage(item, isLast, user = null) {
                    let msx = new ObiMessage()
                    msx.note = item.note || "";
                    msx.nome = item.nome;
                    msx.profilo = item.profilo || null;
                    msx.timeStamp = item.timeStamp;
                    msx.attributi = item.attributi || [];
                    msx.id_allegato = item.id_allegato;
                    msx.last = isLast;
                    msx.status = user == item.nome ? "sent" : "received";
                    return msx;
                }

                function differentDates(dateA, dateB) {
                    return dateA.getDate() != dateB.getDate() || dateA.getFullYear() != dateB.getFullYear() || dateA.getMonth() != dateB.getMonth();
                }
            },
            send: async function (message = null) {
                if (message.note || message.allegato) {
                    this.testo = "";
                    message.status = "sending";
                    this.messages.push(message);
                    Service.instance.post(this.sendUrl || this.url, message).then((res) => {
                        message.status = "sent";
                        this.removeLocalMessage(message.id);
                        this.__node.trigger("success", res);
                        this.__node.update();
                    }).catch((error) => {
                        message.status = "error";
                        this.saveLocalMessage(message);
                        this.__node.trigger("error", error);
                        this.__node.update();
                        obiAlert(error, { type: "error" });
                    });
                } else {
                    obiAlert("Non è possibile inviare un messaggio senza contenuto.", { type: "warning" });
                }
            },
            sendChatMessage: function () {
                if (!this.hasSendOptions) {
                    var msg = new ObiMessage(this.testo, this.user);
                    this.send(msg);
                }
            },
            saveLocalMessage: function (message) {
                try {
                    let list = this.getLocalMessages();
                    list.push(message);
                    localStorage.setItem(this.localKey, list);
                } catch (ex) {
                    log(ex, "error");
                }
            },
            removeLocalMessage: function (id) {
                try {
                    let list = this.getLocalMessages();
                    list = list.filter(m => m.id != id);
                    localStorage.setItem(this.localKey, list);
                } catch (ex) {
                    log(ex, "error");
                }
            },
            getLocalMessages: function () {
                try {
                    return JSON.parse(localStorage.getItem(this.localKey)) || [];
                } catch (ex) {
                    log(ex, "error");
                }
            },
            scrollBottom: function () {
                var chatlist = this.__element.querySelector("[chat-list]");
                chatlist.scrollTo(0, chatlist.scrollHeight);
            },
            searchFile: function (evt) {
                try {
                    if (!this.hasAttachOptions) {
                        var target = evt.target;
                        var container = target.closest("[chat-editor]");
                        var input = container.querySelector("input");
                        input.click();
                    }
                } catch (ex) {
                    console.error(ex);
                }
            },
            addFile: function (input) {
                this.send(new ObiMessage("", this.user, input));
            },
            selectFile: function (evt) {
                for (const file of evt.target.files) {
                    this.addFile(file);
                }
                this.__element.querySelector("input[name='attachment']").value = null;
            },
            dropFile: function (evt) {
                this.setDroppable(evt);
                this.dragger = false;
                for (const item of evt.dataTransfer.files) {
                    this.addFile(item);
                }
            },
            setDroppable: function (evt) {
                if (this.allowdrop) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            },
            dragFocus: function (evt) {
                this.setDroppable(evt);
                if (this.allowdrop) this.dragger = true;
            },
            dragBlur: function (evt) {
                this.dragger = false;
            },
        },
        events: [
            {
                name: "progress",
                action: function (state) {
                    switch (state) {
                        case "mounted":
                            this.readMessages();
                            break;
                        case "ready":
                            this.scrollBottom();
                            break;
                    }
                }
            },
            {
                name: "retry",
                action: function (item) {
                    this.messages.splice(this.messages.findIndex(m => m.id == item.id), 1);
                    this.send(item);
                }
            }
        ]
    },
});

defineComponent({
    selector: "obi-chat-component",
    template:
        `<test-template name='OBI CHAT' description='' :code='code'>
        </test-template>`,
    options: {
        computed: {
            code: function () {
                return `<obi-chat url='http://localhost:3000/Messages' user="mbiagini"></obi-chat>`;
            }
        }
    }
});