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
	"url": "{config:cdnBaseURL.apps.dataserver}/full.pack.js",
	"control": "Echo.DataServer.Controls.Pack"
}, {
	"url": "http://cdn.echoenabled.com/apps/echo/media-gallery/dashboard/data-source.js",
	"control": "Echo.Apps.MediaGallery.InstanceDataSource"
}];

dashboard.vars = {
	"baseStreamECL": [{
		"component": "Checkbox",
		"name": "visible",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Visible",
			"desc": "If enabled, the {data:title} stream is displayed"
		}
	}, {
		"component": "Input",
		"name": "label",
		"type": "string",
		"default": "{data:title}",
		"config": {
			"title": "Label",
			"desc": "Specifies a label to display above the {data:title} stream"
		}
	}, {
		"component": "Textarea",
		"name": "queryOverride",
		"type": "string",
		"config": {
			"title": "Query Override",
			"desc": "Specifies an Echo StreamServer Search Query to replace the the Query generated by the App for {data:title}. Typically used by advanced users/developers at run-time",
			"data": {"sample": "childrenof:{data:targetURL} type:comment state:Untouched,ModeratorApproved children:2"}
		}
	}, {
		"component": "Input",
		"name": "initialItemsPerPage",
		"type": "number",
		"default": 15,
		"config": {
			"title": "Initial Items Per Page",
			"desc": "Specifies the initial number of posts to show when the stream loads"
		}
	}, {
		"component": "Select",
		"name": "initialSortOrder",
		"type": "string",
		"default": "reverseChronological",
		"config": {
			"title": "Initial Sort Order",
			"desc": "Specifies the initial ordering of posts in this stream",
			"options": [{
				"title": "Newest First",
				"value": "reverseChronological"
			}, {
				"title": "Oldest First",
				"value": "chronological"
			}, {
				"title": "Most Popular",
				"value": "repliesDescending"
			}, {
				"title": "Most Likes",
				"value": "likesDescending"
			}]
		}
	}, {
		"component": "Checkbox",
		"name": "displaySortOrderPulldown",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Sort Order Pulldown",
			"desc": "If enabled, displays a Sort Order pulldown to end-users, allowing them to change posts sorting order."
		}
	}, {
		"component": "Checkbox",
		"name": "displayCounter",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Counter",
			"desc": "If enabled, a total count of posts in this stream is displayed to users"
		}
	}, {
		"component": "Checkbox",
		"name": "displayTopPostHighlight",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display TopPost Highlight",
			"desc": "If enabled, a visual indicator is used to indicate a Top Post"
		}
	}, {
		"component": "Checkbox",
		"name": "displaySharingIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Sharing Intent",
			"desc": "If enabled, users are offered the option to share each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displayLikeIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Like Intent",
			"desc": "If enabled, users are offered the option to like each post"
		}
	}, {
		"component": "Checkbox",
		"name": "displayReplyIntent",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Display Reply Intent",
			"desc": "If enabled, users are offered the option to reply to each post"
		}
	}, {
		"component": "Select",
		"name": "replyNestingLevels",
		"type": "number",
		"default": 2,
		"config": {
			"title": "Reply Nesting Levels",
			"desc": "Specifies the depth of replies allowed in the conversation thread",
			"options": $.map([1,2,3,4,5], function(i) {
				return {
					"title": i + "",
					"value": i
				};
			})
		}
	}, {
		"component": "Group",
		"name": "moderation",
		"type": "object",
		"config": {
			"title": "Moderation"
		},
		"items": [{
			"component": "Checkbox",
			"name": "displayCommunityFlaggedPosts",
			"default": false,
			"config": {
				"title": "Display Community Flagged Posts"
			}
		}, {
			"component": "Checkbox",
			"name": "displaySystemFlaggedPosts",
			"default": false,
			"config": {
				"title": "Display System Flagged Posts"
			}
		}]
	}, {
		"component": "Input",
		"name": "noPostsMessage",
		"type": "string",
		"default": "There are no posts yet.<br>Be the first to chime in!",
		"config": {
			"title": "No Posts Message",
			"desc": "Specifies the message shown to users when the are no posts to show"
		}
	}],
	"baseComposerECL": [{
		"component": "Checkbox",
		"name": "visible",
		"type": "boolean",
		"default": true,
		"config": {
			"title": "Visible",
			"desc": "If enabled, the composer will be displayed to end users"
		}
	}, {
		"component": "Checkbox",
		"name": "displaySharingOnPost",
		"type": "boolean",
		"default": "true",
		"config": {
			"title": "Display Sharing on Post",
			"desc": "If enabled, users will be given the option to share their Posts on submit"
		}
	}, {
		"component": "Group",
		"name": "contentTypes",
		"type": "object",
		"config": {
			"title": "Content Types"
		},
		"items": [{
			"component": "Group",
			"name": "comments",
			"type": "object",
			"config": {
				"title": "Comments"
			},
			"items": [{
				"component": "Checkbox",
				"name": "visible",
				"type": "boolean",
				"default": true,
				"config": {
					"title": "Visible",
					"desc": "If enabled, users can submit Comments"
				}
			}, {
				"component": "Input",
				"name": "prompt",
				"type": "string",
				"default": "What's on your mind?",
				"config": {
					"title": "Prompt",
					"desc": "Specifies the ghost text displayed in the Comment Prompt"
				}
			}, {
				"component": "Input",
				"name": "confirmationMessage",
				"type": "string",
				"default": "Thanks, your post has been submitted for review",
				"config": {
					"title": "Confirmation message",
					"desc": "Specifies the confirmation message text displayed after successful submission if pre-moderation mode is enabled"
				}
			}, {
				"component": "Checkbox",
				"name": "resolveURLs",
				"type": "boolean",
				"default": true,
				"config": {
					"title": "Resolve URLs",
					"desc": "If enabled, resolves URLs found in the comment body to rich attached content"
				}
			}]
		}]
	}],
	"premoderationECL": [{
		"component": "Group",
		"name": "premoderation",
		"type": "object",
		"config": {
			"title": "Pre-moderation"
		},
		"items": [{
			"component": "Checkbox",
			"name": "enable",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Enable",
				"desc": "If True, Posts from general users need to be manually Approved by a Moderator or Admin before being displayed to general users"
			}
		}, {
			"component": "Checkbox",
			"name": "approvedUserBypass",
			"type": "boolean",
			"default": true,
			"config": {
				"title": "Approved User Bypass",
				"desc": "If True, Users marked as ‘Approved’ bypass the Pre-moderation process, reducing unnecessary moderation overhead. Users who have 3 or more Posts approved are automatically marked as Approved Users"
			}
		}]
	}]
};


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
	}]
}, {
	"component": "Group",
	"name": "advanced",
	"type": "object",
	"config": {
		"title": "Advanced"
	},
	"items": [{
		"component": "Checkbox",
		"name": "bozoFilter",
		"type": "boolean",
		"config": {
			"title": "Enable Bozo Filter",
			"desc": "If enabled, ensures that users see their own post irrespective of the moderation state of that post"
		}
	}, {
		"component": "Group",
		"name": "postComposer",
		"type": "object",
		"config": {
			"title": "Post Composer"
		}
	}, {
		"component": "Group",
		"name": "replyComposer",
		"type": "object",
		"config": {
			"title": "Reply Composer"
		}
	}, {
		"component": "Group",
		"name": "topPosts",
		"type": "object",
		"config": {
			"title": "Top Posts"
		}
	}, {
		"component": "Group",
		"name": "allPosts",
		"type": "object",
		"config": {
			"title": "All Posts"
		}
	}, {
		"component": "Group",
		"name": "auth",
		"type": "object",
		"config": {
			"title": "Authentication"
		},
		"items": [{
			"component": "Checkbox",
			"name": "allowAnonymousSubmission",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Allow anonymous submission",
				"desc": "Allow users to post without logging in"
			}
		}, {
			"component": "Checkbox",
			"name": "enableBundledIdentity",
			"type": "boolean",
			"default": true,
			"config": {
				"title": "Bundled Login and Sharing",
				"desc": "If set to false, the bundled Janrain Login and Sharing functionality is disabled along with related identity features"
			}
		}, {
			"component": "Checkbox",
			"name": "hideLoginButtons",
			"type": "boolean",
			"default": false,
			"config": {
				"title": "Hide Login Buttons"
			}
		}]
	}]
}];

