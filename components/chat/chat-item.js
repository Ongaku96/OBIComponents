import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";

defineComponent({
    selector: "chat-item",
    template: `
        <div chat-item :value='messaggio.id' :separator='isSeparator' :last='isLast' :status='messaggio.status'>
            <div cmd-if='isSeparator'>{{messaggio.note}}</div>
            <div cmd-else chat-item-message>
                <div chat-user-profile>
                    <img cmd-if='$.messaggio.profilo' :src='messaggio.profilo' :alt='messaggio.nome'/>
                    <span cmd-else>{{shortUser}}</span>
                </div>
                <div chat-message-details>
                    <span :title='messaggio.nome'>{{messaggio.nome}}</span>
                    <span>{{messaggio.time}}</span>
                    <float-container cmd-if='$.isInteractable'>
                        <obi-button icon float-toggle><obi-icon nome='more_vert'></obi-icon></obi-button>
                        <obi-list floating-item='bottom right' variant='elevated'>
                            <list-item cmd-if='$.isEditable' @click='edit'><obi-icon prepend nome="edit"></obi-icon>Modifica</list-item>
                            <list-item cmd-if='$.isReplyable' @click='reply'><obi-icon prepend nome="reply"></obi-icon>Rispondi</list-item>
                            <list-item cmd-if='$.isRemovable' @click='remove'><obi-icon prepend nome="delete"></obi-icon>Elimina</list-item>
                        </obi-list>
                    </float-container>
                </div>
                <div chat-message-content>
                    <chat-document cmd-if='isDocument' :file='messaggio.note' @click='openFile'></chat-document>
                    <span cmd-else>{{messaggio.note}}</span>
                </div>
                <div chat-message-tags>
                    <obi-chip cmd-for='item in messaggio.attributi' :title='item.title'
                        :testo='$.item.label || false' :relevance='$.item.color || false'
                        :value=':index' :data-action='item.action' @click='tagClick'>
                        <obi-icon cmd-if='$.item.icona' :nome='item.icona'></obi-icon>
                    </obi-chip>
                    <obi-chip name='retry' testo='Riprova' data-action="retry" relevance='primary' prepend='redo' @click='tagClick'></obi-chip>
                </div>
            </div>
        </div>
    `,
    options: {
        inputs: ["messaggio", "editable", "replyable", "removable", "admin"],
        computed: {
            isDocument: function () { return this.messaggio?.isAttachment; },
            isSeparator: function () { return this.messaggio?.isSeparator; },
            isLast: function () { return this.messaggio?.last; },
            shortUser: function () {
                return this.messaggio.nome.slice(0, 2).toUpperCase();
            },
            isInteractable: function () {
                return this.isEditable || this.isRemovable || this.isReplyable;
            },
            isEditable: function () {
                return this.editable != "" && this.messaggio.status == "sent";
            },
            isRemovable: function () {
                return (this.removable != "" && this.messaggio.status == "sent") || this.admin != "";
            },
            isReplyable: function () {
                return this.replyable != "" && this.messaggio.status == "received";
            }
        },
        actions: {
            tagClick: function (evt) {
                let _value = evt.currentTarget.getAttribute("value");
                let _action = evt.currentTarget.getAttribute("data-action");
                let _attribute = this.messaggio.attributi.at(parseInt(_value));
                this.__node.getParent({ nodeName: "obi-chat" }).trigger(_action, _attribute || this.messaggio);
            },
            edit: function (evt) {
                this.__node.trigger("edit", this.messaggio);
            },
            reply: function (evt) {
                this.__node.trigger("reply", this.messaggio);
            },
            remove: function (evt) {
                this.__node.trigger("remove", this.messaggio);
            }
        },
    }
});