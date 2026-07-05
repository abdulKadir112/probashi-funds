'use client';

import { Printer } from 'lucide-react';

export default function ApplicationPrintPad({
  applicationId,
  formData,
  signaturePreview
}) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const formattedDate = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>আবেদন ফরম - ${applicationId || ''}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            
            body { 
              font-family: 'Hind Siliguri', 'SolaimanLipi', Arial, sans-serif; 
              color: #1e293b; 
              background-color: #f1f5f9;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            
            /* Single A4 Page Containment */
            .pad-container { 
              background: #ffffff; 
              padding: 20px 35px; 
              width: 210mm; 
              height: 296mm; 
              margin: 0 auto; 
              position: relative; 
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden; 
              page-break-inside: avoid;
            }

            .main-content { flex-grow: 1; }
            
            /* Header Style */
            .header-layout { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
            
            .left-meta { width: 140px; margin-top: 10px; }
            .badge-title { background: #016938; color: white; text-align: center; font-size: 13px; font-weight: bold; padding: 4px; border-radius: 6px 6px 0 0; }
            .badge-id-box { border: 1px solid #cbd5e1; border-top: none; text-align: center; padding: 4px; font-size: 11px; background: #fff; font-weight: bold; border-radius: 0 0 6px 6px; }
            
            .center-logo { text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .app-logo { height: 70px; width: auto; object-fit: contain; margin-bottom: 3px; }
            .brand-name { font-size: 26px; font-weight: 700; color: #016938; line-height: 1.1; }
            .slogan { font-size: 11px; color: #475569; font-weight: 500; margin-top: 2px; }
            .slogan::before, .slogan::after { content: ' — '; color: #016938; font-weight: bold; }
            
            .right-meta { text-align: right; font-size: 12px; font-weight: bold; margin-top: 10px; width: 140px; }
            .date-badge { background: #f0fdf4; border: 1px dashed #016938; padding: 5px 10px; border-radius: 6px; display: inline-block; }
            
            .divider-dots { text-align: center; margin: 6px 0; color: #016938; font-size: 10px; letter-spacing: 3px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            
            /* Type of Help Bar */
            .title-bar { 
              border: 1px solid #bbf7d0; 
              color: #1e293b; 
              padding: 6px 12px; 
              font-size: 13px; 
              font-weight: bold; 
              border-radius: 6px; 
              margin-bottom: 10px; 
              display: flex; 
              align-items: center; 
              gap: 8px;
              background: #f0fdf4;
            }
            .title-bar span { color: #dc2626; font-size: 13px; font-weight: 700; }
            
            /* Letter Body Text Adjustment */
            .letter-body { font-size: 11px; line-height: 1.5; margin-bottom: 10px; text-align: justify; color: #334155; }
            .letter-body strong { color: #0f172a; }
            
            /* Grid Data Layout Table */
            .section-title { background: #016938; color: white; display: inline-block; padding: 2px 10px; font-size: 10.5px; font-weight: bold; border-radius: 5px 5px 0 0; margin-top: 2px; }
            .info-grid { border: 1px solid #016938; border-radius: 0 6px 6px 6px; padding: 8px 12px; margin-bottom: 10px; background: #fff; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; font-size: 11px; position: relative; }
            .info-grid::after { content: ''; position: absolute; top: 10%; bottom: 10%; left: 50%; width: 1px; border-left: 1px dashed #cbd5e1; }
            .info-item { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dotted #f1f5f9; padding-bottom: 2px; }
            .info-wrapper { display: flex; align-items: center; gap: 4px; }
            .info-label { color: #475569; font-weight: 600; }
            .info-value { width: 55%; font-weight: 700; color: #0f172a; text-align: left; }
            
            /* Reason Container */
            .reason-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; background: #f8fafc; font-size: 11px; line-height: 1.4; margin-bottom: 10px; color: #334155; font-style: italic; }
            
            /* Bottom Cards Split Layout */
            .bottom-flex { display: flex; justify-content: space-between; align-items: stretch; margin-top: 5px; margin-bottom: 10px; }
            .docs-list { border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; width: 56%; font-size: 10.5px; background: #fff; }
            .docs-list strong { color: #016938; display: block; margin-bottom: 3px; }
            .docs-list ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
            .docs-list li::before { content: '✓ '; color: #016938; font-weight: bold; margin-right: 2px; }
            
            .amount-card { border: 1px solid #fecdd3; background: #fff5f5; padding: 8px; text-align: center; border-radius: 8px; width: 40%; display: flex; flex-direction: column; justify-content: center; align-items: center; }
            .amount-val { font-size: 15px; font-weight: bold; color: #dc2626; margin-top: 2px; background: #fff; padding: 1px 8px; border-radius: 20px; border: 1px solid #fee2e2; }
            
            /* Signature Field Positioning */
            .footer-signatures { display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; align-items: flex-end; }
            .sig-block { text-align: center; width: 32%; }
            .sig-center-msg { text-align: center; width: 36%; font-size: 10.5px; font-weight: bold; color: #016938; padding-bottom: 5px; }
            .sig-line { border-top: 1px dashed #94a3b8; margin-top: 3px; padding-top: 3px; font-weight: bold; font-size: 10.5px; }
            .sig-img { max-height: 38px; object-fit: contain; margin-bottom: 2px; display: block; margin-left: auto; margin-right: auto; mix-blend-mode: multiply; }
            
            /* Dark Green Plate Footer */
            .footer-plate { 
              background: #016938; 
              color: white; 
              padding: 6px 15px; 
              margin: 0 -35px -20px -35px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              font-size: 10.5px;
            }
            .footer-plate-left { font-weight: bold; }
            .footer-plate-right { font-size: 10px; opacity: 0.9; }

            /* Print Override Settings - Forces Strict 1 Page Rules */
            @media print {
              @page { 
                size: A4 portrait; 
                margin: 0mm !important; 
              }
              html, body {
                width: 210mm;
                height: 297mm;
                background: #fff;
                margin: 0;
                padding: 0;
              }
              .pad-container { 
                box-shadow: none; 
                border: none;
                border-radius: 0; 
                width: 210mm; 
                height: 297mm; 
                padding: 20px 35px;
                overflow: hidden;
                page-break-inside: avoid;
                page-break-after: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="pad-container">
            <div class="main-content">
              
              <!-- Header Section -->
              <div class="header-layout">
                <div class="left-meta">
                  <div class="badge-title">আবেদন ফরম</div>
                  <div class="badge-id-box">আবেদন আইডি:<br>${applicationId || ''}</div>
                </div>
                
                <div class="center-logo">
                  <img class="app-logo" src="/logo/black Logo3.png" alt="Logo" onerror="this.style.display='none'" />
                  <div class="brand-name">প্রবাসী মুক্ত ফান্ড</div>
                  <div class="slogan">আপনার দান , আমাদের শক্তি</div>
                </div>
                
                <div class="right-meta">
                  <div class="date-badge">তারিখ: ${formattedDate}</div>
                </div>
              </div>
              
              <div class="divider-dots">◆ ❖ ◆</div>
              
              <!-- Type of Assistance -->
              <div class="title-bar">
                <span>💚</span> <strong>সাহায্যের ধরন:</strong> <span>${formData.reasonType || 'উন্নত চিকিৎসার জন্য আর্থিক সহায়তা'}</span>
              </div>
              
              <!-- Application Letter Text -->
              <div class="letter-body">
                <strong>বরাবর,</strong><br>
                সদস্য সচিব,<br>
                প্রবাসী কল্যাণ ও বৈদেশিক কর্মসংস্থান মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, ঢাকা।<br><br>
                <strong>বিষয়: ${formData.reasonType || 'উন্নত চিকিৎসার জন্য'} আর্থিক সহায়তা প্রার্থনা।</strong><br><br>
                <strong>জনাব,</strong><br>
                বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী একজন দরিদ্র ও অসহায় ব্যক্তি। আমি গুরুতর অসুস্থ ও চিকিৎসকদের পরামর্শ অনুযায়ী উন্নত চিকিৎসা প্রয়োজন, যা আমার পক্ষে বহন করা অসম্ভব। চিকিৎসা, যাতায়াত, থাকা ও অন্যান্য প্রয়োজনীয় খরচ নির্বাহের জন্য আপনার আর্থিক অনুদানের মাধ্যমে সাহায্য প্রার্থনা করছি। অতএব, মহোদয়ের নিকট বিনীত অনুরোধ, আমার অসহায়ত্বের কথা বিবেচনা করে আমাকে আর্থিক সহায়তা প্রদান করার জন্য আপনার দৃষ্টি আকর্ষণ করছি।
              </div>
              
              <!-- Applicant Info Box -->
              <div class="section-title">আবেদনকারীর তথ্য</div>
              <div class="info-grid">
                <div class="info-item"><div class="info-wrapper"><span class="info-label">নাম:</span></div><div class="info-value">${formData.name || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">মোবাইল নাম্বার:</span></div><div class="info-value">${formData.phone || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">পিতার নাম:</span></div><div class="info-value">${formData.fatherName || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">এনআইডি (NID):</span></div><div class="info-value">${formData.nid || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">পেশা:</span></div><div class="info-value">${formData.occupation || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">বৈবাহিক অবস্থা:</span></div><div class="info-value">${formData.maritalStatus || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">জন্ম তারিখ:</span></div><div class="info-value">${formData.dob || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">বর্তমান ঠিকানা:</span></div><div class="info-value">গ্রাম: ${formData.village || ''}, ইউনিয়ন: ${formData.union || ''}, উপজেলা: ${formData.upazila || ''}, জেলা: ${formData.district || ''}</div></div>
              </div>
              
              <!-- Medical Details (Conditional) -->
              ${formData.reasonType === 'চিকিৎসা' || formData.illnessName ? `
              <div class="section-title">চিকিৎসা সংক্রান্ত তথ্য</div>
              <div class="info-grid">
                <div class="info-item"><div class="info-wrapper"><span class="info-label">রোগের নাম:</span></div><div class="info-value">${formData.illnessName || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">চিকিৎসার খরচ:</span></div><div class="info-value">৳ ${Number(formData.estimatedCost || 0).toLocaleString('bn-BD')} টাকা</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">চিকিৎসা প্রতিষ্ঠান:</span></div><div class="info-value">${formData.hospitalName || ''}</div></div>
                <div class="info-item"><div class="info-wrapper"><span class="info-label">চিকিৎসার বিবরণ:</span></div><div class="info-value">ডাক্তারের পরামর্শ অনুযায়ী দ্রুত চিকিৎসা প্রয়োজন।</div></div>
              </div>
              ` : ''}

              <!-- Application Reason Details -->
              <div class="section-title">আবেদনের কারণ / বিস্তারিত বিবরণ</div>
              <div class="reason-box">
                "${formData.reasonDetails || 'আমি একজন দরিদ্র ও অসহায় মানুষ। আমার পরিবারের আর্থিক অবস্থা খুবই খারাপ। এত বড় অংকের অর্থ আমার পক্ষে জোগাড় করা সম্ভব নয়। তাই আপনার কাছে বিনীত অনুরোধ, আমাকে উন্নত চিকিৎসার জন্য আর্থিক সহায়তা প্রদান করুন।'}"
              </div>
              
              <!-- Bottom Row: Documents and Amount Split -->
              <div class="bottom-flex">
                <div class="docs-list">
                  <strong>সংযুক্ত কাগজপত্র (যদি থেকে থাকে)</strong>
                  <ul>
                    <li>জাতীয় পরিচয়পত্রের ফটোকপি</li>
                    <li>রোগীর ছবি</li>
                    <li>চিকিৎসকের প্রেসক্রিপশন</li>
                    <li>আয়ের সনদ / গরীব সনদ</li>
                    <li>হাসপাতালের অনুমোদনপত্র</li>
                    <li>অন্যান্য প্রয়োজনীয় কাগজপত্র</li>
                  </ul>
                </div>
                
                <div class="amount-card">
                  <div style="font-weight: 600; color: #475569; font-size: 10.5px;">অনুরোধকৃত আর্থিক সহায়তার পরিমাণ</div>
                  <div class="amount-val">৳ ${Number(formData.amount || 0).toLocaleString('bn-BD')} টাকা মাত্র</div>
                </div>
              </div>

              <!-- Signatures Area -->
              <div class="footer-signatures">
                <div class="sig-block">
                  ${signaturePreview ? `<img class="sig-img" src="${signaturePreview}" alt="Signature" />` : '<div style="height:38px;"></div>'}
                  <div class="sig-line">আবেদনকারীর স্বাক্ষর<br><span style="font-size:9px; color:#64748b;">${formData.name || ''}</span></div>
                </div>
                
                <div class="sig-center-msg">
                  <div style="font-size: 16px; margin-bottom: 2px;">🤝</div>
                  <div>আপনাদের সামান্য সহায়তাই</div>
                  <div>কারও জীবনে নতুন আশা</div>
                </div>
                
                <div class="sig-block">
                  <div style="height:38px;"></div>
                  <div class="sig-line">প্রবাসী মুক্ত ফান্ড এর পক্ষে<br><span style="font-size:9px; color:#64748b;">স্বাক্ষর ও সিল</span></div>
                </div>
              </div>

            </div>

            <!-- Bottom Green Strip/Plate -->
            <div class="footer-plate">
              <div class="footer-plate-left">প্রবাসী মুক্ত ফান্ড — আপনার দান, আমাদের শক্তি</div>
              <div class="footer-plate-right">আবেদন যাচাই করুন: www.probashi-funds.vercel.app</div>
            </div>
            
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Smooth rendering trigger
    printWindow.onload = function() {
      printWindow.print();
    };
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.print();
      }
    }, 400);
  };

  return (
    <button 
      onClick={handlePrint}
      className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md transition-colors"
    >
      <Printer size={14} /> অফিশিয়াল প্যাডে প্রিন্ট করুন
    </button>
  );
}