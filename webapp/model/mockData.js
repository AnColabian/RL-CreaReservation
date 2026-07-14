sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";
    return {
        createReservationsModel: function () {
            var oData = {
                reservations: [
                    {
                        Rsnum: "0001000001",
                        Kostl: "D001",
                        Bdter: "20260310",
                        Usnam: "MROSSI",
                        GesWrt: "4200.00",
                        ApprovalLevel: "1",
                        Status: "PENDING",
                        ApproverExpected: "BIANCHI_UO"
                    },
                    {
                        Rsnum: "0001000002",
                        Kostl: "D002",
                        Bdter: "20260401",
                        Usnam: "AVERDI",
                        GesWrt: "8750.50",
                        ApprovalLevel: "2",
                        Status: "APPROVED_L1",
                        ApproverExpected: "NERI_DG"
                    },
                    {
                        Rsnum: "0001000003",
                        Kostl: "D001",
                        Bdter: "20260215",
                        Usnam: "LBLU",
                        GesWrt: "1350.00",
                        ApprovalLevel: "1",
                        Status: "REJECTED",
                        ApproverExpected: ""
                    },
                    {
                        Rsnum: "0001000004",
                        Kostl: "D003",
                        Bdter: "20260505",
                        Usnam: "CGALLI",
                        GesWrt: "22000.00",
                        ApprovalLevel: "2",
                        Status: "APPROVED_L1",
                        ApproverExpected: "NERI_DG"
                    }
                ]
            };
            return new JSONModel(oData);
        },
        createDetailModel: function () {
            var oData = {
                detail: {
                    Rsnum: "0001000001",
                    Kostl: "D001",
                    KostlDesc: "Direzione Generale - Settore A",
                    Bdter: "20260310",
                    Usnam: "MROSSI",
                    GesWrt: "4200.00",
                    ApprovalLevel: "1",
                    Status: "PENDING",
                    ApproverL1: "BIANCHI_UO",
                    ApproverL2: "NERI_DG",
                    ApproveL1Date: "",
                    ApproveL2Date: "",
                    RejectL1Reason: "",
                    RejectL2Reason: "",
                    BudgetDisponibile: "18500.00",
                    BudgetTotale: "25000.00",
                    items: [
                        {
                            Rspos: "0001",
                            Matnr: "000000000010000012",
                            Maktx: "CARTA A4 RISMA 500 FG",
                            Werks: "1000",
                            Lgort: "0001",
                            Bdmng: "50",
                            Meins: "ST",
                            Enwrt: "1500.00",
                            Xloek: false,
                            Xwaok: false
                        },
                        {
                            Rspos: "0002",
                            Matnr: "000000000010000045",
                            Maktx: "PENNA BLU CONF.12PZ",
                            Werks: "1000",
                            Lgort: "0001",
                            Bdmng: "20",
                            Meins: "CF",
                            Enwrt: "1200.00",
                            Xloek: false,
                            Xwaok: false
                        },
                        {
                            Rspos: "0003",
                            Matnr: "000000000010000078",
                            Maktx: "TONER LASER NERO",
                            Werks: "1000",
                            Lgort: "0001",
                            Bdmng: "3",
                            Meins: "PZ",
                            Enwrt: "1500.00",
                            Xloek: true,
                            Xwaok: false
                        }
                    ]
                }
            };
            return new JSONModel(oData);
        },
        createApprovalViewModel: function () {
            var oData = {
                busy: false,
                rejectReason: "",
                rejectReasonValueState: "None",
                rejectReasonValueStateText: "",
                actionsEnabled: true,
                canApprove: true,
                canReject: true
            };
            return new JSONModel(oData);
        }
    };
});