sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter"
], function (Controller, JSONModel, MessageBox, MessageToast, formatter) {
    "use strict";
    return Controller.extend("rlcreatereservations.controller.Detail", {
        formatter: formatter,
        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            var sRsnum = oEvent.getParameter("arguments").Reservation;
            this._loadDetail(sRsnum);
        },
        _loadDetail: function (sRsnum) {
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            oViewModel.setProperty("/busy", true);
            var oReservationModel = this.getOwnerComponent().getModel("reservationModel");
            var aReservations = oReservationModel.getProperty("/reservations");
            var oFound = aReservations.find(function (r) {
                return r.Rsnum === sRsnum;
            });
            if (!oFound) {
                oViewModel.setProperty("/busy", false);
                MessageBox.error("Reservation " + sRsnum + " non trovata.");
                return;
            }
            var oDetailModel = new JSONModel(JSON.parse(JSON.stringify(oFound)));
            this.getView().setModel(oDetailModel, "detailModel");
            this.getView().setModel(oViewModel, "viewModel");
            oViewModel.setProperty("/busy", false);
        },
        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteWorklist", {}, true);
        },
        onApprove: function () {
            var oDetailModel = this.getView().getModel("detailModel");
            var oData = oDetailModel.getData();
            MessageBox.confirm(
                this._i18n("msgApproveConfirmText", [oData.Rsnum]),
                {
                    title: this._i18n("msgApproveConfirmTitle"),
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._executeApprove(oData);
                        }
                    }.bind(this)
                }
            );
        },
        _executeApprove: function (oData) {
            var oReservationModel = this.getOwnerComponent().getModel("reservationModel");
            var aReservations = oReservationModel.getProperty("/reservations");
            var iIdx = aReservations.findIndex(function (r) {
                return r.Rsnum === oData.Rsnum;
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
            this._loadDetail(oData.Rsnum);
            MessageToast.show(this._i18n("msgApproveSuccess", [oData.Rsnum]));
        },
        onReject: function () {
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
            var oDetailModel = this.getView().getModel("detailModel");
            this._executeReject(oDetailModel.getData(), sReason);
            this._oRejectDialog.close();
        },
        _executeReject: function (oData, sReason) {
            var oReservationModel = this.getOwnerComponent().getModel("reservationModel");
            var aReservations = oReservationModel.getProperty("/reservations");
            var iIdx = aReservations.findIndex(function (r) {
                return r.Rsnum === oData.Rsnum;
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
            this._loadDetail(oData.Rsnum);
            MessageToast.show(this._i18n("msgRejectSuccess", [oData.Rsnum]));
        },
        onCancelReject: function () {
            this._oRejectDialog.close();
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