jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"scsetting/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"scsetting/test/integration/pages/App",
	"scsetting/test/integration/pages/Browser",
	"scsetting/test/integration/pages/Master",
	"scsetting/test/integration/pages/Detail",
	"scsetting/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "scsetting.view."
	});

	sap.ui.require([
		"scsetting/test/integration/NavigationJourneyPhone",
		"scsetting/test/integration/NotFoundJourneyPhone",
		"scsetting/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});