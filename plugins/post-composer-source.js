(function($) {

"use strict";

var composerSource = Echo.Plugin.manifest("ComposerSource", "Echo.StreamServer.Controls.Submit");

composerSource.init = function() {};

composerSource.events = {
	"Echo.StreamServer.Controls.Submit.onPostInit": function(topic, args) {
		$.map(args.postData.content || [], function(item) {
			item.source = {"name": "NativeSubmissions"};
		});
	}
};

Echo.Plugin.create(composerSource);
})(Echo.jQuery);
