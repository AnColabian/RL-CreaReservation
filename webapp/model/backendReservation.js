sap.ui.define([], function () {
    "use strict";
    return {
        mergeEntry: function (oReservation, oBackendEntry) {
            oReservation.BackendStato = oBackendEntry.STATO;
            oReservation.BackendMotivoRifI = oBackendEntry.MOTIVO_RIF;
            oReservation.BackendDataILiv = oBackendEntry.DATA_I_LIV;
            oReservation.BackendUtenteILiv = oBackendEntry.UTENTE_I_LIV;
            oReservation.BackendMotivoRifII = oBackendEntry.MOTIVO_RIF_II;
            oReservation.BackendDataIILiv = oBackendEntry.DATA_II_LIV;
            oReservation.BackendUtenteIILiv = oBackendEntry.UTENTE_II_LIV;
            oReservation.BackendDataLoaded = true;
        },
        readBackendStatus: function (oODataModel, fnSuccess, fnError) {
            oODataModel.read("/vis_rich", {
                success: function (oData) {
                    fnSuccess((oData && oData.results) || []);
                },
                error: function (oError) {
                    fnError(oError);
                }
            });
        }
    };
});