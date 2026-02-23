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
 * Generate and download PDF document
 */
export const generatePDFDocument = async (project, calc) => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - (2 * margin);

    // Helper function to add heading
    const addHeading = (text, level = 1) => {
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
        }
        const fontSize = level === 1 ? 14 : level === 2 ? 12 : 10;
        const bold = level <= 2;
        doc.setFontSize(fontSize);
        doc.setFont(undefined, bold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 7 + 5;
    };

    // Helper function to add text
    const addText = (text, options = {}) => {
        if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }
        doc.setFontSize(options.fontSize || 10);
        doc.setFont(undefined, options.bold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, margin, yPosition);
        yPosition += lines.length * 5 + (options.spacing || 2);
    };

    // --- TITLE ---
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("DOKUMEN PENELITIAN & KAK", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`CEISA 4.0 Proyek: ${project.nama}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // --- SECTION 1: KAJIAN KEBUTUHAN ---
    addHeading("1. Kajian Kebutuhan & Informasi Umum");
    addText(`Nama Proyek: ${project.nama}`, { spacing: 3 });
    addText(`Unit Pengampu: ${project.pengampu}`, { spacing: 3 });
    addText(`Unit Penanggung Jawab: ${project.unitPenanggungJawab}`, { spacing: 3 });
    addText(`PIC: ${project.namaPIC} (${project.kontakPIC})`, { spacing: 5 });

    addHeading("Latar Belakang & Masalah", 2);
    addText(project.latarBelakang || "N/A", { spacing: 3 });
    addText(`Masalah Utama: ${project.masalahIsu || "N/A"}`, { spacing: 5 });

    addHeading("Target & Outcome", 2);
    addText(`Target Penyelesaian: ${project.targetPenyelesaian}`, { spacing: 3 });
    addText(`Target Outcome: ${project.targetOutcome}`, { spacing: 3 });
    addText(`Business Value: ${project.businessValue}`, { spacing: 5 });

    // --- SECTION 2: COST ESTIMATION ---
    addHeading("2. Estimasi Biaya (RAB) & KAK");
    
    const costTableData = calc.kakTableData.map((item) => [
        item.name,
        `${item.percent}%`,
        item.effortMM.toFixed(3),
        item.roleName,
        formatIDR(item.rate),
        formatIDR(item.cost)
    ]);

    costTableData.push([
        "Total Effort Cost",
        "",
        "",
        "",
        "",
        formatIDR(calc.runningTotalCost)
    ]);
    costTableData.push([
        "Estimasi Garansi (25%)",
        "",
        "",
        "",
        "",
        formatIDR(calc.warrantyCost)
    ]);
    costTableData.push([
        "Sub Total",
        "",
        "",
        "",
        "",
        formatIDR(calc.subTotal)
    ]);
    costTableData.push([
        "PPN (11%)",
        "",
        "",
        "",
        "",
        formatIDR(calc.ppn)
    ]);
    costTableData.push([
        "TOTAL BIAYA ESTIMASI (RAB)",
        "",
        "",
        "",
        "",
        formatIDR(calc.grandTotal)
    ]);

    doc.autoTable({
        head: [["Fase / Aktivitas", "%", "MM", "Role", "Rate", "Biaya"]],
        body: costTableData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 30, textColor: 255, fontStyle: "bold" },
        bodyStyles: { textColor: 0 },
        alternateRowStyles: { fillColor: 240 }
    });

    yPosition = doc.internal.pageSize.getHeight() - doc.lastAutoTable.finalY - 10;
    addText(`Total Man-Month: ${calc.totalManMonths.toFixed(2)} MM`, { bold: true, spacing: 10 });

    // --- SECTION 3: UCP CALCULATION ---
    addHeading("3. Detail Perhitungan UCP");
    
    addHeading("A. Daftar Aktor (UAW)", 2);
    const actorTableData = project.actors.map((actor, idx) => [
        (idx + 1).toString(),
        actor.name,
        actor.desc || "-",
        actor.type,
        getActorComplexity(actor.type).weight.toString()
    ]);

    doc.autoTable({
        head: [["No", "Aktor", "Deskripsi", "Tipe", "UAW"]],
        body: actorTableData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 225, textColor: 0, fontStyle: "bold" }
    });

    yPosition = doc.lastAutoTable.finalY + 5;

    addHeading("B. Daftar Use Case (UUCW)", 2);
    const ucTableData = project.useCases.map((uc, idx) => [
        (idx + 1).toString(),
        uc.name,
        uc.subSystem || "-",
        uc.transactions.toString(),
        getUseCaseComplexity(uc.transactions).weight.toString()
    ]);

    doc.autoTable({
        head: [["No", "Use Case", "Sub-System", "Trans.", "UUCW"]],
        body: ucTableData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 225, textColor: 0, fontStyle: "bold" }
    });

    yPosition = doc.lastAutoTable.finalY + 5;
    addHeading("C. Final Complexity Index", 2);
    addText(`TCF: ${calc.tcf.toFixed(3)} | EF: ${calc.ef.toFixed(3)} | Final UCP: ${calc.ucp.toFixed(2)}`, { bold: true, spacing: 10 });

    // --- SECTION 4: BRD ---
    addHeading("4. Kebutuhan Fungsional (BRD)");
    const brdTableData = (project.kebutuhanFungsional || []).map((req) => [
        req.id,
        req.deskripsi,
        req.prioritas
    ]);

    doc.autoTable({
        head: [["ID", "Deskripsi Kebutuhan Fungsional", "Prioritas"]],
        body: brdTableData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 225, textColor: 0, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: "auto" }, 2: { cellWidth: 30 } }
    });

    yPosition = doc.lastAutoTable.finalY + 5;

    // --- SECTION 5: FSD ---
    addHeading("5. Functional Specification (FSD)");
    const fsdTableData = (project.fsdDesign || []).map((item) => [
        item.item,
        item.pic,
        item.link || "-"
    ]);

    doc.autoTable({
        head: [["Diagram / Dokumen", "PIC", "Link Referensi"]],
        body: fsdTableData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 225, textColor: 0, fontStyle: "bold" }
    });

    yPosition = doc.lastAutoTable.finalY + 5;

    // --- SECTION 6: PROJECT CHARTER ---
    addHeading("6. Project Charter & Timeline");
    addText(`Lingkup Kerja: ${project.charter.scope || "N/A"}`, { spacing: 5 });
    
    addHeading("Jadwal Pelaksanaan", 2);
    const timelineTableData = (project.charter.timeline || []).map((t) => [
        t.milestone,
        t.start,
        t.end,
        t.note || "-"
    ]);

    doc.autoTable({
        head: [["Milestone", "Start", "End", "Note"]],
        body: timelineTableData,
        startY: yPosition,
        margin: margin,
        theme: "grid",
        headStyles: { fillColor: 225, textColor: 0, fontStyle: "bold" }
    });

    // Save PDF
    doc.save(`CEISA_Kajian_${project.nama.replace(/\s+/g, '_')}.pdf`);
};