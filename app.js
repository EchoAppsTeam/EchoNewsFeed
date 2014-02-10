(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.App.isDefined("Echo.Apps.NewsFeed")) return;

var newsFeed = Echo.App.manifest("Echo.Apps.NewsFeed");

newsFeed.config = {
	"tabs": {
		"official": {
			"enabled": true,
			"label": "Official"
		}
	},
	"content": {
		"section": "local",
		"tags": "",
		"officialSources":""
	},
	"presentation": {
		"displayUsernames": false,
		"displayAvatars": false
	},
	"replies": {
		"displayTweets": false,
		"displayNativeReplies": "all"
	},
	"dependencies": {
		"Janrain": {
			"appId": undefined
		},
		"StreamServer": {
			"appkey": undefined
		}
	},
	"postComposerActivatingTabs": [
		"all"
	],
	"advanced": {}
};

newsFeed.vars = {
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
	"queries": undefined
};

newsFeed.dependencies = [{
	"url": "{config:cdnBaseURL.sdk}/gui.pack.css"
}, {
	"url": "//cdn.echoenabled.com/apps/echo/conversations/v1.3/app.js",
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

newsFeed.renderers.postsTabs = function(element, extra) {
	var self = this;
	var tpls = this.templates.tabs;
	var tabs = this._initContentTabs();
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
				"plugins": [{
					"name": "CardUITuner",
					"presentation": {
						"displayUsernames": this.config.get("presentation.displayUsernames"),
						"displayAvatars": this.config.get("presentation.displayAvatars")
					}
				}],
				"visible": true
			},
			"dependencies": this.config.get("dependencies")
		}, this.config.get("advanced"))
	});
	return element;
};

newsFeed.methods._initContentTabs = function() {
	var tabs = this.config.get("tabs");
	var result = [];
	$.map(this.get("contentTabs"), function(tab) {
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
};

newsFeed.methods._getQueryByActiveTabId = function(activeTabId) {
	var queries = this.get("queries");
	if (!queries) {
		queries = this._formatQueries();
	}
	if (queries[activeTabId]) {
		return queries[activeTabId];
	} else {
		return queries.official;
	}
};

newsFeed.methods._formatQueries = function() {
	var contentParams = this.config.get("content");
	var commonQueryParts = [];

	if (contentParams.section && contentParams.section.toLowerCase() !== "local") {
		commonQueryParts.push("childrenof:" + contentParams.section);
	} else {
		var pageURL = $("link[rel='canonical']").attr('href');
		if(!pageURL || !Echo.Utils.parseURL(pageURL).domain) {
			pageURL =  document.location.href.split("#")[0];
		}
		commonQueryParts.push("childrenof:" + pageURL);
	}
	if (contentParams.officialSources && contentParams.officialSources.length > 0) {
		var sources = $.map(contentParams.officialSources.replace(" ", "").split(","), function(item) {
			return Echo.Utils.capitalize(item);
		});
		commonQueryParts.push("source:" + sources.join(","));
	}
	if (contentParams.tags && contentParams.tags.length > 0) {
		commonQueryParts.push("tags:" + contentParams.tags.toLowerCase().replace(" ", ""));
	}

	commonQueryParts.push("-state:ModeratorDeleted");
	var displayTweets = this.config.get("replies.displayTweets") || false;
	var nativeSubmissionsMode = this.config.get("replies.displayNativeReplies") || "all";

	commonQueryParts.push(this._formatChildrenQueryPart(displayTweets, nativeSubmissionsMode));
	commonQueryParts.push("safeHTML:permissive");

	return {
		"official": commonQueryParts.join(" "),
		"top": commonQueryParts.join(" "),
		"all": commonQueryParts.join(" ")
	};
};

newsFeed.methods._formatChildrenQueryPart = function(displayTweets, nativeSubmissionsMode) {
	var childrenQueryPart = "children:2 -state:ModeratorDeleted";
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
	return childrenQueryPart;
};

newsFeed.css =
	'.{class:postsTabs} ul.nav { width: 100%; margin:0; }' +
	'.{class:postsTabs} ul.nav li { display: table-cell; width: 1%; float: none; }' +
	'.{class:postsTabs} ul.nav li a { text-align: center; border: 1px solid #CCC6C6; border-left: 0px; border-radius: 0px; margin: 2px 0px 2px 0px; }' +
	'.{class:postsTabs} ul.nav li:first-child a { border-left: 1px solid #CCC6C6; }' +
	'.{class:newsFeed} .echo-apps-conversations-streamHeader { display: none; }';

Echo.App.create(newsFeed);

})(Echo.jQuery);
