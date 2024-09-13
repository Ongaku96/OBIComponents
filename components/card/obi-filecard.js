import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import Service from "../../LAMP/ServerModule/LampService.js";
import { obiAlert, obiLoader, asyncDataLoader } from "../../core.js";

defineComponent({
    selector: "obi-filecard",
    template: `<div size='sm' obi-card='file' style='cursor: pointer'>
    <obi-cover size='xl' cmd-if='$.file.thumbnail != null' :link='file.thumbnail' @click='openFile'></obi-cover>
    <card-header :titolo='file.name' :sottotitolo='readableSize' :prepend='icon' @click='openFile'></card-header>
    <card-body cmd-if='$.file.descrizione != null' :corpo='file.descrizione' @click='openFile'></card-body>
    <obi-modal size='file'>
        <img style='width: 100%; height: 100%;' :src="file.data"/>
    </obi-modal>
</div>`,
    options: {
        inputs: ["file", "url"],
        dataset: {
            file: {
                name: "file.txt", //file name
                size: 0, //file size
                descrizione: null, //file description
                application: null, //file application mime type
                thumbnail: null, //file's thumbnail object url
                data: null, //file's object url
            },
            url: {
                file: "",
                preview: "",
            },
        },
        computed: {
            modal: function () { return this.__element.querySelector("[obi-modal]").virtual; },
            icon() {
                let name = "";
                switch (this.file.application || getApplicationFromFileName(this.file.name)) {
                    case "image/gif":
                    case "image/jpeg":
                    case "image/png": name = "image";
                    case "application/pdf": name = "picture_as_pdf";
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    case "application/vnd.ms-excel": name = "table_view";
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    case "application/msword": name = "description";
                    default: name = "draft"; break;
                }
                return `<obi-icon nome='${name}'></obi-icon>`;
            },
            readableSize() {
                return readableFileSize(this.file.size);
            },
        },
        actions: {
            openFile() {
                let application = this.file.application || getApplicationFromFileName(this.file.name);
                if (application.includes("pdf") ||
                    application.includes("image") ||
                    application.includes("video") ||
                    application.includes("audio")) {
                    if (!this.file.data && this.url.file) {
                        obiLoader(async () => await Service.instance.getObjectUrl(this.url.file).then((result) => {
                            var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
                            window.open(result, "_blank", strWindowFeatures);
                        }),
                            { vnode: this.__element.querySelector("img").virtual, skeleton: 'default' }).catch(ex => obiAlert(ex.message, { type: "error" }));
                    }
                    // this.modal.context.showModal();
                } else {
                    this.download();
                }
            },
            async download() {
                if (!this.file.data && this.url.file) {
                    document.body.style.cursor = "wait";
                    var result = await Service.instance.getObjectUrl(this.url.file)
                    this.file.data = result;
                    document.body.style.cursor = "default";
                }
                if (this.file.data) {
                    const downloadLink = document.createElement("a");
                    downloadLink.href = this.file.data;
                    downloadLink.download = this.file.name;
                    downloadLink.click();
                } else {
                    obiAlert("Non è stato possibile scaricare il file", { type: "warning" });
                }
            }
        },
        events: [asyncDataLoader.call(this, async function () {
            if (!this.file.thumbnail && this.url.preview) {
                obiLoader(async () => await Service.instance.getObjectUrl(this.url.preview).then((result) => { this.file.thumbnail = result; }),
                    { vnode: this.__node, skeleton: 'default' }).catch(ex => obiAlert(ex.message, { type: "error" }));
            }
        })]
    }
});

