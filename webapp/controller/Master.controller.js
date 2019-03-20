/*global history */
sap.ui.define([
	"scsetting/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"scsetting/model/formatter"
], function (BaseController,
	MessageToast,
	JSONModel,
	History,
	Filter,
	FilterOperator,
	GroupHeaderListItem,
	Device,
	formatter) {
	"use strict";

	return BaseController.extend("scsetting.controller.Master", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function () {
			// Control state model
			var oList = this.byId("list"),
				oViewModel = this._createViewModel(),
				// Put down master list's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the master list is
				// taken care of by the master list itself.
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();

			this._oList = oList;

			this.setModel(oViewModel, "masterView");
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)

			this.getView().addEventDelegate({
				onBeforeFirstShow: function () {
					this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
				}.bind(this)
			});

			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);


			// Dialog to confirm changes
			var oDialog = new sap.m.Dialog(
					//"dialogSaveConfirm", 
					{
						state : sap.ui.core.ValueState.None,
						title : "Confirmation",
						content : [
									new sap.m.Text({
											text : "Save Changes ?"
										})
									],
						type : sap.m.DialogType.Message,
						beginButton : new sap.m.Button({ 
								text: "Save",
								press: function () {
									oDialog.close();
									}
							}),
						endButton : new sap.m.Button({ 
								text: "Cancel",
								press: function () {
									oDialog.close();
									}
							})


					}

			);


			oDialog.attachAfterClose(this.dialogBtnPressed, this);

			this._oDialog = oDialog;

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange: function (oEvent) {
			// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_createViewModel: function () {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount"),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "id",
				groupBy: "None"
			});
		},

		/**
		 * If the master route was hit (empty hash) we have to set
		 * the hash to to the first item in the list as soon as the
		 * listLoading is done and the first item in the list is known
		 * @private
		 */
		_onMasterMatched: function () {
			this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
				function (mParams) {
					if (mParams.list.getMode() === "None") {
						return;
					}

					//this.getRouter().navTo("object", true);
					//var sObjectId = mParams.firstListitem.getBindingContext().getProperty("Slcd");
					var sObjectId = mParams.firstListitem.getBindingContext().getProperty("Userid");
					var bNotPhoneDisplayDetail = !Device.system.phone;

					this.getRouter().navTo("object", {
						objectId: sObjectId
					}, bNotPhoneDisplayDetail);
				}.bind(this),

				function (mParams) {
					if (mParams.error) {
						return;
					}
					this.getRouter().getTargets().display("detailNoObjectsAvailable");
				}.bind(this)
			);
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function (oItem) {

			var viewNames = {
				"001": "object",
				"002": "deliveryAdrs",
				"003": "plant",
				"004": "costObject",
				"005": "glAccount",
				"006": "category"
			};

			var bNotPhoneDisplayDetail = !Device.system.phone;
			//var oBindingContext = oItem.getBindingContext("localModelmasterItems");
			var oBindingContext = oItem.getBindingContext();
			//var selectedViewId = oBindingContext.getProperty("id");
			var selectedViewId = oBindingContext.getProperty("Slcd");
			var sUserId = oBindingContext.getProperty("Userid");

			this.getRouter().navTo(
				viewNames[selectedViewId], {
					objectId: sUserId
				},
				bNotPhoneDisplayDetail
			);

			//Enable Save button 
			this.byId("saveButton").setEnabled(true);

		}/*,
		onSave: function (oEvent) {

			//Disable Save button to avoid multiple press by user
			var oSaveButton = oEvent.getSource();
			oSaveButton.setEnabled(false);

			var oModel = this.getModel();
			if (!oModel.hasPendingChanges()) {

			};

			// Save data
			this.getModel().submitChanges({
				// Success Message
				success: function () {
					MessageToast.show("Data is saved!", {
						duration: 3000, // default
						width: "15em", // default
						my: sap.ui.core.Popup.Dock.CenterCenter,
						at: sap.ui.core.Popup.Dock.CenterCenter,
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: false, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});
				}
			}, {
				//Error Message
				error: function () {
					MessageToast.show("Error updating record");
				}
			});

		}*/,

		onCancel: function () {

			var oModel = this.getModel();
			if (oModel.hasPendingChanges()) {
				oModel.resetChanges();
				oModel.refresh();
				//this._oDialog.open();

				
			}
		},
		dialogBtnPressed: function (oEvent) {
			var oSource = oEvent.getSource();
			this.onSave();
			//if oSource.getId() = "leftDialogButton";

		},

		onExit: function() {
			// TODO: Need to code for saving changes
			var oModel = this.getOwnerComponent().getModel();
			if (oModel.hasPendingChanges()) {
				//this._oDialog.open();

			}

		}
	});

});