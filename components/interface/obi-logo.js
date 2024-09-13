import { setupComponent } from "../../LAMP/RenderModule/modules/templates.js";

setupComponent(
    "obi-logo",
    `<div obi-icon>
        <img :src="link">
    </div>`,
    {
        inputs: ["link"],
    }
);