sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";
    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },
        createReservationModel: function () {
    var oModel = new JSONModel({
        reservations: []
    });
    return oModel;
},
        createViewModel: function () {
            var oModel = new JSONModel({
                busy: false,
                selectedReservation: null,
                rejectReason: "",
                rejectReasonValueState: "None",
                rejectReasonValueStateText: "",
                filterGjahr: "",
                filterKostl: "",
                filterStatus: "",
                filterLevel: "",
                filterRsnum: "",
                filterDateFrom: null,
                filterDateTo: null,
                approveConfirmVisible: false
            });
            return oModel;
        }
    };
});