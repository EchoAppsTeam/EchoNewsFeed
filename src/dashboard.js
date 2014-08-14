(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.AppServer.Dashboard.isDefined("Echo.Apps.NewsFeed.Dashboard")) return;

var dashboard = Echo.AppServer.Dashboard.manifest("Echo.Apps.NewsFeed.Dashboard");

dashboard.inherits = Echo.Utils.getComponent("Echo.AppServer.Dashboards.AppSettings");

dashboard.labels = {
	"failedToFetchToken": "Failed to fetch customer dataserver token: {reason}"
};

dashboard.mappings = {
	"dependencies.appkey": {
		"key": "dependencies.StreamServer.appkey"
	},
	"dependencies.janrainapp": {
		"key": "dependencies.Janrain.appId"
	}
};

dashboard.dependencies = [{
	"url": "{config:cdnBaseURL.apps.appserver}/controls/configurator.js",
	"control": "Echo.AppServer.Controls.Configurator"
}, {
	"url": "//cdn.echoenabled.com/apps/echo/dataserver/v3/full.pack.js",
	"control": "Echo.DataServer.Controls.Bundle"
}];

dashboard.config = {
	"appkeys": [],
	"janrainapps": []
};

dashboard.config.ecl = [{
	"component": "Group",
	"name": "tabs",
	"type": "object",
	"config": {
		"title": "Tabs"
	},
	"items": [{
		"component": "Group",
		"name":"official",
		"type": "object",
		"config": {
			"title": "\"Official\" tab settings"
		},
		"items":[{
			"component": "Checkbox",
			"name": "enabled",
			"type": "boolean",
			"default": true,
			"config": {
				"title":"Show \"Official\" tab",
				"desc": "if enabled \"Official\" tab is availible"
			}
		}, {
			"component": "Input",
			"name": "label",
			"type": "string",
			"default": "Official",
			"config": {"title": "\"Official\" tab label"}
		}]
	}]
}, {
	"component": "Group",
	"name": "content",
	"type": "object",
	"config": {
		"title": "Content"
	},
	"items":[{
		"component": "Echo.Apps.Conversations.Dashboard.TargetSelector",
		"name": "section",
		"type": "string",
		"default": "",
		"config": {
			"title": "Section",
			"default": "",
			"data": {"sample": "http://example.com/section"},
			"defaultValueTitle": "Use local page URL",
			"customValueTitle": "Use this URL"
		}
	}, {
		"component": "Input",
		"name": "tags",
		"type": "string",
		"default": "",
		"config": {
			"title": "Tags",
			"desc": "Specifies tags to filter News Feed items",
			"data": {"sample": "CNN, politics"}
		}
	}, {
		"component": "Input",
		"name": "officialSources",
		"type": "string",
		"default": "",
		"config": {
			"title": "Official sources",
			"desc": "Specifies sources names to filter News Feed items",
			"data": {"sample": "Univision, CNN"}
		}
	}]
}, {
	"component": "Group",
	"name": "presentation",
	"type": "object",
	"config": {
		"title": "Presentation"
	},
	"items":[{
		"component": "Checkbox",
		"name": "displayUsernames",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display user names for Articles",
			"desc": "If enabled, a name of an author is displayed for all Articles in a Newsfeed."
		}
	}, {
		"component": "Checkbox",
		"name": "displayAvatars",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display user avatars for Articles",
			"desc": "If enabled, an avatar of an author is displayed for all Articles in a Newsfeed."
		}
	}]
}, {
	"component": "Group",
	"name": "replies",
	"type": "object",
	"config": {
		"title": "Replies"
	},
	"items":[{
		"component": "Checkbox",
		"name": "displayTweets",
		"type": "boolean",
		"default": false,
		"config": {
			"title": "Display Tweets"
		}
	}, {
		"component": "Select",
		"name": "displayNativeReplies",
		"type": "string",
		"default": "all",
		"config": {
			"title": "Show native replies",
			"desc": "Specifies visibility of native replies",
			"options": [{
				"title": "All replies",
				"value": "all"
			}, {
				"title": "Only top replies",
				"value": "top"
			}, {
				"title": "Do not show",
				"value": "none"
			}]
		}
	}]
}, {
	"component": "Group",
	"name": "dependencies",
	"type": "object",
	"config": {
		"title": "Dependencies"
	},
	"items": [{
		"component": "Select",
		"name": "appkey",
		"type": "string",
		"config": {
			"title": "StreamServer application key",
			"desc": "Specifies the application key for this instance",
			"options": []
		}
	}, {
		"component": "Select",
		"name": "janrainapp",
		"type": "string",
		"config": {
			"title": "Janrain application ID",
			"validators": ["required"],
			"options": []
		}
	}, {
			"component": "Fieldset",
			"name": "FilePicker",
			"type": "object",
			"items": [{
				"component": "Input",
				"name": "apiKey",
				"type": "string",
				"config": {
					"title": "FilePicker API key",
					"desc": "Specifies the Filepicker api key for this instance",
					"options": []
				}
			}]
		}, {
			"component": "Fieldset",
			"name": "embedly",
			"type": "object",
			"items": [{
				"component": "Input",
				"name": "apiKey",
				"type": "string",
				"config": {
					"title": "Embed.ly API Key"
				}
			}]
		}]
}, {
	"component": "Dashboard",
	"name": "advanced",
	"type": "object",
	"config": {
		"title": "Advanced",
		"component": "Echo.Apps.Conversations.Dashboard",
		"url": "//cdn.echoenabled.com/apps/echo/conversations/v2/dashboard.js",
		"config": {
			"disableSettings": [
				"targetURL",
				"dependencies",
				"topPosts",
				"postComposer",
				"allPosts.label",
				"allPosts.queryOverride",
				"allPosts.displaySortOrderPulldown",
				"allPosts.displayCounter"
			]
		}
	}
}];

