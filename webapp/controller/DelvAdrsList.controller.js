sap.ui.define([
		"scsetting/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"scsetting/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("scsetting.controller.DelvAdrsList", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");

				this.getRouter().getRoute("delvAdrsList").attachPatternMatched(this._onObjectMatched, this);


				// Put down worklist table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				this._oTableSearchState = [];

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					saveAsTileTitle: this.getResourceBundle().getText("delvAdrsListViewTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("delvAdrsListViewTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0,
					mainContext : ""
				});
				this.setModel(oViewModel, "delvAdrsListView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for worklist's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the worklist's object counter after the table update
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("delvAdrsListView").setProperty("/worklistTableTitle", sTitle);
			},


			/**
			 * Event handler for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will navigate to the shell home
			 * @public
			 */
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash(),
					oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

				if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
					history.go(-1);
				} else {
					oCrossAppNavigator.toExternal({
						target: {shellHash: "#Shell-home"}
					});
				}
			},


			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var oTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						oTableSearchState = [new Filter("Street", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(oTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			onTableItemPress : function (oEvent) {
				// Get the Key from Selected Item and bind to oData Model
				var oSource = oEvent.getSource();
				var oContext = oSource.getBindingContext();
				var sdelvAdrs = oContext.getProperty("Addrnumber");		
				var sdelvAdrsNameCo = oContext.getProperty("NameCo");		
				var sdelvAdrsStreet = oContext.getProperty("Street");		
				var sdelvAdrsCity1 = oContext.getProperty("City1");		
				var sdelvAdrsRegion = oContext.getProperty("Region");		
				var sdelvAdrsPostCode1 = oContext.getProperty("PostCode1");		
				var sdelvAdrsCountry = oContext.getProperty("Country");		

				var oViewModel = this.getView().getModel("delvAdrsListView");
				var sContextUserId = "/" + oViewModel.getProperty("/mainContext") +"/Userid";

				var sContextDelvAdrs = "/" + oViewModel.getProperty("/mainContext") +"/Addrnumber";
				var sContextDelvAdrsNameCo = "/" + oViewModel.getProperty("/mainContext") +"/NameCo";
				var sContextDelvAdrsStreet = "/" + oViewModel.getProperty("/mainContext") +"/Street";
				var sContextDelvAdrsCity1 = "/" + oViewModel.getProperty("/mainContext") +"/City1";
				var sContextDelvAdrsRegion = "/" + oViewModel.getProperty("/mainContext") +"/Region";
				var sContextDelvAdrsPostCode1 = "/" + oViewModel.getProperty("/mainContext") +"/PostCode1";
				var sContextDelvAdrsCountry = "/" + oViewModel.getProperty("/mainContext") +"/Country";


				var oMainModel = this.getOwnerComponent().getModel();
				var sUserId = oMainModel.getProperty( sContextUserId );
				oMainModel.setProperty( sContextDelvAdrs, sdelvAdrs );
				oMainModel.setProperty( sContextDelvAdrsNameCo, sdelvAdrsNameCo );
				oMainModel.setProperty( sContextDelvAdrsStreet, sdelvAdrsStreet );
				oMainModel.setProperty( sContextDelvAdrsCity1, sdelvAdrsCity1 );
				oMainModel.setProperty( sContextDelvAdrsRegion, sdelvAdrsRegion );
				oMainModel.setProperty( sContextDelvAdrsPostCode1, sdelvAdrsPostCode1 );
				oMainModel.setProperty( sContextDelvAdrsCountry, sdelvAdrsCountry );
				
				this.getRouter().navTo("deliveryAdrs" , {
					objectId: sUserId
				} );



			},

			/* =========================================================== */
			/* internal methods                                            */
			/* =========================================================== */

			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			 * @private
			 */
			_onObjectMatched : function (oEvent) {
				var sMainContext =  oEvent.getParameter("arguments").mainContext;
				var oModel = this.getView().getModel("delvAdrsListView");
				oModel.setProperty("/mainContext", sMainContext);
			},
			
			/**
			 * Binds the view to the object path.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound
			 * @private
			 */
			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("delvAdrsListView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								// Busy indicator on view should only be set if metadata is loaded,
								// otherwise there may be two busy indications next to each other on the
								// screen. This happens because route matched handler already calls '_bindView'
								// while metadata is loaded.
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},			

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("delvAdrsListView"),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				// Everything went fine.
				oViewModel.setProperty("/busy", false);

			},


			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {object} oTableSearchState an array of filters for the search
			 * @private
			 */
			_applySearch: function(oTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("delvAdrsListView");
				oTable.getBinding("items").filter(oTableSearchState, "Application");
				//sap.ui.model.FilterType.Control
				// changes the noDataText of the list in case there are no filter results
				if (oTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", 
					this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			},

			/**
			 * Event handler when the share in JAM button has been clicked
			 * @public
			 */
			onShareInJamPress : function () {
				var oViewModel = this.getModel("ccListView"),
					oShareDialog = sap.ui.getCore().createComponent({
						name: "sap.collaboration.components.fiori.sharing.dialog",
						settings: {
							object:{
								id: location.href,
								share: oViewModel.getProperty("/shareOnJamTitle")
							}
						}
					});
				oShareDialog.open();
			}

		});
	}
);