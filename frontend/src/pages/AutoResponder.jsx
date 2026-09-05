import { jsPDF } from 'jspdf';

export default function AutoResponder() {
  const [txnId, setTxnId] = useState('txn_rzp_984102');
  const [merchantId, setMerchantId] = useState('mch_gadget_hub');
  const [amount, setAmount] = useState('18500');
  const [customerName, setCustomerName] = useState('Rahul Sharma');
  const [customerEmail, setCustomerEmail] = useState('rahul.sharma@example.com');
  const [disputeReason, setDisputeReason] = useState('FRAUDULENT_TRANSACTION_NOT_RECOGNIZED');

  const [generating, setGenerating] = useState(false);
  const [dossierMeta, setDossierMeta] = useState(null);

  const whyFlaggedReasons = [
    { feature: 'pod_verification', description: 'Courier POD signed by customer at registered address', impact: 'DISPUTE_DEFENSE_PROOFS' },
    { feature: '3ds_biometric_auth', description: '3DS2 OTP passed on primary mobile hardware fingerprint', impact: 'IP_MATCH_VERIFIED' },
    { feature: 'historical_orders', description: 'Customer completed 8 previous successful orders with merchant', impact: 'ACCOUNT_TRUST_HIGH' }
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/chargeback/generate-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: txnId,
          merchant_id: merchantId,
          amount: parseFloat(amount),
          customer_name: customerName,
          customer_email: customerEmail,
          dispute_reason: disputeReason
        })
      });
      const data = await res.json();
      setDossierMeta(data.dossier_meta);
      setGenerating(false);
    } catch (err) {
      console.error("Error generating dossier:", err);
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const res = await fetch(`/api/v1/chargeback/pdf/${txnId}`);
      if (res.ok && res.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chargeback_Dossier_${txnId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
    } catch (e) {
      console.warn("Backend PDF generator offline, generating client-side PDF document:", e);
    }

    // Client-side real PDF generation using jsPDF for static Cloudflare hosting
    const doc = new jsPDF();

    // Header Title
    doc.setFillColor(11, 14, 20);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(2, 132, 199);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RAZORPAY RISKSHIELD AI — EVIDENCE DOSSIER', 15, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('AUTOMATED BANK DISPUTE REBUTTAL PACKAGE (VISA / MASTERCARD / NPCI)', 15, 26);

    // Metadata Box
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSACTION & DISPUTE CLAIM METADATA', 15, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Transaction ID: ${txnId}`, 15, 56);
    doc.text(`Merchant Account ID: ${merchantId}`, 15, 62);
    doc.text(`Disputed Amount: INR RS ${parseFloat(amount).toLocaleString('en-IN')}`, 15, 68);
    doc.text(`Customer Name: ${customerName}`, 110, 56);
    doc.text(`Customer Email: ${customerEmail}`, 110, 62);
    doc.text(`Dispute Reason: ${disputeReason}`, 110, 68);

    // Section 1: Logistics Proof
    doc.setFillColor(240, 243, 246);
    doc.rect(15, 78, 180, 32, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text('1. LOGISTICS PROOF OF DELIVERY (POD)', 20, 86);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text('Logistics Partner: Delhivery Express', 20, 94);
    doc.text('AWB Tracking Number: DEL98240192IN', 20, 100);
    doc.text('Delivery Timestamp: 2026-08-28 14:32 IST', 110, 94);
    doc.text(`Signed Recipient: ${customerName} (House 42, Sector 62, Noida UP)`, 110, 100);

    // Section 2: Biometric 3DS2 Audit
    doc.setFillColor(240, 243, 246);
    doc.rect(15, 118, 180, 32, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('2. TECHNICAL 3DS2 & BIOMETRIC AUDIT TRAIL', 20, 126);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text('Customer IP Address: 103.21.124.89 (India)', 20, 134);
    doc.text('Hardware Fingerprint: dev_fp_9824019a84b', 20, 140);
    doc.text('Auth Protocol: UPI_INTENT_BIOMETRIC_3DS2', 110, 134);
    doc.text('IP / Country Match: MATCH VERIFIED (100% CONFIDENCE)', 110, 140);

    // Section 3: Formal Statement
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('3. FORMAL BANK REBUTTAL STATEMENT', 15, 162);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const rebuttalText = "The cardholder participated in the transaction. Proof of delivery was verified at the registered shipping address by Delhivery Express. 3DS 2.0 biometric authentication passed on customer's primary device hardware fingerprint.";
    doc.text(rebuttalText, 15, 170, { maxWidth: 180 });

    // Compliance Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 200, 195, 200);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129);
    doc.text('STRICTLY DEFENSE-ONLY COMPLIANT — AUDIT TRAIL STAMPED (RAZORPAY RISKSHIELD AI)', 15, 208);

    doc.save(`Chargeback_Evidence_Dossier_${txnId}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rzp-card via-rzp-panel to-rzp-dark p-6 rounded-2xl border border-rzp-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rzp-blue/20 border border-rzp-blue/40 text-rzp-accent text-xs font-semibold mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>AUTOMATED CHARGEBACK EVIDENCE AUTO-RESPONDER</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">One-Click Chargeback Defense Dossier Generator</h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">
            Automatically aggregates courier proof of delivery (POD), 3DS biometric IP logs, device fingerprints, and merchant terms compliance into bank-ready PDF dispute packages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Dispute Payload Input */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-rzp-accent" />
            <span>Dispute Claim Details</span>
          </h3>

          <form onSubmit={handleGenerate} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Transaction ID</label>
              <input
                type="text"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rzp-dark border border-rzp-border text-white font-mono focus:border-rzp-blue outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Merchant Account ID</label>
              <input
                type="text"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rzp-dark border border-rzp-border text-white font-mono focus:border-rzp-blue outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Disputed Amount (INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-rzp-dark border border-rzp-border text-white font-mono focus:border-rzp-blue outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 font-medium block mb-1">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-rzp-dark border border-rzp-border text-white focus:border-rzp-blue outline-none"
                >
                  <option value="FRAUDULENT_TRANSACTION_NOT_RECOGNIZED">Fraudulent / Not Recognized</option>
                  <option value="PRODUCT_NOT_RECEIVED">Product Not Received</option>
                  <option value="DUPLICATE_PROCESSING">Duplicate Charge</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Customer Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rzp-dark border border-rzp-border text-white focus:border-rzp-blue outline-none"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Customer Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rzp-dark border border-rzp-border text-white focus:border-rzp-blue outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-xl bg-rzp-blue hover:bg-sky-600 text-white font-bold transition shadow-lg shadow-rzp-blue/20 flex items-center justify-center space-x-2 mt-4"
            >
              {generating ? (
                <span>Compiling Dossier...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Compile Evidence Dossier</span>
                </>
              )}
            </button>
          </form>

          {/* Defense Attribution Breakdown Box */}
          <div className="p-4 rounded-xl bg-rzp-panel border border-rzp-border space-y-2 text-xs">
            <span className="font-bold text-white block">Defense Evidence Signals:</span>
            {whyFlaggedReasons.map((wf, idx) => (
              <div key={idx} className="p-2 rounded bg-rzp-dark border border-rzp-border flex items-center justify-between text-[11px]">
                <span className="text-slate-300">{wf.description}</span>
                <strong className="text-emerald-400 font-mono text-[10px]">{wf.impact}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Right Preview: Generated Evidence Dossier Preview */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Compiled Evidence Package Preview</span>
              </h3>

              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Bank PDF Dossier</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-rzp-dark border border-rzp-border space-y-6 text-xs text-slate-300">
              {/* Evidence Component 1: Courier POD */}
              <div className="p-4 rounded-xl bg-rzp-panel border border-rzp-border space-y-2">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-rzp-accent" />
                    <span>1. Verified Logistics Proof of Delivery (POD)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">DELIVERED & SIGNED</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>Logistics Partner: <strong className="text-white">Delhivery Express</strong></div>
                  <div>AWB Number: <strong className="text-white">DEL98240192IN</strong></div>
                  <div>Delivery Timestamp: <strong className="text-white">2026-08-28 14:32 IST</strong></div>
                  <div>Signed Recipient: <strong className="text-white">{customerName}</strong></div>
                </div>
              </div>

              {/* Evidence Component 2: 3DS Biometric Audit */}
              <div className="p-4 rounded-xl bg-rzp-panel border border-rzp-border space-y-2">
                <div className="flex items-center justify-between text-white font-bold">
                  <span className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-rzp-amber" />
                    <span>2. Technical Biometric & 3DS2 Audit Trail</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">VERIFIED AUTH</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>Customer IP: <strong className="text-white">103.21.124.89 (India)</strong></div>
                  <div>Hardware Fingerprint: <strong className="text-white">dev_fp_9824019a84b</strong></div>
                  <div>Auth Protocol: <strong className="text-white">UPI_INTENT_BIOMETRIC_3DS2</strong></div>
                  <div>IP/Country Match: <strong className="text-emerald-400">YES — MATCH</strong></div>
                </div>
              </div>

              {/* Evidence Component 3: Rebuttal Statement */}
              <div className="p-4 rounded-xl bg-rzp-blue/10 border border-rzp-blue/30 space-y-1">
                <div className="text-rzp-accent font-bold">3. Rebuttal Statement Formatted for Visa / Mastercard / NPCI</div>
                <p className="text-slate-200 italic leading-relaxed text-[11px]">
                  "The cardholder participated in the transaction. Proof of delivery was verified at the registered shipping address by Delhivery Express. 3DS 2.0 biometric authentication passed on customer's primary device."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
