(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.NewsFeedContentManagement.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.NewsFeedContentManagement.Dashboard");

dashboard.dependencies = [{
	"url": "//cdn.echoenabled.com/apps/echo/dataserver/v3/full.pack.js",
	"control": "Echo.DataServer.Controls.Dashboard.DataSourceGroup"
}];

dashboard.config = {
	"ecl": [{
		"component": "Echo.DataServer.Controls.Dashboard.DataSourceGroup",
		"name": "targetURL",
		"type": "string",
		"required": true,
		"config": {
			"title": "",
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
	"password": "Password",
	"dataserverBundleName": "Echo {appTitle} Auto-Generated Bundle"
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
	var self = this;
	var deferreds = [$.Deferred(), $.Deferred()];
	this._fetchCustomerDomains(deferreds[0].resolve);
	$.when.apply($, deferreds).done(function() {
			var ecl = self._prepareECL(self.config.get("ecl"));
			self.config.set("ecl", ecl);
			self.render.call(self);
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
		"targetURL": this._assembleTargetURL()
	};
};

dashboard.methods._prepareECL = function(items) {
	var self = this;

	var instructions = {
		"targetURL": function(item) {
			item.config = $.extend({
				"domains": self.config.get("domains"),
				"apiToken": self.config.get("dataserverToken"),
				"valueHandler": function() {
					return self._assembleTargetURL();
				},
				"labels": {
					"dataserverBundleName": self.labels.get("dataserverBundleName", {"appTitle": self.get("data.app.title")}),
					"title": "Editorial content firehose sources"
				},
				"bundle": {
					"input": {
						"data": {"rules": ["resolve-urls"]}
					}
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
	if (domain && domain.length) {
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
		},
		"ready": function() {
			self.ready.call(self);
		}
	});
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
