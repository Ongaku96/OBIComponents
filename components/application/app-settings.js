import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { View } from "../../LAMP/RenderModule/modules/library.js";
import UserHandler from "../../LAMP/UserModule/LampAccess.js";
import { getPalette as Palette } from "../../src/support.js";

defineComponent({
    selector: "app-settings",
    template:
        `<float-container>
            <obi-button tool-item relevance="brand" icon float-toggle><obi-icon nome="settings"></obi-icon></obi-button>
            <slot name='impostazioni'></slot>
        </float-container>`,
});

defineComponent({
    selector: "app-settings-list",
    template: `<obi-list slot='impostazioni' floating-item="bottom right" interact variant='elevated'></obi-list>`,
    options: {},
});

defineComponent({
    selector: "settings-item",
    template: `<list-item :prepend="prepend">{{label}}</list-item>`,
    options: {
        inputs: ["icona", "label"],
        computed: {
            prepend: function () { return `<obi-icon nome='${this.icona}'></obi-icon>`; },
        }
    }
});

defineComponent({
    selector: "settings-item-darkmode",
    template: `<list-item @click="toggleMode" :prepend="mode.prepend">{{mode.name}}</list-item>`,
    options: {
        computed: {
            isDark: function () {
                return document.body.getAttribute("theme") == "dark";
            },
            mode: function () {
                if (this.isDark) {
                    return {
                        name: "Light",
                        prepend: "<obi-icon nome='light_mode'></obi-icon>"
                    }
                } else {
                    return {
                        name: "Dark",
                        prepend: "<obi-icon nome='dark_mode'></obi-icon>"
                    }
                }
            }
        },
        actions: {
            toggleMode: function () {
                View.darkmode();
                if (UserHandler.instance.logged) {
                    UserHandler.instance.settings.darkmode = this.isDark;
                    UserHandler.instance.saveUser();
                    UserHandler.instance.setSessionUser();
                }
                this.__app.update();
            },
        }
    },
});

defineComponent({
    selector: "settings-item-radius",
    template: `<float-container>
    <list-item float-toggle prepend="<obi-icon nome='square'></obi-icon>">Bordi</list-item>
    <obi-list floating-item="left top" variant='elevated' interact>
        <list-item :active="$.__app.settings.interface?.radius == '16px'"
            prepend="<span style='width: 30px; height: 24px; border: solid 2px; border-radius: 16px;'></span>"
            value="16px" @click="changeRadius">Molto Stondati</list-item>
        <list-item :active="$.__app.settings.interface?.radius == '8px'"
            prepend="<span style='width: 30px; height: 24px; border: solid 2px; border-radius: 8px;'></span>"
            value="8px" @click="changeRadius">Stondati</list-item>
        <list-item :active="$.__app.settings.interface?.radius == '4px'"
            prepend="<span style='width: 30px; height: 24px; border: solid 2px; border-radius: 4px;'></span>"
            value="4px" @click="changeRadius">Poco Stondati</list-item>
        <list-item :active="$.__app.settings.interface?.radius == '0px'"
            prepend="<span style='width: 30px; height: 24px; border: solid 2px; border-radius: 0px;'></span>"
            value="0px" @click="changeRadius">Secchi</list-item>
    </obi-list>
</float-container>`,
    options: {
        actions: {
            changeRadius: function (evt) {
                let _size = evt.currentTarget.getAttribute("value");

                if (UserHandler.instance.logged) {
                    UserHandler.instance.settings.radius = _size;
                    UserHandler.instance.saveUser();
                    UserHandler.instance.setSessionUser();
                } else {
                    sessionStorage.setItem("radius", _size);
                }
                let new_settings = JSON.parse(JSON.stringify(UserHandler.instance.settings));
                new_settings.radius = _size;
                this.__app.updateSettings({ interface: new_settings });
                this.__app.update();
            },
        }
    }
});

defineComponent({
    selector: "settings-item-theme",
    template: `<float-container>
    <list-item float-toggle prepend="<obi-icon nome='palette'></obi-icon>">Tema</list-item>
        <obi-list floating-item="left top" variant='elevated' interact>
        <list-item :active="$.checkTheme('#FF7E21')"
            prepend="<span style='width: 24px; height: 24px; border-radius: 50%; background-color: #FF7E21'></span>"
            name="OBI" @click="changeTheme" icona="palette">Originale</list-item>
        <list-item :active="$.checkTheme('#B6997C')"
            prepend="<span style='width: 24px; height: 24px; border-radius: 50%; background-color: #E3D8CD'></span>"
            name="Creatività" @click="changeTheme" icona="palette">Creatività</list-item>
        <list-item :active="$.checkTheme('#66B785')"
            prepend="<span style='width: 24px; height: 24px; border-radius: 50%; background-color: #BFE1CC'></span>"
            name="Responsabilità" @click="changeTheme" icona="palette">Responsabilità</list-item>
        <list-item :active="$.checkTheme('#6464CE')"
            prepend="<span style='width: 24px; height: 24px; border-radius: 50%; background-color: #14143F'></span>"
            name="Collaborazione" @click="changeTheme" icona="palette">Collaborazione</list-item>
        <list-item :active="$.checkTheme('#C2478D')"
            prepend="<span style='width: 24px; height: 24px; border-radius: 50%; background-color: #531C3B'></span>"
            name="Crescita" @click="changeTheme" icona="palette">Crescita</list-item>
    </obi-list>
</float-container>
    `,
    options: {
        actions: {
            changeTheme: function (evt) {
                let _name = evt.currentTarget.getAttribute("name");
                if (UserHandler.instance.logged) {
                    UserHandler.instance.settings.palette = Palette(_name);
                    UserHandler.instance.saveUser();
                    UserHandler.instance.setSessionUser();
                } else {
                    sessionStorage.setItem("palette", JSON.stringify(Palette(_name)));
                }
                let new_settings = JSON.parse(JSON.stringify(UserHandler.instance.settings));
                new_settings.palette = Palette(_name);
                this.__app.updateSettings({ interface: new_settings });
                this.__app.update();
            },
            checkTheme: function (color) {
                return UserHandler.instance.logged && UserHandler.instance.settings?.palette != null ?
                    UserHandler.instance.settings.palette.find(c => c.name == "brand")?.color == color :
                    JSON.parse(sessionStorage.getItem("palette"))?.color == color;
            },
        }
    }
});