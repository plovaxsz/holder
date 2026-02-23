import { 
    Document, Packer, Paragraph, TextRun, Table, TableRow, 
    TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, ExternalHyperlink 
} from "docx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatIDR, getUseCaseComplexity, getActorComplexity } from "../constants.js";

/**
 * Helper to create simple text cells with consistent styling
 */
const createTextCell = (text, bold = false, fill = undefined) => {
    return new TableCell({
        children: [new Paragraph({ 
            children: [new TextRun({ text: text || "-", bold: bold, size: 24 })], // size 24 = 12pt
        })],
        shading: fill ? { fill: fill } : undefined,
        verticalAlign: "center",
        margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });
};

const createHeader = (text) => {
    return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
    });
};

const createSubHeader = (text) => {
    return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
    });
};

const createLabelValue = (label, value) => {
    return new Paragraph({
        children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: value || "-" })
        ],
        spacing: { after: 100 }
    });
};

/**
 * Main function to generate and download the .docx file
 */
export const generateWordDocument = async (project, calc) => {
    
    // --- SECTION 1: KAJIAN KEBUTUHAN ---
    const generalInfo = [
        createHeader("1. Kajian Kebutuhan & Informasi Umum"),
        createLabelValue("Nama Proyek", project.nama),
        createLabelValue("Unit Pengampu", project.pengampu),
        createLabelValue("Unit Penanggung Jawab", project.unitPenanggungJawab),
        createLabelValue("PIC", `${project.namaPIC} (${project.kontakPIC})`),
        createSubHeader("Latar Belakang & Masalah"),
        new Paragraph({ text: project.latarBelakang }),
        new Paragraph({ children: [new TextRun({ text: "\nMasalah Utama:", bold: true })] }),
        new Paragraph({ text: project.masalahIsu }),
        createSubHeader("Target & Outcome"),
        createLabelValue("Target Penyelesaian", project.targetPenyelesaian),
        createLabelValue("Target Outcome", project.targetOutcome),
        createLabelValue("Business Value", project.businessValue),
    ];

    // --- SECTION 2: COST ESTIMATION (RAB) ---
    const costRows = calc.kakTableData.map((item) => 
        new TableRow({
            children: [
                createTextCell(item.name),
                createTextCell(`${item.percent}%`),
                createTextCell(item.effortMM.toFixed(3)),
                createTextCell(item.roleName),
                createTextCell(formatIDR(item.rate)),
                createTextCell(formatIDR(item.cost)),
            ]
        })
    );

    const totalRows = [
        new TableRow({ children: [createTextCell("Total Effort Cost", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.runningTotalCost), true)] }),
        new TableRow({ children: [createTextCell("Estimasi Garansi (25%)", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.warrantyCost), true)] }),
        new TableRow({ children: [createTextCell("Sub Total", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.subTotal), true)] }),
        new TableRow({ children: [createTextCell("PPN (11%)", true), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.ppn), true)] }),
        new TableRow({ children: [createTextCell("TOTAL BIAYA ESTIMASI (RAB)", true, "E2E8F0"), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(""), createTextCell(formatIDR(calc.grandTotal), true, "E2E8F0")] }),
    ];

    const costTable = new Table({
        rows: [
            new TableRow({
                children: [
                    createTextCell("Fase / Aktivitas", true, "1E293B"), // Slate-800
                    createTextCell("%", true, "1E293B"),
                    createTextCell("MM", true, "1E293B"),
                    createTextCell("Role", true, "1E293B"),
                    createTextCell("Rate", true, "1E293B"),
                    createTextCell("Biaya", true, "1E293B"),
                ]
            }),
            ...costRows,
            ...totalRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 3: USE CASES & ACTORS ---
    const actorRows = project.actors.map((actor, idx) => 
        new TableRow({
            children: [
                createTextCell((idx + 1).toString()),
                createTextCell(actor.name, true),
                createTextCell(actor.desc || ""),
                createTextCell(actor.type),
                createTextCell(getActorComplexity(actor.type).weight.toString())
            ]
        })
    );

    const actorTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("No", true, "E2E8F0"), createTextCell("Aktor", true, "E2E8F0"), createTextCell("Deskripsi", true, "E2E8F0"), createTextCell("Tipe", true, "E2E8F0"), createTextCell("UAW", true, "E2E8F0")] }),
            ...actorRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    const ucRows = project.useCases.map((uc, idx) => 
        new TableRow({
            children: [
                createTextCell((idx + 1).toString()),
                createTextCell(uc.name, true),
                createTextCell(uc.subSystem || "-"),
                createTextCell(uc.transactions.toString()),
                createTextCell(getUseCaseComplexity(uc.transactions).weight.toString())
            ]
        })
    );

    const ucTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("No", true, "E2E8F0"), createTextCell("Use Case", true, "E2E8F0"), createTextCell("Sub-System", true, "E2E8F0"), createTextCell("Trans.", true, "E2E8F0"), createTextCell("UUCW", true, "E2E8F0")] }),
            ...ucRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 4: BRD (FUNCTIONAL REQS) ---
    const reqRows = project.kebutuhanFungsional.map((req) => 
        new TableRow({
            children: [
                createTextCell(req.id),
                createTextCell(req.deskripsi),
                createTextCell(req.prioritas)
            ]
        })
    );

    const reqTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("ID", true, "E2E8F0"), createTextCell("Deskripsi Kebutuhan Fungsional", true, "E2E8F0"), createTextCell("Prioritas", true, "E2E8F0")] }),
            ...reqRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 5: FSD (DESIGN & DIAGRAMS) ---
    const fsdRows = project.fsdDesign.map((item) => 
        new TableRow({
            children: [
                createTextCell(item.item),
                createTextCell(item.pic),
                new TableCell({
                    children: [
                        item.link ?
                        new Paragraph({
                            children: [
                                new ExternalHyperlink({
                                    children: [
                                        new TextRun({
                                            text: item.link,
                                            style: "Hyperlink",
                                            color: "0563C1",
                                            underline: { type: "single" },
                                        }),
                                    ],
                                    link: item.link,
                                }),
                            ],
                        }) : 
                        new Paragraph({ children: [new TextRun({ text: "-" })] })
                    ],
                    verticalAlign: "center",
                    margins: { top: 100, bottom: 100, left: 100, right: 100 }
                })
            ]
        })
    );

    const fsdTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("Diagram / Dokumen", true, "E2E8F0"), createTextCell("PIC", true, "E2E8F0"), createTextCell("Link Referensi", true, "E2E8F0")] }),
            ...fsdRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SECTION 6: CHARTER ---
    const timelineRows = project.charter.timeline.map((t) => 
        new TableRow({
            children: [
                createTextCell(t.milestone),
                createTextCell(t.start),
                createTextCell(t.end),
                createTextCell(t.note || "-")
            ]
        })
    );

    const timelineTable = new Table({
        rows: [
            new TableRow({ children: [createTextCell("Milestone", true, "E2E8F0"), createTextCell("Start", true, "E2E8F0"), createTextCell("End", true, "E2E8F0"), createTextCell("Note", true, "E2E8F0")] }),
            ...timelineRows
        ],
        width: { size: 100, type: WidthType.PERCENTAGE }
    });

    // --- SIGNATURE SECTION ---
    const signatureTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({ text: "Disetujui oleh:", spacing: { after: 100 } }),
                            new Paragraph({ text: project.charter.bizProcessOwner || "Pemilik Proses Bisnis", bold: true }),
                            new Paragraph({ text: "", spacing: { after: 800 } }), 
                            new Paragraph({ children: [new TextRun({ text: "Nama : ", bold: true }), new TextRun({ text: project.namaPIC || "...................." })] }),
                            new Paragraph({ children: [new TextRun({ text: "NIP  : ", bold: true }), new TextRun({ text: "...................." })] }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({ text: "Disusun oleh:", spacing: { after: 100 } }),
                            new Paragraph({ text: "System Analyst / PIC TIK", bold: true }),
                            new Paragraph({ text: "", spacing: { after: 800 } }),
                            new Paragraph({ children: [new TextRun({ text: "Nama : ", bold: true }), new TextRun({ text: "...................." })] }),
                            new Paragraph({ children: [new TextRun({ text: "NIP  : ", bold: true }), new TextRun({ text: "...................." })] }),
                        ],
                        width: { size: 50, type: WidthType.PERCENTAGE }
                    }),
                ]
            })
        ]
    });

    // --- COMPILE DOCUMENT ---
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: "DOKUMEN PENELITIAN & KAK", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: `CEISA 4.0 Proyek: ${project.nama}`, alignment: AlignmentType.CENTER, spacing: { after: 500 } }),
                
                ...generalInfo,
                
                createHeader("2. Estimasi Biaya (RAB) & KAK"),
                costTable,
                new Paragraph({ children: [new TextRun({ text: `Total Man-Month: ${calc.totalManMonths.toFixed(2)} MM`, bold: true })], spacing: { before: 200 } }),

                createHeader("3. Detail Perhitungan UCP"),
                createSubHeader("A. Daftar Aktor (UAW)"),
                actorTable,
                createSubHeader("B. Daftar Use Case (UUCW)"),
                ucTable,
                createSubHeader("C. Final Complexity Index"),
                new Paragraph({ text: `TCF: ${calc.tcf.toFixed(3)} | EF: ${calc.ef.toFixed(3)} | Final UCP: ${calc.ucp.toFixed(2)}`, bold: true }),

                createHeader("4. Kebutuhan Fungsional (BRD)"),
                reqTable,

                createHeader("5. Functional Specification (FSD)"),
                fsdTable,

                createHeader("6. Project Charter & Timeline"),
                new Paragraph({ text: "Lingkup Kerja:", bold: true }),
                new Paragraph({ text: project.charter.scope }),
                new Paragraph({ text: "Jadwal Pelaksanaan:", bold: true, spacing: { before: 200 } }),
                timelineTable,

                new Paragraph({ text: "", spacing: { before: 800 } }), 
                signatureTable
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CEISA_Kajian_${project.nama.replace(/\s+/g, '_')}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
};

