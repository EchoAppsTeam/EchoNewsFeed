(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("CardUITuner", "Echo.StreamServer.Controls.Card");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.component.renderers.avatar = function(element) {
	if (!this.config.get("presentation.displayAvatars") && this._isArticle()) {
		if (!this.config.get("presentation.displayUsernames")) {
			this.component.view.get("header-container").addClass(this.cssPrefix + "slimHeader");
		} else {
			this.component.view.get("header-container").addClass(this.cssPrefix + "shiftedHeader");
		}
		return element.hide();
	}
	return this.parentRenderer("avatar", arguments);
};

plugin.component.renderers.authorName = function(element) {
	if(!this.config.get("presentation.displayUsernames") && this._isArticle()) {
		return element.hide();
	}
	return this.parentRenderer("authorName", arguments);
};

plugin.methods._isArticle = function() {
	var isArticle = false;
	$.map(this.component.config.get("data.object.objectTypes"), function(type) {
		if (/\/(article)$/.test(type)) {
			isArticle = true;
		}
	});
	return isArticle;
};

plugin.css =
	'.{class:header-container}.{plugin.class:slimHeader} { height: 10px; margin-left: 0px; }' +
	'.{class:header-container}.{plugin.class:shiftedHeader} { margin-left: 0px; }';

Echo.Plugin.create(plugin);

})(Echo.jQuery);
