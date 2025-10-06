import PDFDocument from "pdfkit";
import fs from "fs";

export function generateSanctionPDF(user, amount) {
  const dir = "./sanction_letters";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filePath = `${dir}/${user.name.replace(/\s+/g, "_")}_sanction.pdf`;
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text("Personal Loan Sanction Letter", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Dear ${user.name},`);
  doc.moveDown();
  doc.text(`We are pleased to inform you that your personal loan of ₹${amount} has been approved.`);
  doc.text(`Your credit score: ${user.creditScore}`);
  doc.moveDown();
  doc.text("Thank you for choosing our services.", { align: "left" });
  doc.end();

  return filePath;
}
