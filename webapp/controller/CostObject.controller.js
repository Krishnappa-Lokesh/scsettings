/*global location */
sap.ui.define([
	"scsetting/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"scsetting/model/formatter"
], function(BaseController, JSONModel, formatter) {
	"use strict";
	return BaseController.extend("scsetting.controller.CostObject", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});
			// "object" -> this needs to be changed to "Personal settings"
			// and add "delivery address" etc for other views
			this.getRouter().getRoute("costObject").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "costObjectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			
			// Register Message manager
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 *@memberOf scsetting.controller.CostObject
		 */
		buttonPressed: function(oEvent) {
			var oSource = oEvent.getSource();
			var btnId = oSource.getId();
			var sName = btnId.substr(btnId.search("btn"));

			var oView = this.getView();
			var sPath = oView.getElementBinding().getPath().substring(1);

			var costObjectLists = {
				"btnCCList": "ccList",
				"btnIOList": "ioList",
				"btnWBSList": "wbsList"
			};

			this.getRouter().navTo( costObjectLists[sName], {
					mainContext: sPath
				});
		},
		
		onRadioBtnSelected: function(oEvent) {
			var oSource = oEvent.getSource();
			var oBtn = oSource.getSelectedButton();
			var sBtn = oBtn.getId();
			var sBtnId = sBtn.substr(sBtn.search("rBtn"));
			var dRadioButtons = {
				 "rBtnCostCenter" : "CC",
				 "rBtnInternalOrder" : "OR" ,
				 "rBtnWbsElement" : "WBS",
				 "rBtnAsset" : "AS"
			};
			
			var sPath = this.getView().getBindingContext().sPath;
			var oModel = this.getOwnerComponent().getModel();
			oModel.setProperty(sPath+"/ZaaType", dRadioButtons[ sBtnId ] );
			
		},
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = this.getModel("costObjectView");
			sap.m.URLHelper.triggerEmail(null, oViewModel.getProperty("/shareSendEmailSubject"), oViewModel.getProperty(
				"/shareSendEmailMessage"));
		},
		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("costObjectView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},
		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */
		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("personal_settingsSet", {
						Slcd :  "001",
						Userid : sObjectId 
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function(sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("costObjectView");
			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}
			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Userid,
				sObjectName = oObject.Userid,
				oViewModel = this.getModel("costObjectView");
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject", oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage", oResourceBundle.getText("shareSendEmailObjectMessage", [
				sObjectName,
				sObjectId,
				location.href
			]));
		},
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("costObjectView");
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		}
	});
});;