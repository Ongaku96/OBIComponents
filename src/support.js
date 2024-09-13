import { Collection } from "../LAMP/RenderModule/modules/enumerators.js";

export function buttonClickRipple(evt) {
    const button = evt.currentTarget;
    let circle = button.querySelector(".ripple");
    if (circle) circle.remove();
    circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${evt.clientX - rect.left - radius}px`;
    circle.style.top = `${evt.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];

    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
    window.setTimeout(() => { circle.remove(); }, 700);
}
export function getPalette(name) {
    let _set = theme_palette.find(p => p.name == name);
    return _set ? _set.palette : null;
}
export function getIcon(type) {
    switch (type) {
        case "image/gif":
        case "image/jpeg":
        case "image/png":
            return "image";
        case "application/pdf":
            return "picture_as_pdf";
        case "text/csv":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        case "application/vnd.ms-excel":
            return "dataset";
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        case "application/msword":
            return "description";
        case "application/x-msdownload":
        case "application/x-apple-diskimage":
        case "application/octet-stream":
        case "application/vnd.android.package-archive":
        case "application/x-apple-diskimage":
        case "application/java-archive":
            return "terminal";
        case "archive/x-tar":
        case "archive/zip":
        case "archive/x-iso9660-image":
        case "archive/x-7z-compressed":
        case "archive/x-rar-compressed":
        case "archive/gzip":
        case "archive/x-bzip2":
            return "archive";
        case "audio/aac":
        case "audio/flac":
        case "audio/mpeg":
        case "audio/mp4":
        case "audio/wav":
        case "audio/x-ms-wma":
            return "mic";
        case "video/avi":
        case "video/mp4":
        case "video/webm":
        case "video/avchd":
        case "video/x-flv":
        case "video/quicktime":
        case "video/x-ms-wmv":
        case "video/x-matroska":
            return "movie";
        case "text/plain":
            return "notes";
        default: return "draft";
    }
}
export const clickRippleEvent = {
    name: Collection.node_event.render,
    action: (element) => {
        if (element) {
            let _buttons = element.nodeName == "BUTTON" || element.nodeName == "A" || element.nodeName == "LABEL" ? [element] : element.querySelectorAll("button, a");
            if (_buttons) {
                for (const btn of _buttons) {
                    if (!btn.rippleClick) {
                        btn.addEventListener("click", (evt) => {
                            buttonClickRipple(evt);
                        });
                        btn.rippleClick = true;
                    }
                }
            }
        }
    }
}
const theme_palette = [
    {
        name: "OBI",
        palette: [
            { name: "brand", color: "#FF7E21" },
            { name: "primary", color: "#69461E" },
            { name: "secondary", color: "#61574C" },
            { name: "tertiary", color: "##1A406B" },
        ]
    },
    {
        name: "Creatività", //#E3D8CD
        palette: [
            { name: "brand", color: "#B6997C" },
            { name: "primary", color: "#4E3D2C" },
            { name: "secondary", color: "#61574C" },
            { name: "tertiary", color: "##1A406B" },
        ]
    },

    {
        name: "Responsabilità", //#BFE1CC
        palette: [
            { name: "brand", color: "#66B785" },
            { name: "primary", color: "#1A3725" },
            { name: "secondary", color: "#4C6154" },
            { name: "tertiary", color: "##6B1A48" },
        ]
    },
    {
        name: "Collaborazione", //#14143F
        palette: [
            { name: "brand", color: "#6464CE" },
            { name: "primary", color: "#27277C" },
            { name: "secondary", color: "#4E4C61" },
            { name: "tertiary", color: "#6B2E1A" },
        ]
    },
    {
        name: "Crescita", //#531C3B
        palette: [
            { name: "brand", color: "#C2478D" },
            { name: "primary", color: "#3D142C" },
            { name: "secondary", color: "#614C58" },
            { name: "tertiary", color: "#3D6B1A" },
        ]
    }
]

/**
 * Invia una email di assistenza
 *
 * @export
 * @param {*} subject
 * @param {*} body
 * @param {string} [receiver="assistenza-it@obi-italia.it"]
 */
export function sendEmailToAssistenza(subject, body, receiver = "assistenza-it@obi-italia.it") {
    try {
        let mail = document.createElement("a");
        mail.href = `mailto:${receiver}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        mail.click();
    } catch (ex) {
        throw ex;
    }
}
