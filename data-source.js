(function(jQuery) {
"use strict";

var $ = jQuery;

// TODO F:1630 we should move this class into dataserver component
var dataSource = Echo.Control.manifest("Echo.Apps.NewsFeed.DataSourceGroup");

if (Echo.Control.isDefined(dataSource)) return;

dataSource.inherits = Echo.Utils.getComponent("Echo.Apps.MediaGallery.DataSourceGroup");

dataSource.dependencies = [{
	"url": "{config:cdnBaseURL.apps.dataserver}/full.pack.js",
	"control": "Echo.DataServer.Controls.Pack"
}];

dataSource.init = function() {
	this.parent();
};

dataSource.methods._createPack = function(data) {
	return new Echo.DataServer.Controls.Dashboard.Pack({
		"target": $("<div>"),
		"context": this.config.get("context"),
		"meta": this.get("meta"),
		"domains": this.config.get("domains"),
		"apiToken": this.config.get("apiToken"),
		"apiBaseURL": this.config.get("apiBaseURLs.DataServer"),
		"cdnBaseURL": this.config.get("cdnBaseURL"),
		"data": data,
		"labels": this.config.get("labels"),
		"plugins": [{
			"name": "HideSettings"
		}, {
			"name": "AddRules"
		}]
	});
};

Echo.Control.create(dataSource);

var addRulesPlugin = Echo.Plugin.manifest("AddRules", "Echo.DataServer.Controls.Dashboard.Pack");

if (Echo.Plugin.isDefined(addRulesPlugin)) return;

addRulesPlugin.labels = {
	"packTitle": "Data Source"
};

addRulesPlugin.component.renderers.title = function(element) {
	var label = this.component.config.get("labels.packTitle") || this.labels.get("packTitle");
	return element.empty().append(label);
};


addRulesPlugin.component.renderers.newFeed = function(element) {
	var self = this.component;
	var failure = function() {
		self.showMessage({
			"type": "error",
			"target": self.view.get("errorCreatingFeed"),
			"message": self.labels.get("errorCreatingFeed")
		});
		var clickHandler = function() {
			self.view.get("errorCreatingFeed").empty();
			$(document).off('click', clickHandler);
		};
		$(document).on('click', clickHandler);
		self._newFeedDropdown.setState("default");
	};
	var callback = function(args) {
		self._newFeedDropdown.setState("adding");
		$.map(self.config.get("meta.ins"), function(value) {
			if (value.title === $(args.title).text()) {
				var conf = {};
				$.map(value.spec, function(param) {
					conf[param.name] = param["default"];
				});
				var feed = self._initDataObject("In", {
					"type": value.type,
					"title": value.title,
					"icon": value.icon,
					"status": "live",
					"conf": conf,
					"outs": self.get("data.outs", []),
					"rules": ["render-cards"]
				}, {"new": true});
				self.view.get("errorCreatingFeed").empty();
				feed.create({
					"success": function() {
						// clear errors in newly created feed
						self.feeds.push(feed);
						// update pack with the new feed
						self.update({
							"success": function() {
								self._appendFeed(feed);
								self._newFeedDropdown.setState("default");
								feed.toggleVisibility();
								self.events.publish({
									"topic": "onFeedAppend",
									"data": feed.get("data")
								});
							},
							"failure": failure
						});
					},
					"failure": failure
				});
				return false;
			}
		});
	};
	var entries = $.map(self.config.get("meta.ins"), function(value) {
		var title = $("<div></div>")
			.append(value.title)
			.tooltip({
				"title": value.desc,
				"placement": function(tip) {
					$(tip).css({
						"width": 200,
						"white-space": "normal"
					});
					return "right";
				}
			});
		return {
			"title": title,
			"icon": value.icon,
			"handler": callback
		};
	});
	entries.sort(function(a, b) {
		return $(a.title).text() < $(b.title).text() ? -1
			: $(a.title).text() > $(b.title).text() ? 1 : 0;
	});
	self._newFeedDropdown = new Echo.AppServer.Controls.Bundler.Dropdown({
		"target": element,
		"cdnBaseURL": self.config.get("cdnBaseURL"),
		"states": {
			"default": {
				"title": self.labels.get("normalButtonStateLabel"),
				"icon": "{config:cdnBaseURL.apps.appserver}/images/plus.png"
			},
			"adding": {
				"title": self.labels.get("addingButtonStateLabel"),
				"icon": "{config:cdnBaseURL.sdk}/images/loading.gif"
			}
		},
		"entries": entries
	});
	return element;
};

Echo.Plugin.create(addRulesPlugin);


})(Echo.jQuery);
