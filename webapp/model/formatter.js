sap.ui.define([], function () {
    "use strict";
    var formatter = {
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

        formatApprovalLevelText: function (sLevel) {
            switch (sLevel) {
                case "L1": return "I Livello (UO)";
                case "L2": return "II Livello (DG)";
                default: return "";
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
        formatStatusText: function (sStatus) {
            switch (sStatus) {
                case "PEND_1": return "In attesa";
                case "APPR_1": return "Approvato I liv.";
                case "APPR_2": return "Approvato";
                case "RIF_1": return "Rifiutato I liv.";
                case "RIF_2": return "Rifiutato II liv.";
                default: return sStatus || "";
            }
        },
        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "PEND_1": return "Warning";
                case "APPR_1": return "Information";
                case "APPR_2": return "Success";
                case "RIF_1": return "Error";
                case "RIF_2": return "Error";
                default: return "None";
            }
        },
        formatApproveButtonVisible: function (sStatus) {
            return sStatus === "PEND_1" || sStatus === "APPR_1";
        },
        formatRejectButtonVisible: function (sStatus) {
            return sStatus === "PEND_1" || sStatus === "APPR_1";
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
                return "Approvato da " + (sUser || "") + " il " + formatter.formatAbapDate(sDate || "");
            }
            if (sRejFlag === "X") {
                return "Rifiutato da " + (sUser || "") + " il " + formatter.formatAbapDate(sDate || "");
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
        },
        formatIsoDate: function (sDate) {
            if (!sDate || sDate.indexOf("0000-00-00") === 0) {
                return "";
            }
            var aParts = sDate.split("-");
            if (aParts.length !== 3) {
                return sDate;
            }
            return aParts[2] + "/" + aParts[1] + "/" + aParts[0];
        }
    };
    return formatter;
});