// TODO: get rid of this heavy normalization process
dashboard.config.normalizer = {
	"ecl": function(obj, component) {
		var assembleBaseECL = function() {
			var self = this;
			return $.map(component.get("baseStreamECL"), function(value) {
				var overrides = {};
				$.map(["config.desc", "config.title", "default"], function(key) {
					var val = Echo.Utils.get(value, key);
					if (val && typeof val === "string") {
						Echo.Utils.set(overrides, key, component.substitute({
							"template": val,
							"data": self.config
						}));
					}
				});
				return $.extend(true, {}, value, overrides);
			});
		};

		var handle = function(item) {
			var itemHandlers = {
				"topPosts": function() {
					var items = assembleBaseECL.call(this);
					items[3]["default"] = 5; // override initialItemsPerPage value
					items[12]["items"][0]["default"] = true;
					items[12]["items"][1]["default"] = true;
					items.pop();
					items.splice(5, 0, {
						"component": "Checkbox",
						"name": "includeTopContributors",
						"type": "boolean",
						"default": true,
						"config": {
							"title": "Include Top Contributors",
							"desc": "If True, Posts from users marked as ‘Top Contributors’ are automatically " +
								"included in the Top Posts stream unless manually removed"
						}
					});
					this["items"] = items;
					return this;
				},
				"allPosts": function() {
					var items = assembleBaseECL.call(this);
					items[12]["items"].push(component.get("premoderationECL"));
					items.splice(11, 0, {
						"component": "Checkbox",
						"name": "displayCommunityFlagIntent",
						"type": "boolean",
						"default": true,
						"config": {
							"title": "Display Community Flag Intent",
							"desc": "If enabled, users are offered the option to flag a post as inappropriate"
						}
					});
					this["items"] = items;
					return this;
				},
				"postComposer": function() {
					this["items"] = [].concat(component.get("baseComposerECL"));
					return this;
				},
				"replyComposer": function() {
					this["items"] = [].concat(component.get("baseComposerECL"));
					this["items"].splice(2, 0, {
						"component": "Checkbox",
						"name": "displayCompactForm",
						"type": "boolean",
						"default": true,
						"config": {
							"title": "Display Compact Form",
							"desc": "If enabled, compact form is displayed below each top-level post"
						}
					});
					return this;
				}
			};
			return $.isFunction(itemHandlers[item.name])
				? itemHandlers[item.name].call(item) : item;
		};

		return $.map(obj, function(field) {
			return field.name !== "advanced"
				? field
				: $.extend({}, field, {
					"items": $.map(field.items || {}, function(item) {
						return handle(item);
					})
				})
		});
	}
};


dashboard.init = function() {
	var self = this, parent = $.proxy(this.parent, this);
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
	this.parent(data);
}

dashboard.methods._assembleTargetURL = function() {
	var domain = this.config.get("domains")[0];
	var targetURL = "";
	if (domain && domain.length) { //TODO: check domain
		targetURL =  "http://" + domain + "/data/official/cms/";
	}

	return targetURL;
};

Echo.AppServer.Dashboard.create(dashboard);

})(Echo.jQuery);
