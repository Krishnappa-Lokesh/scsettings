jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 personal_settingsSet in the list

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
		"scsetting/test/integration/MasterJourney",
		"scsetting/test/integration/NavigationJourney",
		"scsetting/test/integration/NotFoundJourney",
		"scsetting/test/integration/BusyJourney",
		"scsetting/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});