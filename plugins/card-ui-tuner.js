(function(jQuery) {
"use strict";

var $ = jQuery;

var plugin = Echo.Plugin.manifest("CardUITuner", "Echo.StreamServer.Controls.Stream.Item");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	// TODO: this "thing" should be removed after conversations v1.4 release!
	// it was made in this way becose of unavailibility of item header render
	if (!this.config.get("presentation.displayAvatars")) {
		plugin.css = 'div.echo-streamserver-controls-stream-item-plugin-CardUIShim .echo-streamserver-controls-stream-item-depth-0 ' +
			'.echo-streamserver-controls-stream-item-plugin-CardUIShim-header-box { margin-left:0; }';
	}
};

plugin.component.renderers.avatar = function(element) {
	if (!this.config.get("presentation.displayAvatars") && this._isArticle()) {
		return element.hide();
	}
	return this.parentRenderer("avatar", arguments);
};

plugin.component.renderers.authorName = function(element) {
	if(!this.config.get("presentation.displayUsernames") && this._isArticle()) {
		if (this.config.get("presentation.displayAvatars")) {
			
		}
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

Echo.Plugin.create(plugin);

})(Echo.jQuery);
