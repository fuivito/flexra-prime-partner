import jsPDF from 'jspdf';
import { Agreement } from '@/types';
import { formatCurrency, APR, calculateMonthlyInstalment, calculateTotalInterest } from '@/lib/calculator';
import { format, parseISO } from 'date-fns';
import { en, Translations } from '@/i18n/translations';
import { enUS, Locale as DateFnsLocale } from 'date-fns/locale';

interface PdfOptions {
  t?: Translations;
  dateFnsLocale?: DateFnsLocale;
  currencyLocale?: string;
  currency?: string;
}

export function generateAgreementPDF(agreement: Agreement, opts: PdfOptions = {}) {
  const t = opts.t ?? en;
  const dfLocale = opts.dateFnsLocale ?? enUS;
  const cLocale = opts.currencyLocale ?? 'en-US';
  const cur = opts.currency ?? 'USD';
  const fmt = (amount: number) => formatCurrency(amount, cLocale, cur);

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const navy: [number, number, number] = [15, 23, 42];
  const gray: [number, number, number] = [100, 116, 139];
  const accent: [number, number, number] = [20, 158, 133];
  const black: [number, number, number] = [30, 41, 59];

  // === Header bar ===
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageWidth, 8, 'F');

  y = 25;

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...navy);
  doc.text('FLEXRA', margin, y);

  // Company details top-right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(t.pdf.companyName, pageWidth - margin, y - 8, { align: 'right' });
  doc.text(t.pdf.address, pageWidth - margin, y - 3, { align: 'right' });
  doc.text(t.pdf.contact, pageWidth - margin, y + 2, { align: 'right' });

  y += 15;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...navy);
  doc.text(t.pdf.title, margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(`${t.pdf.agreementRef} ${agreement.id.toUpperCase()}`, margin, y);
  doc.text(`${t.pdf.date} ${format(parseISO(agreement.createdAt), 'dd MMMM yyyy', { locale: dfLocale })}`, pageWidth - margin, y, { align: 'right' });
  y += 12;

  // Divider
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // === Parties section ===
  const drawSection = (title: string, items: [string, string][]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(title, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    items.forEach(([label, value]) => {
      doc.setTextColor(...gray);
      doc.text(label, margin, y);
      doc.setTextColor(...black);
      doc.text(value, margin + 55, y);
      y += 5.5;
    });
    y += 5;
  };

  drawSection(t.pdf.policyholder, [
    [t.pdf.companyLabel, agreement.clientName],
    [t.pdf.agreementStatus, agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)],
  ]);

  drawSection(t.pdf.insurer, [
    [t.pdf.nameLabel, agreement.insurerName],
    [t.pdf.policyPeriod, `${format(parseISO(agreement.policyPeriodStart), 'dd MMM yyyy', { locale: dfLocale })} — ${format(parseISO(agreement.policyPeriodEnd), 'dd MMM yyyy', { locale: dfLocale })}`],
  ]);

  // === Financial Summary ===
  const downPayment = agreement.premiumAmount * (agreement.downPaymentPercent / 100);
  const financed = agreement.premiumAmount - downPayment;
  const apr = APR;
  const totalInterest = calculateTotalInterest(financed, agreement.instalmentCount);
  const totalCustomerPays = downPayment + financed + totalInterest;
  const monthlyPayment = agreement.instalments.length > 0
    ? agreement.instalments[0].amount
    : calculateMonthlyInstalment(financed, agreement.instalmentCount);

  drawSection(t.pdf.financialSummary, [
    [t.pdf.totalPremium, fmt(agreement.premiumAmount)],
    [t.pdf.downPayment, `${agreement.downPaymentPercent}% (${fmt(downPayment)})`],
    [t.pdf.financedAmount, fmt(financed)],
    [t.pdf.aprLabel, `${apr}%`],
    [t.pdf.monthlyPayment, fmt(monthlyPayment)],
    [t.pdf.termLabel, t.pdf.termMonths(agreement.instalmentCount)],
    [t.pdf.totalInterest, fmt(totalInterest)],
    [t.pdf.totalPayable, fmt(totalCustomerPays)],
  ]);

  // === Instalment Schedule ===
  if (agreement.instalments.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(t.pdf.instalmentSchedule, margin, y);
    y += 8;

    // Table header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y - 4, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text(t.pdf.hashSymbol, margin + 3, y);
    doc.text(t.pdf.dueDate, margin + 20, y);
    doc.text(t.pdf.amount, margin + 80, y);
    doc.text(t.pdf.statusLabel, margin + 120, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    agreement.instalments.forEach((inst) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(...black);
      doc.text(inst.number.toString(), margin + 3, y);
      doc.text(format(parseISO(inst.dueDate), 'dd MMM yyyy', { locale: dfLocale }), margin + 20, y);
      doc.text(fmt(inst.amount), margin + 80, y);

      const statusColor: [number, number, number] = inst.status === 'paid' ? [20, 158, 133] : inst.status === 'overdue' ? [220, 38, 38] : gray;
      doc.setTextColor(...statusColor);
      doc.text(inst.status.charAt(0).toUpperCase() + inst.status.slice(1), margin + 120, y);

      y += 5.5;
    });

    y += 5;
  }

  // === Footer ===
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...gray);
  doc.text(t.pdf.disclaimer, margin, y, { maxWidth: contentWidth });
  y += 10;
  doc.text(t.pdf.regulatory, margin, y, { maxWidth: contentWidth });

  // Bottom bar
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(...accent);
  doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

  // Save using blob URL to work in sandboxed iframes
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Flexra-Agreement-${agreement.id.toUpperCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
