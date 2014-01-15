(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.App.isDefined("Echo.Apps.NewsFeed")) return;

var newsFeed = Echo.App.manifest("Echo.Apps.NewsFeed");

newsFeed.config = {
	"contentTabs": [{
		"id": "official",
		"active": true,
		"visible": true,
		"type": "tab",
		"label": "Official"
	}, {
		"id": "top",
		"active": false,
		"visible": false,
		"type": "tab",
		"label": "Top Contributors"
	}, {
		"id": "all",
		"active": false,
		"visible": false,
		"type": "tab",
		"label": "All Contributors"
	}],
	"dependencies": {
		"Janrain": {
			"appId": undefined
		},
		"StreamServer": {
			"appkey": undefined,
		}
	},
	"queries": {},
	"postComposerActivatingTabs": [
		"all"
	],
	"advanced": {}
};

newsFeed.dependencies = [{
	"url": "{config:cdnBaseURL.sdk}/gui.pack.css"
}, {
	"url": "//cdn.echoenabled.com/apps/echo/conversations/app.js",
	"control": "Echo.Apps.Conversations"
}, {
	"url": "{config:cdnBaseURL.sdk}/streamserver.pack.js",
	"control": "Echo.StreamServer.Controls.Stream"
}];

newsFeed.templates.main =
	'<div class="{class:container}">' +
		'<div class="{class:postsTabs}"></div>' +
		'<div class="active {class:newsFeed}"></div>' +
	'</div>';

newsFeed.templates.tabs = {};

newsFeed.templates.tabs.nav =
	'<ul class="nav nav-pills">';

newsFeed.templates.tabs.navItem =
	'<li class="{data:class}" >' +
		'<a href="#{data:tabId}" id="{data:tabId}" data-toggle="{data:type}" >{data:label}</a>' +
	'</li>';

newsFeed.config.normalizer = {
	"contentTabs": function(obj, component) {
		var tabs = component.config.tabs;
		var result = [];
		$.map(obj, function(tab) {
			if (tabs && tabs[tab.id]) {
				if (tabs[tab.id] && tabs[tab.id].enabled === false) {
					tab.visible = false;
				}
				if (tabs[tab.id] && tabs[tab.id].label) {
					tab.label = tabs[tab.id].label;
				}
			}
			result.push(tab);
		});
		return result;
	},
	"queries": function(obj, component) {
		if (component.config.content) {
			var tags = component.config.content.tags;
			var sources = component.config.content.officialSources;
			var section = component.config.content.section;
		}
		var targetURL = component.config.targetURL;
		var commonQueryParts = [];
		var queries = {"all": [], "top": [], "official": []};
		if (section && section.toLowerCase() !== "local") {
			commonQueryParts.push("childrenof:" + section);
		} else {
			var pageURL = $("link[rel='canonical']").attr('href');
			if(!pageURL || !Echo.Utils.parseURL(pageURL).domain) {
				pageURL =  document.location.href.split("#")[0];
			}
			commonQueryParts.push("childrenof:" + pageURL);
		}
		if (sources && typeof sources === "string" && sources.length > 0) {
			commonQueryParts.push("source:" + sources.replace(" ", ""));
		}
		if (tags && typeof tags === "string" && tags.length > 0) {
			commonQueryParts.push("tags:" + tags.toLowerCase().replace(" ", ""));
		}
		var displayTweets =  component.get("config.replies.displayTweets") || false;
		var nativeSubmissionsMode = component.get("config.replies.displayNativeReplies") || "all";
		commonQueryParts.push("-state:ModeratorDeleted ");
		var childrenQueryPart = "children:2 -state:ModeratorDeleted";
		var excludedSources = [];
		if (nativeSubmissionsMode === "none") {
			if (!displayTweets) {
				childrenQueryPart = "children:0";
			} else {
				childrenQueryPart += " source:Twitter";
			}
		} else if (nativeSubmissionsMode === "top") {
			if (!displayTweets) {
				childrenQueryPart += " -source:Twitter";
			} else {
				childrenQueryPart += " source:Twitter";
			}
			childrenQueryPart += " OR (user.markers:Conversations.TopContributor OR markers:Conversations.TopPost)";
		} else if (nativeSubmissionsMode === "all") {
			if (!displayTweets) {
				childrenQueryPart += " -source:Twitter";
			}
		}
		commonQueryParts.push(childrenQueryPart);
		commonQueryParts.push("safeHTML:permissive");
		return {
			"official": commonQueryParts.join(" "),
			"top": commonQueryParts.join(" "),
			"all": commonQueryParts.join(" ")
		};
	}
};



newsFeed.renderers.postsTabs = function(element, extra) {
	var self = this;
	var tpls = this.templates.tabs;
	var tabs = this.config.get("contentTabs");
	var nav = $(this.substitute({"template": tpls.nav}));
	var visibleTabsCounter = 0;
	$.map(tabs, function(tab) {
		if (tab.visible) {
			visibleTabsCounter++;
			var container = $(self.substitute({
				"template": tpls.navItem,
				"data": {
					"tabId": tab.id,
					"type": tab.type,
					"class": tab.active ? "active": "",
					"label": tab.label
				}
			}));
			container.on('show', function (e) {
				var conversationsStream = self.getComponent("Conversations");
				conversationsStream.config.set("allPosts.queryOverride", self._getQueryByActiveTabId(e.target.id));
				//TODO: optimize it asap
				if (self.config.get("postComposerActivatingTabs").indexOf(e.target.id) >= 0) {
					conversationsStream.config.set("postComposer.visible", true);
				} else {
					conversationsStream.config.set("postComposer.visible", false);
				}
				
				conversationsStream.refresh();
			});
			nav.append(container);
		}
	});
	if (visibleTabsCounter <= 1) {
		return element.empty();
	}
	return element.empty().append(nav);
};

newsFeed.methods._getQueryByActiveTabId = function(activeTabId) {
	var queries = this.config.get("queries");
	if (queries[activeTabId]) {
		return queries[activeTabId];
	} else {
		return queries.official;
	}
}
newsFeed.renderers.newsFeed = function(element) {
	var query = this._getQueryByActiveTabId("official");
	this.initComponent({
		"id": "Conversations",
		"component": "Echo.Apps.Conversations",
		"config": $.extend(true, {
			"target": element,
			"targetURL": this.config.get("targetURL"),
			"postComposer": {
				"visible": false
			},
			"topPosts": {
				"visible": false
			},
			"allPosts": {
				"queryOverride": query,
				"displayCounter": false,
				"visible": true
			},
			"dependencies": this.config.get("dependencies")
		}, this.config.get("advanced"))
	});
	return element;
}

newsFeed.css =
	'.{class:postsTabs} ul.nav { width: 100%; margin:0; }' +
	'.{class:postsTabs} ul.nav li { display: table-cell; width: 1%; float: none; }' +
	'.{class:postsTabs} ul.nav li a { text-align: center; border: 1px solid #CCC6C6; border-left: 0px; border-radius: 0px; margin: 2px 0px 2px 0px; }' +
	'.{class:postsTabs} ul.nav li:first-child a { border-left: 1px solid #CCC6C6; }' +
	'.{class:newsFeed} .echo-apps-conversations-streamHeader { display: none; }';

Echo.App.create(newsFeed);

})(Echo.jQuery);
