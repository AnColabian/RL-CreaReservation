sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
    "../model/backendReservation"
], function (Controller, JSONModel, MessageBox, MessageToast, formatter, backendReservation) {
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
                return r.N_RICH === sRsnum;
            });
            if (!oFound) {
                oViewModel.setProperty("/busy", false);
                MessageBox.error(this._i18n("msgReservationNotFound", [sRsnum]));
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
                this._i18n("msgApproveConfirmText", [oData.N_RICH]),
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
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var sNewStato = oData.STATO === "PEND_1" ? "APPR_1" : "APPR_2";
            var sPath = oODataModel.createKey("/vis_rich", { N_RICH: oData.N_RICH });
            oViewModel.setProperty("/busy", true);
            oODataModel.update(sPath, { N_RICH: oData.N_RICH, STATO: sNewStato }, {
                success: function () {
                    oViewModel.setProperty("/busy", false);
                    MessageToast.show(this._i18n("msgApproveSuccess", [oData.N_RICH]));
                    this.onNavBack();
                }.bind(this),
                error: function (oError) {
                    oViewModel.setProperty("/busy", false);
                    MessageBox.error(this._extractErrorMessage(oError));
                }.bind(this)
            });
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
            if (sReason.length > 120) {
                oViewModel.setProperty("/rejectReasonValueState", "Error");
                oViewModel.setProperty("/rejectReasonValueStateText", this._i18n("msgRejectReasonMaxLength"));
                return;
            }
            var oDetailModel = this.getView().getModel("detailModel");
            this._executeReject(oDetailModel.getData(), sReason);
            this._oRejectDialog.close();
        },
        _executeReject: function (oData, sReason) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getOwnerComponent().getModel("viewModel");
            var sNewStato = oData.STATO === "PEND_1" ? "RIF_1" : "RIF_2";
            var oPayload = { N_RICH: oData.N_RICH, STATO: sNewStato };
            if (oData.STATO === "PEND_1") {
                oPayload.MOTIVO_RIF = sReason;
            } else if (oData.STATO === "APPR_1") {
                oPayload.MOTIVO_RIF_II = sReason;
            }
            var sPath = oODataModel.createKey("/vis_rich", { N_RICH: oData.N_RICH });
            oViewModel.setProperty("/busy", true);
            oODataModel.update(sPath, oPayload, {
                success: function () {
                    oViewModel.setProperty("/busy", false);
                    MessageToast.show(this._i18n("msgRejectSuccess", [oData.N_RICH]));
                    this.onNavBack();
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