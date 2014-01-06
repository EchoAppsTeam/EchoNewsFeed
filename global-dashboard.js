(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.NewsFeedGlobal.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.NewsFeedGlobal.Dashboard");

dashboard.dependencies = [{
	"url": "http://cdn.echoenabled.com/apps/echo/media-gallery/dashboard/data-source.js",
	"control": "echo.apps.streamplus.instancedatasource"
}, {
	"url": "{config:cdnBaseURL.apps.dataserver}/full.pack.js",
	"control": "Echo.DataServer.Controls.Pack"
}];

dashboard.config = {
	"ecl": [{
		"name": "targetURL",
		"component": "Echo.Apps.MediaGallery.DataSourceGroup",
		"type": "string",
		"required": true,
		"config": {
			"title": "",
			"labels": {
				"dataserverBundleName": "Echo Stream+ Auto-Generated Bundle for {instanceName}"
			},
			"apiBaseURLs": {
				"DataServer": "http://nds.echoenabled.com/api/"
			}
		}
	}]
};

dashboard.labels = {
	"status": "Status",
	"baseURL": "Server base URL",
	"busName": "Bus name",
	"failedToFetchToken": "Failed to fetch customer dataserver token: {reason}",
	"password": "Password"
};

dashboard.templates.main =
	'<div class="{class:container}"></div>';

dashboard.templates.setting =
	'<div class="{class:setting}">' +
		'<div class="{class:settingTitle}">{data:title}: </div>' +
		'<div class="{class:settingValue}">{data:value}</div>' +
		'<div class="echo-clear"></div>' +
	'</div>';

// TODO: get rid of this heavy normalization process
dashboard.config.normalizer = {
	"ecl": function(obj, component) {
		return $.map(obj, function(field) {
			return $.extend({}, field, {
				"items": $.map(field.items || {}, function(item) {
					return item;
				})
			});
		});
	}
};

dashboard.init = function() {
	var self = this, parent = $.proxy(this.parent, this);
	var deferreds = [$.Deferred(), $.Deferred()];
	this._fetchCustomerDomains(deferreds[0].resolve);
	$.when.apply($, deferreds).done(function() {
			var ecl = self._prepareECL(self.config.get("ecl"));
			self.config.set("ecl", ecl);
			parent();
	});
	this._fetchDataServerToken(deferreds[1].resolve);
};

dashboard.methods._fetchCustomerDomains = function(callback) {
	var self = this;
	Echo.AppServer.API.request({
		"endpoint": "customer/{id}/domains",
		"id": this.config.get("data.customer").id,
		"onData": function(response) {
			self.config.set("domains", response);
			callback.call(self);
		},
		"onError": function(response) {
			self._displayError(self.labels.get("failedToFetchDomains", {"reason": response.data.msg}));
		}
	}).send();
};

dashboard.methods.declareInitialConfig = function() {
	return {
		"targetURL": this._assembleTargetURL(),
	};
};

dashboard.methods._prepareECL = function(items) {
	var self = this;

	var instructions = {
		"targetURL": function(item) {
			item.config = $.extend({
				"instanceName": self.config.get("instance.name"),
				"domains": self.config.get("domains"),
				"apiToken": self.config.get("dataserverToken"),
				"valueHandler": function() {
					return self._assembleTargetURL();
				}
			}, item.config);
			return item;
		}
	};

	return (function traverse(items, path) {
		return $.map(items, function(item) {
			var _path = path ? path + "." + item.name : item.name;
			if (item.type === "object" && item.items) {
				item.items = traverse(item.items, _path);
			} else if (instructions[_path]) {
				item = instructions[_path](item);
			}
			return item;
		});
	})(items, "");
};

dashboard.methods._fetchDataServerToken = function(callback) {
	var self = this;
	Echo.AppServer.API.request({
		"endpoint": "customer/{id}/subscriptions",
		"id": self.config.get("data.customer").id,
		"onData": function(response) {
			var token = Echo.Utils.foldl("", response, function(subscription, acc) {
				return subscription.product.name === "dataserver"
					? subscription.extra.token
					: acc;
			});
			if (token) {
				self.config.set("dataserverToken", token);
				callback.call(self);
			} else {
				self._displayError(
					self.labels.get("failedToFetchToken", {
						"reason": self.labels.get("dataserverSubscriptionNotFound")
					})
				);
			}
		},
		"onError": function(response) {
			self._displayError(self.labels.get("failedToFetchToken", {"reason": response.data.msg}));
		}
	}).send();
};

dashboard.methods._displayError = function(message) {
	this.showMessage({
		"type": "error",
		"message": message,
		"target": this.config.get("target")
	});
	this.ready();
};

dashboard.methods._assembleTargetURL = function() {
	var domain = this.config.get("domains")[0];
	var targetURL = "";
	if (domain && domain.length) { //TODO: check domain
		targetURL =  "http://" + domain + "/data/official/cms/";
	}

	return targetURL;
};



dashboard.renderers.container = function(element) {
	var self = this;
	new Echo.AppServer.Controls.Configurator({
		"target": element,
		"cdnBaseURL": this.config.get("cdnBaseURL"),
		"context": this.config.get("context"),
		"spec": {
			"items": this.config.get("ecl")
		}
	});
/*	element.empty();
	$.map(settings, function(setting) {
		var view = self.view.fork();
		element.append(view.render({
			"template": dashboard.templates.setting,
			"data": {
				"title": setting.title,
				"value": setting.value
			}
		}));
		setting.show && setting.show(view);
	});*/
	return element;
};

dashboard.css =
	'.{class:container} { margin: 15px; }' +
	'.{class:setting} { font: 13px/18px Arial; margin-bottom: 10px; }' +
	'.{class:settingTitle} { float: left; width: 130px; text-align: right; }' +
	'.{class:settingValue} { float: left; padding-left: 10px; font-style: italic; }' +
	'.{class:statusOn} { color: #00CF00; font-weight: bold; }' +
	'.{class:statusOff} { color: red; font-weight: bold; }';

Echo.AppServer.Dashboard.create(dashboard);

})(Echo.jQuery);
