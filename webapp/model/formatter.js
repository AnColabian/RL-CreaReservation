sap.ui.define([], function () {
    "use strict";
    return {
        formatAbapDate: function (sDate) {
            if (!sDate || sDate.length !== 8) {
                return "";
            }
            return sDate.substring(6, 8) + "/" + sDate.substring(4, 6) + "/" + sDate.substring(0, 4);
        },
        formatAmount: function (fAmount, sCurrency) {
            if (fAmount === undefined || fAmount === null) {
                return "";
            }
            var sFormatted = parseFloat(fAmount).toLocaleString("it-IT", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return sCurrency ? sFormatted + " " + sCurrency : sFormatted;
        },
        formatStatusText: function (sStatus) {
            var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            switch (sStatus) {
                case "PENDING":      return oBundle.getText("statusPending");
                case "APPROVED_L1": return oBundle.getText("statusApprovedL1");
                case "APPROVED_L2": return oBundle.getText("statusApprovedL2");
                case "REJECTED":    return oBundle.getText("statusRejected");
                default:            return sStatus || "";
            }
        },
        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "PENDING":      return "Warning";
                case "APPROVED_L1": return "Information";
                case "APPROVED_L2": return "Success";
                case "REJECTED":    return "Error";
                default:            return "None";
            }
        },
        formatApprovalLevelText: function (sLevel) {
            switch (sLevel) {
                case "L1": return "I Livello (UO)";
                case "L2": return "II Livello (DG)";
                default:   return "";
            }
        },
        formatDeletionFlag: function (sFlag) {
            return sFlag === "X" ? "Sì" : "No";
        },
        formatDeletionFlagState: function (sFlag) {
            return sFlag === "X" ? "Error" : "None";
        },
        formatBudgetWarningState: function (fEstimated, fResidual) {
            if (!fResidual || fResidual <= 0) {
                return "Error";
            }
            var fRatio = parseFloat(fEstimated) / parseFloat(fResidual);
            if (fRatio >= 1) {
                return "Error";
            }
            if (fRatio >= 0.8) {
                return "Warning";
            }
            return "Success";
        },
        formatApproveButtonVisible: function (sStatus, sLevel) {
            if (sStatus === "REJECTED" || sStatus === "APPROVED_L2") {
                return false;
            }
            if (sStatus === "PENDING" && sLevel === "L1") {
                return true;
            }
            if (sStatus === "APPROVED_L1" && sLevel === "L2") {
                return true;
            }
            return false;
        },
        formatRejectButtonVisible: function (sStatus) {
            return sStatus !== "REJECTED" && sStatus !== "APPROVED_L2";
        },
        formatMatnr: function (sMatnr) {
            if (!sMatnr) {
                return "";
            }
            return parseInt(sMatnr, 10).toString();
        },
                formatRequesterLabel: function (sName, sCode) {
            if (sName && sCode) {
                return sName + " (" + sCode + ")";
            }
            return sName || sCode || "";
        },
        formatLevelStatus: function (sApprFlag, sRejFlag, sUser, sDate) {
            if (sApprFlag === "X") {
                return "Approvato da " + (sUser || "") + " il " + this.formatAbapDate(sDate || "");
            }
            if (sRejFlag === "X") {
                return "Rifiutato da " + (sUser || "") + " il " + this.formatAbapDate(sDate || "");
            }
            return "In attesa";
        },
        formatLevelState: function (sApprFlag, sRejFlag) {
            if (sApprFlag === "X") {
                return "Success";
            }
            if (sRejFlag === "X") {
                return "Error";
            }
            return "Warning";
        }
    };
});