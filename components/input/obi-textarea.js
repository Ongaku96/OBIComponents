import { defineComponent } from "../../LAMP/RenderModule/LampRender.js";
import { Collection } from "../../LAMP/RenderModule/modules/enumerators.js";

defineComponent(
	{
		selector: "obi-textarea",
		template:
			`<div obi-textbox :disabled='disabled' :required='required'>
	    		<div text-input>
		    		<div contenteditable='true' cmd-model='valore' @change='onchange' @input='updateValidity' class='new-line' :disabled='disabled'></div>
					<span cmd-if='!$.valore' placeholder>{{placeholder}}</span>
		    		<label for='input' cmd-if='label'>{{label}}</label> 
		    		<div text-indicator></div>
	    		</div> 
	    		<div text-support> 
		    		<span message cmd-if='$.messaggio' class='txt-body2'>{{messaggio}}</span> 
		    		<span counter cmd-if='$.counter'>{{counter}}</span> 
	    		</div> 
    		</div>`,
		options: {
			dataset: {
				type: "text"
			},
			inputs: ["label", "valore", "messaggio", "placeholder", "required", "disabled"],
			actions: {
				isValid: function () {
					let _reference = this.__node.reference[0];
					return _reference ? checkValue(_reference.getAttribute("format"), this.value) : true;
					function checkValue(check, value) {
						if (check) {
							switch (check) {
								case "email":
									return Collection.regexp.mail.test(value);
								case "multiemail":
									return Collection.regexp.multiplemail.test(value);
								case "numeric":
									return Collection.regexp.numeric.test(value);
								case "textual":
									return Collection.regexp.textual.test(value);
								case "date":
									return Collection.regexp.dateformat.test(value);
							}
						}
						return true;
					}
				},
				updateValidity: function () {
					let _reference = this.__node.reference[0];
					if (_reference) {
						let _check = _reference.getAttribute("format");
						if (_check) {
							let _valid = 0;
							if (this.value) _valid = this.isValid() ? 1 : -1;
							switch (_valid) {
								case 1:
									_reference.removeAttribute("invalid");
									_reference.setAttribute("valid", "");
									break;
								case -1:
									_reference.removeAttribute("valid");
									_reference.setAttribute("invalid", "");
									break;
								default:
									_reference.removeAttribute("invalid");
									_reference.removeAttribute("valid");
									break;
							}
						}
					}
				},
				onchange: function () {
					this.__node.trigger("input-change", this.value);
				}
			},
			computed: {
				value: function () {
					let _reference = this.__node.reference[0];
					if (_reference) {
						let _input = _reference.querySelector("input");
						let _value = _input && "value" in _input ? _input.value : null;
						if (!isNaN(parseInt(_value))) _value = parseInt(_value);
						return _value;
					}
					return null;
				},
				content: function () {
					return !this.value ? this.valore = this.placeholder || "" : "";
				},
			}
		}
	}
)

defineComponent({
	selector: "obi-textarea-component",
	template:
		`<test-template name='OBI TEXTAREA' description='' :code='code'>
        </test-template>`,
	options: {
		computed: {
			code: function () {
				return `<obi-textarea placeholder='test textarea'></obi-textarea>`;
			}
		}
	},
});