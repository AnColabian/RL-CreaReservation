sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
], function (Controller, MessageBox, MessageToast, Filter, FilterOperator, formatter) {
    "use strict";
    return Controller.extend("rlcreatereservations.controller.Worklist", {
        formatter: formatter,
        onInit: function () {
            var oComponent = this.getOwnerComponent();
            var oReservationModel = oComponent.getModel("reservationModel");
            var oViewModel = oComponent.getModel("viewModel");
            if (!oReservationModel) {
                oComponent.setModel(
                    sap.ui.requireSync("rlcreatereservations/model/models").createReservationModel(),
                    "reservationModel"
                );
            }
            this.getView().setModel(oViewModel, "viewModel");
            this._resetActionButtons();
            oComponent.getRouter()
                .getRoute("RouteWorklist")
                .attachPatternMatched(this._onRouteMatched, this);
            this._loadBackendStatus();
        },
        _loadBackendStatus: function () {
            var oComponent = this.getOwnerComponent();
            var oODataModel = oComponent.getModel();
            var oReservationModel = oComponent.getModel("reservationModel");
            var oViewModel = oComponent.getModel("viewModel");
            if (!oODataModel) {
                return;
            }
            oViewModel.setProperty("/busy", true);
            oODataModel.read("/vis_rich", {
                success: function (oData) {
                    oViewModel.setProperty("/busy", false);
                    var aReservations = (oData && oData.results) || [];
                    oReservationModel.setProperty("/reservations", aReservations);
                },
                error: function () {
                    oViewModel.setProperty("/busy", false);
                    MessageBox.error(this._i18n("msgGenericError"));
                }.bind(this)
            });
        },
        _onRouteMatched: function () {
            this._resetActionButtons();
            var oTable = this.byId("worklistTable");
            if (oTable) {
                oTable.removeSelections(true);
            }
            this._loadBackendStatus();
        },
        _resetActionButtons: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            oViewModel.setProperty("/approveEnabled", false);
            oViewModel.setProperty("/rejectEnabled", false);
            oViewModel.setProperty("/selectedReservation", null);
        },
        onSelectionChange: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            if (!oItem) {
                this._resetActionButtons();
                return;
            }
            var oCtx = oItem.getBindingContext("reservationModel");
            var oData = oCtx.getObject();
            oViewModel.setProperty("/selectedReservation", oData);
            var bCanApprove = formatter.formatApproveButtonVisible(oData.STATO);
            var bCanReject = formatter.formatRejectButtonVisible(oData.STATO);
            oViewModel.setProperty("/approveEnabled", bCanApprove);
            oViewModel.setProperty("/rejectEnabled", bCanReject);
        },
        onApprove: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var oSelected = oViewModel.getProperty("/selectedReservation");
            if (!oSelected) {
                MessageBox.warning(this._i18n("msgNoSelection"));
                return;
            }
            var sRsnum = oSelected.N_RICH;
            MessageBox.confirm(
                this._i18n("msgApproveConfirmText", [sRsnum]),
                {
                    title: this._i18n("msgApproveConfirmTitle"),
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._executeApprove(oSelected);
                        }
                    }.bind(this)
                }
            );
        },
        _executeApprove: function (oSelected) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var sNewStato = oSelected.STATO === "PEND_1" ? "APPR_1" : "APPR_2";
            var sPath = oODataModel.createKey("/vis_rich", { N_RICH: oSelected.N_RICH });
            oViewModel.setProperty("/busy", true);
            oODataModel.update(sPath, { N_RICH: oSelected.N_RICH, STATO: sNewStato }, {
                success: function () {
                    oViewModel.setProperty("/busy", false);
                    this._resetActionButtons();
                    this.byId("worklistTable").removeSelections(true);
                    MessageToast.show(this._i18n("msgApproveSuccess", [oSelected.N_RICH]));
                    this._loadBackendStatus();
                }.bind(this),
                error: function (oError) {
                    oViewModel.setProperty("/busy", false);
                    MessageBox.error(this._extractErrorMessage(oError));
                }.bind(this)
            });
        },
        onReject: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var oSelected = oViewModel.getProperty("/selectedReservation");
            if (!oSelected) {
                MessageBox.warning(this._i18n("msgNoSelection"));
                return;
            }
            this._openRejectDialog();
        },
        _openRejectDialog: function () {
            if (!this._oRejectDialog) {
                this._oRejectDialog = sap.ui.xmlfragment(
                    this.getView().getId(),
                    "rlcreatereservations.view.fragment.RejectDialog",
                    this
                );
                this.getView().addDependent(this._oRejectDialog);
            }
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            oViewModel.setProperty("/rejectReason", "");
            oViewModel.setProperty("/rejectReasonValueState", "None");
            oViewModel.setProperty("/rejectReasonValueStateText", "");
            this._oRejectDialog.open();
        },
        onRejectReasonLiveChange: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            oViewModel.setProperty("/rejectReasonValueState", "None");
            oViewModel.setProperty("/rejectReasonValueStateText", "");
        },
        onConfirmReject: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var sReason = (oViewModel.getProperty("/rejectReason") || "").trim();
            if (!sReason) {
                oViewModel.setProperty("/rejectReasonValueState", "Error");
                oViewModel.setProperty("/rejectReasonValueStateText", this._i18n("msgRejectReasonMandatory"));
                return;
            }
            if (sReason.length > 120) {
                oViewModel.setProperty("/rejectReasonValueState", "Error");
                oViewModel.setProperty("/rejectReasonValueStateText", this._i18n("msgRejectReasonMaxLength"));
                return;
            }
            var oSelected = oViewModel.getProperty("/selectedReservation");
            this._executeReject(oSelected, sReason);
            this._oRejectDialog.close();
        },
        _executeReject: function (oSelected, sReason) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var sNewStato = oSelected.STATO === "PEND_1" ? "RIF_1" : "RIF_2";
            var oPayload = { N_RICH: oSelected.N_RICH, STATO: sNewStato };
            if (oSelected.STATO === "PEND_1") {
                oPayload.MOTIVO_RIF = sReason;
            } else if (oSelected.STATO === "APPR_1") {
                oPayload.MOTIVO_RIF_II = sReason;
            }
            var sPath = oODataModel.createKey("/vis_rich", { N_RICH: oSelected.N_RICH });
            oViewModel.setProperty("/busy", true);
            oODataModel.update(sPath, oPayload, {
                success: function () {
                    oViewModel.setProperty("/busy", false);
                    this._resetActionButtons();
                    this.byId("worklistTable").removeSelections(true);
                    MessageToast.show(this._i18n("msgRejectSuccess", [oSelected.N_RICH]));
                    this._loadBackendStatus();
                }.bind(this),
                error: function (oError) {
                    oViewModel.setProperty("/busy", false);
                    MessageBox.error(this._extractErrorMessage(oError));
                }.bind(this)
            });
        },
        onCancelReject: function () {
            this._oRejectDialog.close();
        },
        onNavToDetail: function (oEvent) {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var oSelected = oViewModel.getProperty("/selectedReservation");
            if (!oSelected) {
                var oItem = oEvent.getSource();
                if (oItem && oItem.getBindingContext && oItem.getBindingContext("reservationModel")) {
                    oSelected = oItem.getBindingContext("reservationModel").getObject();
                }
            }
            if (!oSelected) {
                MessageBox.warning(this._i18n("msgNoSelection"));
                return;
            }
            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                Reservation: oSelected.N_RICH
            });
        },
        onFilterLiveChange: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var oTable = this.byId("worklistTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            var sRsnum = (oViewModel.getProperty("/filterRsnum") || "").trim();
            var sStatus = oViewModel.getProperty("/filterStatus") || "";
            if (sRsnum) {
                aFilters.push(new Filter("N_RICH", FilterOperator.Contains, sRsnum));
            }
            if (sStatus) {
                aFilters.push(new Filter("STATO", FilterOperator.EQ, sStatus));
            }
            oBinding.filter(aFilters.length > 0 ? new Filter({ filters: aFilters, and: true }) : []);
        },
        onResetFilters: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            oViewModel.setProperty("/filterRsnum", "");
            oViewModel.setProperty("/filterStatus", "");
            var oBinding = this.byId("worklistTable").getBinding("items");
            oBinding.filter([]);
        },
        _i18n: function (sKey, aParams) {
            return this.getOwnerComponent()
                .getModel("i18n")
                .getResourceBundle()
                .getText(sKey, aParams);
        },
        _extractErrorMessage: function (oError) {
            try {
                var oBody = JSON.parse(oError.responseText);
                return oBody.error.message.value;
            } catch (e) {
                return this._i18n("msgGenericError");
            }
        }
    });
});