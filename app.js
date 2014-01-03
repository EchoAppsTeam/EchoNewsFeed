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
		'<div class="active {class:newsFeed}"></div>' +
	'</div>';

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
				"visible": true
			},
			"topPosts": {
				"queryOverride": topQuery
			},
			"allPosts": {
				"queryOverride": allQuery
			},
			"dependencies": this.config.get("dependencies")
		}
	});
	return element;
}

Echo.App.create(newsFeed);

})(Echo.jQuery);