function getApplicationFromFileName(filename) {
    let split = filename.split(".");
    let extension = split[split.length - 1];
    return {
        "aac": "audio/aac",
        "abw": "application/x-abiword",
        "arc": "application/x-freearc",
        "avi": "video/x-msvideo",
        "azw": "application/vnd.amazon.ebook",
        "bin": "application/octet-stream",
        "bmp": "image/bmp",
        "bz": "application/x-bzip",
        "bz2": "application/x-bzip2",
        "cda": "application/x-cdf",
        "csh": "application/x-csh",
        "css": "text/css",
        "csv": "text/csv",
        "doc": "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "eot": "application/vnd.ms-fontobject",
        "epub": "application/epub+zip",
        "gz": "application/gzip",
        "gif": "image/gif",
        "htm": "text/html",
        "html": "text/html",
        "ico": "image/vnd.microsoft.icon",
        "ics": "text/calendar",
        "jar": "application/java-archive",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "jsonld": "application/ld+json",
        "mid": "audio/midi audio/x-midi",
        "midi": "audio/midi audio/x-midi",
        "mjs": "text/javascript",
        "mp3": "audio/mpeg",
        "mp4": "video/mp4",
        "mpeg": "video/mpeg",
        "mpkg": "application/vnd.apple.installer+xml",
        "odp": "application/vnd.oasis.opendocument.presentation",
        "ods": "application/vnd.oasis.opendocument.spreadsheet",
        "odt": "application/vnd.oasis.opendocument.text",
        "oga": "audio/ogg",
        "ogv": "video/ogg",
        "ogx": "application/ogg",
        "opus": "audio/opus",
        "otf": "font/otf",
        "png": "image/png",
        "pdf": "application/pdf",
        "php": "application/x-httpd-php",
        "ppt": "application/vnd.ms-powerpoint",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "rar": "application/vnd.rar",
        "rtf": "application/rtf",
        "sh": "application/x-sh",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tar": "application/x-tar",
        "tif": "image/tiff",
        "tiff": "image/tiff",
        "ts": "video/mp2t",
        "ttf": "font/ttf",
        "txt": "text/plain",
        "vsd": "application/vnd.visio",
        "wav": "audio/wav",
        "weba": "audio/webm",
        "webm": "video/webm",
        "webp": "image/webp",
        "woff": "font/woff",
        "woff2": "font/woff2",
        "xhtml": "application/xhtml+xml",
        "xls": "application/vnd.ms-excel",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "xml": "application/xml",
        "xul": "application/vnd.mozilla.xul+xml",
        "zip": "application/zip",
        "3gp": "video/3gpp",
        "3g2": "video/3gpp2",
        "7z": "application/x-7z-compressed"
    }[extension] || "application/octet-stream";
}
function readableFileSize(attachmentSize) {
    const DEFAULT_SIZE = 0;
    const fileSize = attachmentSize ?? DEFAULT_SIZE;

    if (!fileSize) {
        return `${DEFAULT_SIZE} kb`;
    }

    const sizeInKb = fileSize / 1024;

    if (sizeInKb > 1024) {
        return `${(sizeInKb / 1024).toFixed(2)} mb`;
    } else {
        return `${sizeInKb.toFixed(2)} kb`;
    }
}

defineComponent({
    selector: "obi-card-component",
    template:
        `<test-template name='OBI CARD' description='' :code='code' :data='item'>
            <section actions slot='actions'>
                <obi-select :valore='variant' label='Varianti' :opzioni='variants'></obi-select>
                <obi-select :valore='relevance' label='Colori' :opzioni='colors'></obi-select>
                <obi-checkbox label='Corpo' :valore='body' button></obi-checkbox>
                <obi-checkbox label='Azioni' :valore='action' button></obi-checkbox>
                <obi-checkbox label='Cover' :valore='cover' button></obi-checkbox>
                <obi-checkbox label='Prepend' :valore='prepend' button></obi-checkbox>
                <obi-checkbox label='Append' :valore='append' button></obi-checkbox>
                <obi-checkbox label='Collapse' :valore='collapsible' button></obi-checkbox>
            </section>
        </test-template>`,
    options: {
        dataset: {
            body: false,
            action: false,
            cover: false,
            prepend: false,
            append: false,
            variant: false,
            collapsible: false,
            variants: [
                { label: "Standard", value: "" },
                { label: "Filled", value: "filled" },
                { label: "Elevated", value: "elevated" },
                { label: "outlined", value: "outlined" },
            ],
            relevance: "",
            colors: [
                { label: "Nessun colore", value: "" },
                { label: "primary", value: "primary" },
                { label: "secondary", value: "secondary" },
                { label: "tertiary", value: "tertiary" },
                { label: "success", value: "success" },
                { label: "warning", value: "warning" },
                { label: "danger", value: "danger" },
                { label: "info", value: "info" },
                { label: "neutral", value: "neutral" },
                { label: "dark", value: "dark" },
            ],
            item: {
                lorem_ipsum: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras quam massa, imperdiet ut lobortis in, faucibus at felis. Nam in lorem suscipit, placerat ipsum non, finibus leo.",
                collapsed: false,
            }
        },
        computed: {
            code: function () {
                let _body = this.body ? "\n    <card-body :corpo='lorem_ipsum'></card-body>" : "";
                let _action = this.action ? `\n    <card-action>
        <obi-button relevance='secondary' icon><obi-icon nome='star'></obi-icon></obi-button>
        <obi-button relevance='primary'>Primaria</obi-button>        
    </card-action>` : "";
                let _cover = this.cover ? "\n    <obi-cover link='../../resources/images/backgroundOBI.jpg'></obi-cover>" : "";
                let _prepend = this.prepend ? "\n\tprepend='<obi-icon nome=\"alternate_email\"></obi-icon>'" : "";
                let _append = this.append ? "\n\tappend='<obi-icon nome=\"alternate_email\"></obi-icon>'" : "";
                let _variant = this.variant ? " variant='" + this.variant + "'" : "";
                let _relevance = this.relevance ? " relevance='" + this.relevance + "'" : "";

                return `
<obi-card${_relevance}${_variant}${this.collapsible ? " :collapse='$.collapsed ? \"hide\":\"show\"'" : ""}>${_cover}
    <card-header titolo='Titolo card' sottotitolo='Sottotitolo della card'${_prepend}${_append} ${this.collapsible ? "@click = '$.collapsed != $.collapsed'" : ""}></card-header>${_body}${_action}
</obi-card>`;
            },
        },
    }
});