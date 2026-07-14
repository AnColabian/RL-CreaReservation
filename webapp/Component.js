sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "./model/models"
], function (UIComponent, Device, models) {
    "use strict";
    return UIComponent.extend("rlcreatereservations.Component", {
        metadata: {
            manifest: "json"
        },
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createReservationModel(), "reservationModel");
            this.setModel(models.createViewModel(), "viewModel");
            this.getRouter().initialize();
        }
    });
});