dashboard.config.normalizer = {
	"ecl": function(obj, component) {
		var self = this;
		return $.map(obj, function(field) {
			if (field.name === "advanced") {
				field.config = $.extend(true, field.config, {
					"config": {
						"data": self.get("data"),
						"request": self.get("request")
					}
				});
			}
			return field;
		});
	}
};

dashboard.init = function() {
	var parent = $.proxy(this.parent, this);
	this._fetchCustomerDomains($.Deferred().resolve);
	this._requestData(function() {
		parent();
	});
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
	var keys = this.get("appkeys", []);
	var apps = this.get("janrainapps", []);
	return {
		"targetURL": this._assembleTargetURL(),
		"dependencies": {
			"Janrain": {
				"appId": apps.length ? apps[0].name : undefined
			},
			"StreamServer": {
				"appkey": keys.length ? keys[0].key : undefined
			},
			"FilePicker": {
				"apiKey": "AFLWUBllDRwWZl7sQO1V1z"
			},
			"embedly": {
				"apiKey": "5945901611864679a8761b0fcaa56f87"
			}
		}
	};
};

dashboard.methods.initConfigurator = function() {
	function findKey(key, ecl) {
		var found;
		$.each(ecl, function(k, item) {
			if (item.name === key) {
				found = item;
				return false;
			} else if (item.type === "object") {
				found = findKey(key, item.items);
				if (found) return false;
			}
		});
		return found;
	}

	var ecl = this.config.get("ecl");

	// populate appkey selectbox
	var appkey = findKey("appkey", ecl);
	appkey.config.options = $.map(this.get("appkeys", []), function(appkey) {
		return {
			"title": appkey.key,
			"value": appkey.key
		};
	});

	// populate janrainapp selectbox
	var janrainapp = findKey("janrainapp", ecl);
	janrainapp.config.options = $.map(this.get("janrainapps", []), function(app) {
		return {
			"title": app.name,
			"value": app.name
		};
	});
	this.parent.apply(this, arguments);
};

dashboard.methods._requestData = function(callback) {
	var self = this;
	var customerId = this.config.get("data.customer.id");
	var deferreds = [];
	var request = this.config.get("request");

	var requests = [{
		"name": "appkeys",
		"endpoint": "customer/" + customerId + "/appkeys"
	}, {
		"name": "janrainapps",
		"endpoint": "customer/" + customerId + "/janrainapps"
	}];
	$.map(requests, function(req) {
		var deferredId = deferreds.push($.Deferred()) - 1;
		request({
			"endpoint": req.endpoint,
			"success": function(response) {
				self.set(req.name, response);
				deferreds[deferredId].resolve();
			}
		});
	});
	$.when.apply($, deferreds).done(callback);
};

dashboard.methods.update = function(data) {
	if (data && data.config) {
		data.config.targetURL = this._assembleTargetURL();
	}
	this.parent.apply(this, arguments);
};

// TODO: fix this method to get targetURL from provisioning
// details as soon as this app uses endpoints mechanism
dashboard.methods._assembleTargetURL = function() {
	var domains = this.config.get("domains");
	var defaultDomain = this.config.get("data.customer.name") + ".echostudio.co";
	var domain = ~domains.indexOf(defaultDomain) ? defaultDomain : domains[0];
	return "http://" + domain + "/data/official/cms/";
};

Echo.AppServer.Dashboard.create(dashboard);

})(Echo.jQuery);
