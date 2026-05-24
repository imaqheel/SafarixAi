import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";

export async function generatePDF(tripName: string) {
  toast({ title: "Generating PDF...", description: "Please wait while we prepare your itinerary." });
  
  const element = document.getElementById("itinerary");
  if (!element) {
    toast({ title: "Error", description: "Could not find itinerary content.", variant: "destructive" });
    return;
  }

  try {
    // We clone the element so we can expand accordions for printing
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = "800px"; // Fixed width for consistent rendering
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "-9999px";
    
    // Expand all accordion contents in the clone
    const accordions = clone.querySelectorAll('[data-state="closed"]');
    accordions.forEach((acc) => {
      acc.setAttribute("data-state", "open");
      const content = acc.nextElementSibling as HTMLElement;
      if (content) {
        content.style.display = "block";
        content.style.height = "auto";
        content.setAttribute("data-state", "open");
      }
    });

    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    
    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/png");
    
    // A4 dimensions at 72 PPI
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    // First page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Add new pages if height exceeds one page
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const safeFilename = `Safarix_Itinerary_${tripName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    pdf.save(safeFilename);
    
    toast({ title: "Success!", description: "Your PDF has been downloaded." });
  } catch (error) {
    console.error("PDF generation failed:", error);
    toast({ 
      title: "Export Failed", 
      description: "There was an issue generating your PDF. You can try the regular Print option.",
      variant: "destructive" 
    });
  }
}
