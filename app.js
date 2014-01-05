(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.App.isDefined("Echo.Apps.NewsFeed")) return;

var newsFeed = Echo.App.manifest("Echo.Apps.NewsFeed");

newsFeed.config = {
	"targetURL": "",
	"tabs": [{
		"id": "topPosts",
		"active": true,
		"visible": true,
		"type": "tab",
		"label": "Official"
	}, {
		"id": "topPosts",
		"active": false,
		"visible": true,
		"type": "tab",
		"label": "Top Contributors"
	}, {
		"id": "allPosts",
		"active": false,
		"visible": true,
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
	"advanced": {}
};

newsFeed.dependencies = [{
	"url": "//cdn.echoenabled.com/apps/echo/conversations/app.js",
	"control": "Echo.Apps.Conversations"
}, {
	"url": "{config:cdnBaseURL.sdk}/streamserver.pack.js",
	"control": "Echo.StreamServer.Controls.Stream"
}, {
	"url": "{config:cdnBaseURL.sdk}/gui.pack.css"
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
	var tpls = this.templates.tabs;
	var tabs = this.config.get("tabs");
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
		"config": $.extend(true, {
			"target": element,
			"targetURL": this.config.get("targetURL"),
			"topPosts": {
				"queryOverride": topQuery,
				"visible": true
			},
			"allPosts": {
				"queryOverride": allQuery,
				"visible": false
			},
			"dependencies": this.config.get("dependencies")
		}, this.config.get("advanced"))
	});
	return element;
}

newsFeed.css =
	'.{class:postsTabs} .nav-pills { width: 100%; margin:0; }' +
	'.{class:postsTabs} .nav li { display: table-cell; width: 1%; float: none; }' +
	'.{class:postsTabs} .nav li a { text-align: center; border: 1px solid #CCC6C6; border-left: 0px; border-radius: 0px; margin: 2px 0px 2px 0px; }' +
	'.{class:postsTabs} .nav li:first-child a { border-left: 1px solid #CCC6C6; }' +
	'.{class:newsFeed} .echo-apps-conversations-streamHeader { display: none; }';

Echo.App.create(newsFeed);

})(Echo.jQuery);
