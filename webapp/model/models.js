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
                reservations: [
                    {
                        Rsnum: "0001000001",
                        Kostl: "DC001",
                        KostlDesc: "Direzione Centrale Acquisti",
                        RequestDate: "20260610",
                        Requester: "MROSSI",
                        RequesterName: "Mario Rossi",
                        EstimatedAmount: 12500.00,
                        Currency: "EUR",
                        ApprovalLevel: "L1",
                        Status: "PENDING",
                        ExpectedApprover: "GBIANCHI",
                        Gjahr: "2026",
                        CreationDate: "20260610",
                        BudgetResidual: 45000.00,
                        ApprovalL1User: "",
                        ApprovalL1Date: "",
                        ApprovalL1Flag: "",
                        RejectionL1Flag: "",
                        RejectionL1Reason: "",
                        ApprovalL2User: "",
                        ApprovalL2Date: "",
                        ApprovalL2Flag: "",
                        RejectionL2Flag: "",
                        RejectionL2Reason: "",
                        Items: [
                            {
                                Matnr: "000000000010000123",
                                MatnrDesc: "Carta A4 per fotocopiatrice 500 fg",
                                Werks: "MC01",
                                Lgort: "0001",
                                Erfmg: 50,
                                Erfme: "PZ",
                                Verpr: 4.50,
                                EstimatedValue: 225.00,
                                DeletionFlag: "",
                                MovementFlag: ""
                            },
                            {
                                Matnr: "000000000010000456",
                                MatnrDesc: "Penna a sfera blu conf. 50 pz",
                                Werks: "MC01",
                                Lgort: "0001",
                                Erfmg: 10,
                                Erfme: "CF",
                                Verpr: 8.20,
                                EstimatedValue: 82.00,
                                DeletionFlag: "",
                                MovementFlag: ""
                            }
                        ]
                    },
                    {
                        Rsnum: "0001000002",
                        Kostl: "DC002",
                        KostlDesc: "Direzione Risorse Umane",
                        RequestDate: "20260612",
                        Requester: "LVERDI",
                        RequesterName: "Luigi Verdi",
                        EstimatedAmount: 3200.00,
                        Currency: "EUR",
                        ApprovalLevel: "L2",
                        Status: "APPROVED_L1",
                        ExpectedApprover: "ANERI",
                        Gjahr: "2026",
                        CreationDate: "20260612",
                        BudgetResidual: 8000.00,
                        ApprovalL1User: "GBIANCHI",
                        ApprovalL1Date: "20260613",
                        ApprovalL1Flag: "X",
                        RejectionL1Flag: "",
                        RejectionL1Reason: "",
                        ApprovalL2User: "",
                        ApprovalL2Date: "",
                        ApprovalL2Flag: "",
                        RejectionL2Flag: "",
                        RejectionL2Reason: "",
                        Items: [
                            {
                                Matnr: "000000000010000789",
                                MatnrDesc: "Toner stampante laser nero",
                                Werks: "MC01",
                                Lgort: "0001",
                                Erfmg: 4,
                                Erfme: "PZ",
                                Verpr: 65.00,
                                EstimatedValue: 260.00,
                                DeletionFlag: "",
                                MovementFlag: ""
                            }
                        ]
                    },
                    {
                        Rsnum: "0001000003",
                        Kostl: "DC003",
                        KostlDesc: "Direzione ICT",
                        RequestDate: "20260601",
                        Requester: "FNERI",
                        RequesterName: "Francesca Neri",
                        EstimatedAmount: 950.00,
                        Currency: "EUR",
                        ApprovalLevel: "",
                        Status: "REJECTED",
                        ExpectedApprover: "",
                        Gjahr: "2026",
                        CreationDate: "20260601",
                        BudgetResidual: 12000.00,
                        ApprovalL1User: "GBIANCHI",
                        ApprovalL1Date: "20260602",
                        ApprovalL1Flag: "",
                        RejectionL1Flag: "X",
                        RejectionL1Reason: "Materiali non conformi al catalogo approvato.",
                        ApprovalL2User: "",
                        ApprovalL2Date: "",
                        ApprovalL2Flag: "",
                        RejectionL2Flag: "",
                        RejectionL2Reason: "",
                        Items: [
                            {
                                Matnr: "000000000010000321",
                                MatnrDesc: "Mouse wireless ergonomico",
                                Werks: "MC01",
                                Lgort: "0001",
                                Erfmg: 5,
                                Erfme: "PZ",
                                Verpr: 35.00,
                                EstimatedValue: 175.00,
                                DeletionFlag: "X",
                                MovementFlag: ""
                            }
                        ]
                    }
                ]
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