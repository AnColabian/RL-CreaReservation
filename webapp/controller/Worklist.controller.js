sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter"
], function (Controller, MessageBox, MessageToast, Filter, FilterOperator, formatter) {
    "use strict";
    return Controller.extend("rlcreatereservations.controller.Worklist", {
        formatter: formatter,
        onInit: function () {
            var oComponent = this.getOwnerComponent();
            var oReservationModel = oComponent.getModel("reservationModel");
            var oViewModel = oComponent.getModel("viewModel");
            if (!oReservationModel) {
                var oModels = sap.ui.require("rlcreatereservations/model/models");
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
        },
        _onRouteMatched: function () {
            this._resetActionButtons();
            var oTable = this.byId("worklistTable");
            if (oTable) {
                oTable.removeSelections(true);
            }
        },
        _resetActionButtons: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            oViewModel.setProperty("/approveEnabled", false);
            oViewModel.setProperty("/rejectEnabled", false);
            oViewModel.setProperty("/detailEnabled", false);
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
            oViewModel.setProperty("/detailEnabled", true);
            var bCanApprove = formatter.formatApproveButtonVisible(oData.Status, oData.ApprovalLevel);
            var bCanReject = formatter.formatRejectButtonVisible(oData.Status);
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
            var sRsnum = oSelected.Rsnum;
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
            var oReservationModel = this.getOwnerComponent().getModel("reservationModel");
            var aReservations = oReservationModel.getProperty("/reservations");
            var iIdx = aReservations.findIndex(function (r) {
                return r.Rsnum === oSelected.Rsnum;
            });
            if (iIdx === -1) {
                return;
            }
            var oRes = aReservations[iIdx];
            if (oRes.Status === "PENDING") {
                oRes.ApprovalL1Flag = "X";
                oRes.ApprovalL1User = "CURRENTUSER";
                oRes.ApprovalL1Date = this._todayAbap();
                oRes.Status = "APPROVED_L1";
                oRes.ApprovalLevel = "L2";
            } else if (oRes.Status === "APPROVED_L1") {
                oRes.ApprovalL2Flag = "X";
                oRes.ApprovalL2User = "CURRENTUSER";
                oRes.ApprovalL2Date = this._todayAbap();
                oRes.Status = "APPROVED_L2";
                oRes.ApprovalLevel = "";
                oRes.ExpectedApprover = "";
            }
            oReservationModel.setProperty("/reservations/" + iIdx, oRes);
            this._resetActionButtons();
            this.byId("worklistTable").removeSelections(true);
            MessageToast.show(this._i18n("msgApproveSuccess", [oSelected.Rsnum]));
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
            if (sReason.length > 50) {
                oViewModel.setProperty("/rejectReasonValueState", "Error");
                oViewModel.setProperty("/rejectReasonValueStateText", this._i18n("msgRejectReasonMaxLength"));
                return;
            }
            var oSelected = oViewModel.getProperty("/selectedReservation");
            this._executeReject(oSelected, sReason);
            this._oRejectDialog.close();
        },
        _executeReject: function (oSelected, sReason) {
            var oReservationModel = this.getOwnerComponent().getModel("reservationModel");
            var aReservations = oReservationModel.getProperty("/reservations");
            var iIdx = aReservations.findIndex(function (r) {
                return r.Rsnum === oSelected.Rsnum;
            });
            if (iIdx === -1) {
                return;
            }
            var oRes = aReservations[iIdx];
            if (oRes.Status === "PENDING") {
                oRes.RejectionL1Flag = "X";
                oRes.RejectionL1Reason = sReason;
                oRes.ApprovalL1Date = this._todayAbap();
                oRes.ApprovalL1User = "CURRENTUSER";
            } else if (oRes.Status === "APPROVED_L1") {
                oRes.RejectionL2Flag = "X";
                oRes.RejectionL2Reason = sReason;
                oRes.ApprovalL2Date = this._todayAbap();
                oRes.ApprovalL2User = "CURRENTUSER";
            }
            oRes.Status = "REJECTED";
            oRes.ApprovalLevel = "";
            oRes.ExpectedApprover = "";
            oRes.Items = oRes.Items.map(function (oItem) {
                oItem.DeletionFlag = "X";
                return oItem;
            });
            oReservationModel.setProperty("/reservations/" + iIdx, oRes);
            this._resetActionButtons();
            this.byId("worklistTable").removeSelections(true);
            MessageToast.show(this._i18n("msgRejectSuccess", [oSelected.Rsnum]));
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
                Reservation: oSelected.Rsnum
            });
        },
        onFilterLiveChange: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var oTable = this.byId("worklistTable");
            var oBinding = oTable.getBinding("items");
            var aFilters = [];
            var sGjahr = (oViewModel.getProperty("/filterGjahr") || "").trim();
            var sKostl = (oViewModel.getProperty("/filterKostl") || "").trim();
            var sStatus = oViewModel.getProperty("/filterStatus") || "";
            var sLevel = oViewModel.getProperty("/filterLevel") || "";
            var sRsnum = (oViewModel.getProperty("/filterRsnum") || "").trim();
            if (sGjahr) {
                aFilters.push(new Filter("Gjahr", FilterOperator.Contains, sGjahr));
            }
            if (sKostl) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("Kostl", FilterOperator.Contains, sKostl),
                        new Filter("KostlDesc", FilterOperator.Contains, sKostl)
                    ],
                    and: false
                }));
            }
            if (sStatus) {
                aFilters.push(new Filter("Status", FilterOperator.EQ, sStatus));
            }
            if (sLevel) {
                aFilters.push(new Filter("ApprovalLevel", FilterOperator.EQ, sLevel));
            }
            if (sRsnum) {
                aFilters.push(new Filter("Rsnum", FilterOperator.Contains, sRsnum));
            }
            oBinding.filter(aFilters.length > 0 ? new Filter({ filters: aFilters, and: true }) : []);
        },
        onResetFilters: function () {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            oViewModel.setProperty("/filterGjahr", "");
            oViewModel.setProperty("/filterKostl", "");
            oViewModel.setProperty("/filterStatus", "");
            oViewModel.setProperty("/filterLevel", "");
            oViewModel.setProperty("/filterRsnum", "");
            var oBinding = this.byId("worklistTable").getBinding("items");
            oBinding.filter([]);
        },
        _i18n: function (sKey, aParams) {
            return this.getOwnerComponent()
                .getModel("i18n")
                .getResourceBundle()
                .getText(sKey, aParams);
        },
        _todayAbap: function () {
            var d = new Date();
            var sY = d.getFullYear().toString();
            var sM = String(d.getMonth() + 1).padStart(2, "0");
            var sD = String(d.getDate()).padStart(2, "0");
            return sY + sM + sD;
        }
    });
});