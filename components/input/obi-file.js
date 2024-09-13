import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { Support } from "../../LAMP/RenderModule/modules/library.js";
import { getIcon } from "../../src/support.js";
import { obiLoader } from "../../core.js";
import FileEncoder from "../../src/FileEncoder.js";

defineComponent({
    selector: "obi-file",
    template:
        `<div obi-file :icon='!$.label' :disabled='disabled'>
            <div file-droparea @drop='dropFile' @dragover='allowDrop' @dragenter='dragFocus' @dragleave='dragBlur' @click='searchFile' :fill='$.files.length > 0' :disabled='disabled'>
                <span placeholder cmd-if='!$.files.length && !$.dragger'>Seleziona o trascina un file</span>
                <span placeholder cmd-elseif='dragger'><obi-icon nome='upload_file'></obi-icon> Rilascia il file</span>
                <div file-item cmd-for='item in files' cmd-else>
                    <obi-icon :nome='$.getIcon($.item.input.type)'></obi-icon>
                    <div file-info>
                        <span :title='item.input.name'>{{item.input.name}}</span>
                        <span>{{$.getSize($.item.input.size)}}</span>
                    </div>
                    <obi-button @click='removeFile' :data-value="item.id" icon relevance='danger'><obi-icon nome='close'></obi-icon></obi-button>
                </div>
            </div>
            <obi-button :label='label' :relevance='relevance' :variant='variant' prepend='attach_file' :icon='$.label == null' @click='searchFile' :disabled='disabled'></obi-button>
            <input type='file' @change='selectFile' :multiple='isMultiple'/>
        </div>`,
    options: {
        inputs: ["label", "valore", "accept", "relevance", "variant", "files", "required", "disabled"],
        dataset: {
            files: [],
            dragger: false,
            relevance: "primary",
        },
        computed: {
            isMultiple: function () {
                return this.__element.hasAttribute("multiple");
            },
            value: function () {
                var files = [];
                for (const item of this.files) {
                    files.push(item.buffer);
                }
                return files.length == 1 ? files[0] : files;
            },
        },
        actions: {
            searchFile: function (evt) {
                try {
                    if (!evt.currentTarget.hasAttribute("disabled")) {
                        var target = evt.target;
                        var container = target.closest("[obi-file]");
                        var input = container.querySelector("input");
                        input.click();
                    }
                } catch (ex) {
                    console.error(ex);
                }
            },
            addFile: async function (input) {
                var file = {
                    id: Support.uniqueID(),
                    input: input,
                    buffer: await obiLoader(async function () { return await FileEncoder.fileBuffer(input); }, this.__node),
                }

                if (this.isMultiple) {
                    this.files.push(file);
                } else {
                    this.files.pop();
                    this.files.push(file);
                }
                if (this.valore != undefined) this.valore = this.value;
            },
            removeFile: function (evt) {
                evt.stopPropagation();
                var index = evt.currentTarget.getAttribute("data-value");
                if (index != null) this.files.splice(this.files.indexOf(this.files.find(f => f.id == index)), 1);
                if (this.valore != undefined) this.valore = this.value;
            },
            selectFile: function (evt) {
                for (const file of evt.target.files) {
                    this.addFile(file);
                }
                this.__element.querySelector("input").value = null;
            },
            dropFile: function (evt) {
                this.allowDrop(evt);
                this.dragger = false;
                for (const item of evt.dataTransfer.files) {
                    this.addFile(item);
                }
            },
            allowDrop: function (evt) {
                if (!evt.currentTarget.hasAttribute("disabled")) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            },
            getSize: function (bytes) {
                bytes = parseFloat(bytes);
                if (bytes > 999999999999) return `${(bytes / 1000000000000).toFixed(2)}TB`;
                if (bytes > 999999999) return `${(bytes / 1000000000).toFixed(2)}GB`;
                if (bytes > 999999) return `${(bytes / 1000000).toFixed(2)}MB`;
                if (bytes > 999) return `${(bytes / 1000).toFixed(2)}KB`;
                return `${bytes}B`;
            },
            dragFocus: function (evt) {
                this.allowDrop(evt);
                if (!evt.currentTarget.hasAttribute("disabled")) this.dragger = true;
            },
            dragBlur: function (evt) {
                this.dragger = false;
            },
            getIcon: function (type) {
                return getIcon(type);
            }
        },
    }
});

defineComponent({
    selector: "obi-file-component",
    template:
        `<test-template name='OBI FILE LOADER' :code='code'>
            <section actions slot='actions'>
                <obi-checkbox label='Multiple' :valore='multiple' button></obi-checkbox>
                <obi-checkbox label='Icon' :valore='icon' button></obi-checkbox>
                <obi-checkbox label='Disabled' :valore='disabled' button></obi-checkbox>
            </section>
        </test-template>`,
    options: {
        dataset: {
            multiple: false,
            icon: false,
            disabled: false,
        },
        computed: {
            code: function () {
                return "<obi-file" +
                    (this.multiple ? " multiple" : "") +
                    (this.icon ? "" : " label='Carica File'") +
                    (this.disabled ? " disabled" : "") +
                    "></obi-file>";
            }
        }
    }
});