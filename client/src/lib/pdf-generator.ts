import { jsPDF } from "jspdf";
import { Questions } from "@shared/schema";
import { getSubjectName } from "@/components/SubjectIcons";

// Function to handle Arabic text better
function processArabicText(text: string): string {
  // Make sure the text is displayed correctly in RTL format
  // This is a simple function to help with rendering Arabic text in PDF
  return text.split("").reverse().join("");
}

/**
 * Generates a PDF for a quiz with questions and answers
 * @param title Quiz title
 * @param subject Subject name
 * @param creator Creator name
 * @param questions Array of questions
 * @returns Blob with PDF data
 */
export function generateQuizPDF(
  title: string,
  subject: string,
  creator: string,
  questions: Questions
): Blob {
  try {
    // Create a new PDF document with Arabic font support
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true
    });

    // Set RTL for Arabic text
    doc.setR2L(true);
    
    // Add Arabic font support (using standard fonts as fallback)
    doc.setFont("helvetica", "normal");

    // Add title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    const processedTitle = processArabicText(title);
    doc.text(processedTitle, doc.internal.pageSize.width - 20, 20, { align: "right" });

    // Add subject and creator info
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    const subjectText = processArabicText(`المادة: ${getSubjectName(subject as any)}`);
    const creatorText = processArabicText(`المنشئ: ${creator}`);
    const countText = processArabicText(`عدد الأسئلة: ${questions.length}`);
    
    doc.text(subjectText, doc.internal.pageSize.width - 20, 30, { align: "right" });
    doc.text(creatorText, doc.internal.pageSize.width - 20, 40, { align: "right" });
    doc.text(countText, doc.internal.pageSize.width - 20, 50, { align: "right" });

    // Add horizontal line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 55, doc.internal.pageSize.width - 20, 55);

    let yPosition = 65;

    // Add questions
    questions.forEach((question, questionIndex) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Add question text
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const questionText = processArabicText(`السؤال ${questionIndex + 1}: ${question.question}`);
      doc.text(
        questionText,
        doc.internal.pageSize.width - 20,
        yPosition,
        { align: "right" }
      );
      yPosition += 10;

      // Add options
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      question.options.forEach((option, optionIndex) => {
        // Mark correct answer with a star
        const prefix = optionIndex === question.correctAnswer ? "★ " : "○ ";
        const optionText = processArabicText(`${prefix}${option}`);
        doc.text(
          optionText,
          doc.internal.pageSize.width - 25,
          yPosition,
          { align: "right" }
        );
        yPosition += 8;
      });

      yPosition += 10;
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      const footerText = processArabicText(`الصفحة ${i} من ${pageCount}`);
      doc.text(
        footerText,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Return the PDF as a blob
    return doc.output("blob");
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Return an empty blob if there's an error
    return new Blob(["Error generating PDF"], { type: "text/plain" });
  }
}