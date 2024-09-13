import { setupComponent } from "../../LAMP/RenderModule/modules/templates.js";

setupComponent(
    "obi-cover",
    `<div obi-cover class='bg-gray'>
        <img :src='link'>
        <div cmd-if='$.titolo' class='title-cover'></div>
        <obi-title obi-if='$.titolo' :titolo='titolo' :descrizione='sottotitolo'></div>
    </div>`,
    {
        inputs: ["link", "titolo", "sottotitolo"]
    }
);