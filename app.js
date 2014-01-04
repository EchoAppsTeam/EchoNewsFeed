(function($) {
"use strict";

if (Echo.App.isDefined("Echo.Apps.NewsFeed")) return;

var newsFeed = Echo.App.manifest("Echo.Apps.NewsFeed");

newsFeed.config = {
	"targetURL": "",
	"dependencies": {
		"Janrain": {
			"appId": undefined
		},
		"StreamServer": {
			"appkey": undefined,
		}
	}
};

newsFeed.dependencies = [{
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
		'<a href="#{data:tabId}" id="{data:tabId}" data-toggle="{data:type}" >"{data:label}"</a>' +
	'</li>';

newsFeed.renderers.postsTabs = function(element, extra) {
	var self = this;
	var tpls = newsFeed.templates.tabs;
	var tabs = [{
		"id": "topPosts",
		"active": true,
		"type": "tab",
		"label": "Official"
	}, {
		"id": "topPosts",
		"active": false,
		"type": "tab",
		"label": "Top Contributors"
	}, {
		"id": "allPosts",
		"active": false,
		"type": "tab",
		"label": "All Contributors"
	}];
	var nav = $(this.substitute({"template": tpls.nav}));
	$.map(tabs, function(tab) {
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
			$.map($("li.active a[data-toggle=tab]"), function(elem) {
				conversationsStream.config.set(elem.id + ".visible", false);
			});
			var conversationsStream = self.getComponent("Conversations");
			conversationsStream.config.set(e.target.id + ".visible", true);
			conversationsStream.refresh();
		});
		nav.append(container);
	});
	return element.empty().append(nav);
};

newsFeed.renderers.newsFeed = function(element) {
	var targetURL = this.config.get("targetURL");
	var topQuery = "childrenof:" + targetURL + " sortOrder:reverseChronological itemsPerPage:5 (user.markers:Conversations.TopContributor OR markers:Conversations.TopPost) -markers:Conversations.RemovedFromTopPosts type:comment,note -state:ModeratorDeleted children:2 -state:ModeratorDeleted";
	var allQuery = "childrenof:" + targetURL + " sortOrder:reverseChronological itemsPerPage:15 type:comment,note (state:Untouched,ModeratorApproved OR (user.roles:moderator,administrator AND -state:ModeratorDeleted)) children:2 (state:Untouched,ModeratorApproved OR (user.roles:moderator,administrator AND -state:ModeratorDeleted))";
	this.initComponent({
		"id": "Conversations",
		"component": "Echo.Apps.Conversations",
		"config": {
			"target": element,
			"targetURL": this.config.get("targetURL"),
			"auth": {
				"allowAnonymousSubmission": false
			},
			"postComposer": {
				"visible": true,
				"resolveURLs": true
			},
			"topPosts": {
				"visible": true,
				"queryOverride": topQuery,
				"resolveURLs": true
			},
			"allPosts": {
				"visible": false,
				"queryOverride": allQuery,
				"resolveURLs": true
			},
			"dependencies": this.config.get("dependencies")
		}
	});
	return element;
}
newsFeed.css =
	'.{class:newsFeed} .echo-apps-conversations-streamHeader { display: none; }';
Echo.App.create(newsFeed);

})(Echo.jQuery);
