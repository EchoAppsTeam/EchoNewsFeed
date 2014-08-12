(function(jQuery) {
"use strict";

var $ = jQuery;

// TODO rename class
if (Echo.Control.isDefined("Echo.Apps.Conversations.Dashboard.TargetSelector")) return;

var component = Echo.Control.manifest("Echo.Apps.Conversations.Dashboard.TargetSelector");

component.inherits = Echo.Utils.getComponent("Echo.AppServer.Controls.Configurator.Items.RadioGroup");

component.events = {
	"Echo.AppServer.Controls.Configurator.Items.RadioGroup.onSectionChange": function(topic, data) {
		var isDefault = data.current === "default";
		this._setError(isDefault ? "" : this.input.get("data.error"));
		this.input.config.get("target")[isDefault ? "slideUp" : "slideDown"]();
	},
	"Echo.AppServer.Controls.Configurator.Items.Input.onChange": function() {
		this.setValue(this.value());
		return {"stop": ["bubble"]};
	},
	"Echo.AppServer.Controls.Configurator.Items.Input.onErrorStateChange": function() {
		if (this.section() === "default") {
			this._setError("");
		}
		return {"stop": ["bubble"]};
	}
};

component.config = {
	"default": ""
};

component.labels = {
	"validateError": "This field value should contain a valid URL"
};

component.init = function() {
	this.config.set("options", [{
		"title": this.config.get("defaultValueTitle"),
		"value": this.config.get("default"),
		"section": "default"
	}, {
		"title": this.config.get("customValueTitle"),
		"value": this.config.get("data.value"),
		"section": "custom"
	}]);
	this.parent();
};

component.vars = {
	"input": undefined,
	"currentSection": undefined
};

component.renderers.valueContainer = function(element) {
	var self = this;
	element.empty();
	$.map(this.config.get("options") || [], function(option) {
		self._renderOption(option);
		if (option.section === "custom") {
			/* jshint nonew:false */
			new Echo.AppServer.Controls.Configurator.Items.Input({
				"target": $(self.substitute({"template": '<div class="{class:input-container}"></div>'}))
					.appendTo(element)[self._isChecked(option) ? "show" : "hide"](),
				"cdnBaseURL": self.config.get("cdnBaseURL"),
				"data": $.extend(true, {}, self.get("data")),
				"context": self.config.get("context"),
				"validators": [function(value) {
					return {
						"correct": /^https?:\/\/[a-z0-9_\-\.]+\.(?:[a-z0-9_\-]+\.)*[a-z]+(\/|$)/i.test(value),
						"message": self.labels.get("validateError")
					};
				}],
				"ready": function() {
					self.input = this;
				}
			});
			/* jshint nonew:true */
		}
	});
	this.set("currentSection", this.section());
	return element;
};

component.methods.value = function() {
	return this.section() === "default"
		? this.config.get("default")
		: this.input.value();
};

component.methods._isChecked = function(option) {
	return (option.section === "default" && this.config.get("default") === option.value ||
		this.get("data.value") !== this.config.get("default")) && this.parent.apply(this, arguments);
};

component.methods._setError = function(error) {
	this.events.publish({
		"topic": "onErrorStateChange",
		"data": {
			"error": error,
			"item": this
		},
		"inherited": true
	});
};

component.css =
	'.{class:valueContainer} input.{class:input}[type="radio"] { margin-top: 0px; vertical-align: middle; width: 16px}' +
	'.{class:input-container} { margin: 5px 0 0 20px; }';

Echo.Control.create(component);

})(Echo.jQuery);