/**
 * Generate and download PDF document with all sections
 */
export const generatePDFDocument = async (project, calc) => {
    const doc = new jsPDF({ format: 'a4', orientation: 'portrait' });
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const maxWidth = pageWidth - (2 * margin);

    // Helper to get remaining space
    const checkPageBreak = (requiredSpace = 30) => {
        if (yPosition > pageHeight - requiredSpace) {
            doc.addPage();
            yPosition = 20;
        }
    };

    // Helper function to add heading
    const addHeading = (text, level = 1) => {
        checkPageBreak(25);
        const fontSize = level === 1 ? 14 : level === 2 ? 11 : 9;
        const bold = level <= 2;
        doc.setFontSize(fontSize);
        doc.setFont(undefined, bold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 6.5 + 3;
    };

    // Helper function to add text
    const addText = (text, options = {}) => {
        checkPageBreak(15);
        doc.setFontSize(options.fontSize || 9);
        doc.setFont(undefined, options.bold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 4.5 + (options.spacing || 1.5);
    };

    const addBlankLine = (count = 1) => {
        yPosition += count * 3;
    };

    // --- COVER PAGE / TITLE ---
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("DOKUMEN PENELITIAN & KAK", pageWidth / 2, 40, { align: "center" });
    doc.setFontSize(12);
    doc.text(`CEISA 4.0 Proyek: ${project.nama}`, pageWidth / 2, 50, { align: "center" });
    yPosition = 65;

    // --- SECTION 1: KAJIAN KEBUTUHAN ---
    addHeading("1. Kajian Kebutuhan & Informasi Umum");
    addText(`Nama Proyek: ${project.nama}`, { spacing: 1 });
    addText(`Unit Pengampu: ${project.pengampu}`, { spacing: 1 });
    addText(`Unit Penanggung Jawab: ${project.unitPenanggungJawab}`, { spacing: 1 });
    addText(`PIC: ${project.namaPIC} (${project.kontakPIC})`, { spacing: 3 });

    addHeading("Latar Belakang & Masalah", 2);
    addText(project.latarBelakang || "N/A", { spacing: 2 });
    addText(`Masalah Utama: ${project.masalahIsu || "N/A"}`, { spacing: 3 });

    addHeading("Target & Outcome", 2);
    addText(`Target Penyelesaian: ${project.targetPenyelesaian}`, { spacing: 1 });
    addText(`Target Outcome: ${project.targetOutcome}`, { spacing: 1 });
    addText(`Business Value: ${project.businessValue}`, { spacing: 3 });

    // --- SECTION 2: BRD PROCESS ANALYSIS ---
    addHeading("2. Analisis Proses Bisnis");
    if (project.brdProcessAnalysis) {
        addText(`Modul: ${project.brdProcessAnalysis.modul || "-"}`, { spacing: 1 });
        addText(`Sub Modul: ${project.brdProcessAnalysis.subModul || "-"}`, { spacing: 1 });
        addText(`Pemetaan EA Kemenkeu: ${project.brdProcessAnalysis.eaMapping || "-"}`, { spacing: 1 });
        addText(`Catatan: ${project.brdProcessAnalysis.notes || "-"}`, { spacing: 3 });
    }

    // --- SECTION 3: AS-IS TO-BE ---
    addHeading("3. Kondisi As-Is To-Be");
    if (project.asIsToBe && project.asIsToBe.length > 0) {
        const asIsToBeData = project.asIsToBe.map((item) => [
            item.factor || "-",
            item.asIs || "-",
            item.toBe || "-"
        ]);
        
        doc.autoTable({
            head: [["Faktor Pembanding", "As Is", "To Be"]],
            body: asIsToBeData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 45, textColor: 255, fontStyle: "bold", fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: "auto" }, 2: { cellWidth: "auto" } }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada data.", { spacing: 3 });
    }

    // --- SECTION 4: KEBUTUHAN FUNGSIONAL ---
    addHeading("4. Kebutuhan Fungsional (BRD)");
    if (project.kebutuhanFungsional && project.kebutuhanFungsional.length > 0) {
        const brdTableData = project.kebutuhanFungsional.map((req) => [
            req.id || "-",
            req.deskripsi || "-",
            req.prioritas || "-"
        ]);

        doc.autoTable({
            head: [["ID", "Deskripsi Kebutuhan Fungsional", "Prioritas"]],
            body: brdTableData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 45, textColor: 255, fontStyle: "bold", fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: "auto" }, 2: { cellWidth: 25 } }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada kebutuhan fungsional yang didefinisikan.", { spacing: 3 });
    }

    // --- SECTION 5: KEBUTUHAN NON-FUNGSIONAL ---
    addHeading("5. Kebutuhan Non-Fungsional");
    if (project.kebutuhanNonFungsional && project.kebutuhanNonFungsional.length > 0) {
        const nfReqData = project.kebutuhanNonFungsional.map((req) => [
            req.id || "-",
            req.deskripsi || "-",
            req.kategori || "-"
        ]);

        doc.autoTable({
            head: [["ID", "Deskripsi", "Kategori"]],
            body: nfReqData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 45, textColor: 255, fontStyle: "bold", fontSize: 9 },
            bodyStyles: { fontSize: 8 }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada kebutuhan non-fungsional yang didefinisikan.", { spacing: 3 });
    }

    // --- SECTION 6: RISIKO BISNIS ---
    addHeading("6. Risiko Bisnis");
    if (project.risikoBisnis && project.risikoBisnis.length > 0) {
        const riskData = project.risikoBisnis.map((risk) => [
            risk.id || "-",
            risk.deskripsi || "-",
            risk.tingkatRisiko || "-",
            risk.mitigasi || "-"
        ]);

        doc.autoTable({
            head: [["ID", "Deskripsi Risiko", "Tingkat", "Mitigasi"]],
            body: riskData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 45, textColor: 255, fontStyle: "bold", fontSize: 9 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 15 }, 3: { cellWidth: 50 } }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada risiko bisnis yang teridentifikasi.", { spacing: 3 });
    }

    // --- SECTION 7: COST ESTIMATION (RAB) ---
    addHeading("7. Estimasi Biaya (RAB) & KAK");
    
    const costTableData = calc.kakTableData.map((item) => [
        item.name || "-",
        `${item.percent || 0}%`,
        (item.effortMM || 0).toFixed(2),
        item.roleName || "-",
        formatIDR(item.rate || 0),
        formatIDR(item.cost || 0)
    ]);

    costTableData.push([
        "Total Effort Cost",
        "",
        "",
        "",
        "",
        formatIDR(calc.runningTotalCost || 0)
    ]);
    costTableData.push([
        "Garansi (25%)",
        "",
        "",
        "",
        "",
        formatIDR(calc.warrantyCost || 0)
    ]);
    costTableData.push([
        "Sub Total",
        "",
        "",
        "",
        "",
        formatIDR(calc.subTotal || 0)
    ]);
    costTableData.push([
        "PPN (11%)",
        "",
        "",
        "",
        "",
        formatIDR(calc.ppn || 0)
    ]);
    costTableData.push([
        "TOTAL (RAB)",
        "",
        "",
        "",
        "",
        formatIDR(calc.grandTotal || 0)
    ]);

    doc.autoTable({
        head: [["Fase / Aktivitas", "%", "MM", "Role", "Rate", "Biaya"]],
        body: costTableData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 30, textColor: 255, fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: { 0: { cellWidth: 35 }, 4: { cellWidth: 25 }, 5: { cellWidth: 25 } }
    });

    yPosition = doc.lastAutoTable.finalY + 3;
    addText(`Total Man-Month: ${(calc.totalManMonths || 0).toFixed(2)} MM`, { bold: true, spacing: 3 });

    // --- SECTION 8: UCP CALCULATION ---
    addHeading("8. Detail Perhitungan UCP");
    
    addHeading("A. Daftar Aktor (UAW)", 2);
    if (project.actors && project.actors.length > 0) {
        const actorTableData = project.actors.map((actor, idx) => [
            (idx + 1).toString(),
            actor.name || "-",
            actor.desc || "-",
            actor.type || "-",
            getActorComplexity(actor.type || "none").weight.toString()
        ]);

        actorTableData.push([
            "", "", "", "Total UAW", calc.uaw.toString()
        ]);

        doc.autoTable({
            head: [["No", "Aktor", "Deskripsi", "Tipe", "UAW"]],
            body: actorTableData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 150, textColor: 255, fontStyle: "bold", fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            columnStyles: { 0: { cellWidth: 10 } }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada aktor yang didefinisikan.", { spacing: 3 });
    }

    addHeading("B. Daftar Use Case (UUCW)", 2);
    if (project.useCases && project.useCases.length > 0) {
        const ucTableData = project.useCases.map((uc, idx) => [
            (idx + 1).toString(),
            uc.name || "-",
            uc.actorRef || "-",
            uc.preCond || "-",
            uc.postCond || "-",
            (uc.transactions || 0).toString(),
            getUseCaseComplexity(uc.transactions || 3).weight.toString()
        ]);

        ucTableData.push([
            "", "", "", "", "", "Total UUCW", calc.uucw.toString()
        ]);

        doc.autoTable({
            head: [["No", "Use Case", "Actor", "Pre-Cond", "Post-Cond", "Trans.", "UUCW"]],
            body: ucTableData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 150, textColor: 255, fontStyle: "bold", fontSize: 8 },
            bodyStyles: { fontSize: 7 },
            columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 }, 3: { cellWidth: 20 }, 4: { cellWidth: 20 } }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada use case yang didefinisikan.", { spacing: 3 });
    }

    addHeading("C. Final Complexity Index", 2);
    addText(`UUCP: ${calc.uucp.toFixed(2)} | TCF: ${calc.tcf.toFixed(3)} | EF: ${calc.ef.toFixed(3)}`, { spacing: 1 });
    addText(`Final UCP: ${calc.ucp.toFixed(2)}`, { bold: true, spacing: 3 });

    // --- SECTION 9: MAN-MONTH SUMMARY ---
    addHeading("9. Man-Month Estimation");
    const mmSummaryData = [
        ["UCP", (calc.ucp || 0).toFixed(2)],
        ["Person-Hours per Man-Month (PHM)", project.phm || 0],
        ["Total Person-Hours", (calc.totalPersonHours || 0).toFixed(0)],
        ["Working Days", (calc.workingDays || 0).toFixed(2)],
        ["Total Man-Months (MM)", (calc.totalManMonths || 0).toFixed(2)]
    ];

    doc.autoTable({
        head: [["Metrik", "Nilai"]],
        body: mmSummaryData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 30, textColor: 255, fontStyle: "bold", fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 20 } }
    });
    yPosition = doc.lastAutoTable.finalY + 3;

    // --- SECTION 10: FSD ---
    addHeading("10. Functional Specification (FSD)");
    if (project.fsdDesign && project.fsdDesign.length > 0) {
        const fsdTableData = project.fsdDesign.map((item) => [
            item.item || "-",
            item.pic || "-",
            item.link || "-"
        ]);

        doc.autoTable({
            head: [["Diagram / Dokumen", "PIC", "Link Referensi"]],
            body: fsdTableData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 45, textColor: 255, fontStyle: "bold", fontSize: 9 },
            bodyStyles: { fontSize: 8 }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada spesifikasi desain.", { spacing: 3 });
    }

    // --- SECTION 11: PROJECT CHARTER ---
    addHeading("11. Project Charter & Timeline");
    addText(`Lingkup Kerja: ${project.charter.scope || "N/A"}`, { spacing: 2 });
    
    addHeading("Jadwal Pelaksanaan & Milestone", 2);
    if (project.charter.timeline && project.charter.timeline.length > 0) {
        const timelineTableData = project.charter.timeline.map((t) => [
            t.milestone || "-",
            t.start || "-",
            t.end || "-",
            t.note || "-"
        ]);

        doc.autoTable({
            head: [["Milestone", "Start", "End", "Note"]],
            body: timelineTableData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 45, textColor: 255, fontStyle: "bold", fontSize: 9 },
            bodyStyles: { fontSize: 8 }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada timeline yang didefinisikan.", { spacing: 3 });
    }

    addHeading("Tim Proyek", 2);
    if (project.charter.team && project.charter.team.length > 0) {
        const teamTableData = project.charter.team.map((member) => [
            member.name || "-",
            member.role || "-",
            member.responsibility || "-"
        ]);

        doc.autoTable({
            head: [["Nama", "Role", "Responsibility"]],
            body: teamTableData,
            startY: yPosition,
            margin: margin,
            theme: "grid",
            headStyles: { fillColor: 45, textColor: 255, fontStyle: "bold", fontSize: 9 },
            bodyStyles: { fontSize: 8 }
        });
        yPosition = doc.lastAutoTable.finalY + 3;
    } else {
        addText("Tidak ada anggota tim yang didefinisikan.", { spacing: 3 });
    }

    // --- PRIORITY ASSESSMENT ---
    addHeading("12. Priority Assessment");
    addText(`Business Value Score: ${calc.totalBV}`, { spacing: 1 });
    addText(`Effort Score: ${calc.totalEffort}`, { spacing: 1 });
    addText(`Priority Score: ${(calc.totalBV / (calc.totalEffort || 1)).toFixed(2)}`, { spacing: 1 });
    addText(`Priority Level: ${calc.priority}`, { bold: true, spacing: 3 });

    // --- FOOTER ---
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: "center" }
        );
    }

    // Save PDF
    const filename = `CEISA_Kajian_${project.nama.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(filename);
};