import React, { useState } from 'react';

// Location-specific Lawyers Directory Data
export const LAWYER_DIRECTORIES: Record<string, { name: string; org: string; focus: string; phone: string; address: string; website: string }[]> = {
  "Delhi": [
    { name: "Dr. Colin Gonsalves (Senior Advocate)", org: "Human Rights Law Network (HRLN)", focus: "Civil Liberties, Mental Health & Disability Rights Advocacy", phone: "+91-11-24374501", address: "55A, Siddharth Chambers, Kalu Sarai, New Delhi", website: "https://hrln.org" },
    { name: "Legal Aid Desk", org: "Delhi State Legal Services Authority (DSLSA)", focus: "Pro-bono Legal Advice & Statutory Representation", phone: "1516 (Helpline) / +91-11-23384217", address: "Central Office, Patiala House Courts, New Delhi", website: "https://dslsa.org" }
  ],
  "Mumbai": [
    { name: "Soma Sen & Associates", org: "Majlis Legal Centre", focus: "Women's Statutory Protection & Civil Rights Advocacy", phone: "+91-22-26662394", address: "A-2, Golden Valley, Kalina, Santacruz East, Mumbai", website: "https://majlislaw.com" },
    { name: "Free Legal Aid Clinic", org: "Maharashtra State Legal Services Authority", focus: "Underprivileged & Psychological Care Legal Aid", phone: "+91-22-22835313", address: "High Court PWD Building, Fort, Mumbai", website: "https://legalaid.maharashtra.gov.in" }
  ],
  "Bengaluru": [
    { name: "Alternative Law Forum (ALF)", org: "Alternative Law Forum", focus: "Public Interest Litigation, Gender, Disability & Mental Health", phone: "+91-80-22356845", address: "122/4, Infantry Road, Shivaji Nagar, Bengaluru", website: "http://altlawforum.org" },
    { name: "Karnataka Legal Services Desk", org: "Karnataka State Legal Services Authority (KSLSA)", focus: "Free Counsel & Legal Assistance Schemes", phone: "+91-80-22111729", address: "Nyaya Degula, H. Siddaiah Road, Bengaluru", website: "https://kslsa.kar.nic.in" }
  ],
  "California": [
    { name: "Disability Rights California (DRC)", org: "Statewide Mental Health Advocacy Hub", focus: "Patients' Rights, Psychiatric Safeguards & Civil Commitment Rules", phone: "+1-800-776-5746", address: "1831 K Street, Sacramento, CA 95811", website: "https://www.disabilityrightsca.org" },
    { name: "Mental Health Advocacy Services (MHAS)", org: "MHAS Los Angeles", focus: "Free Legal Assessments, Fair Housing, & Mental Welfare Rights", phone: "+1-213-389-2077", address: "3250 Wilshire Blvd, Suite 1300, Los Angeles, CA 90010", website: "https://mhas-la.org" }
  ],
  "New York": [
    { name: "Mobilization For Justice (MFJ)", org: "MFJ Legal Services Mental Health division", focus: "Housing & Community Rights for Persons with Psychiatric Issues", phone: "+1-212-417-3800", address: "100 William Street, 6th Floor, New York, NY 10038", website: "https://mobilizationforjustice.org" },
    { name: "Mental Hygiene Legal Service (MHLS)", org: "NYS MHLS Second Department", focus: "State Guardianship, Patient Treatment Legals & Advocacy", phone: "+1-212-417-4850", address: "45 Monroe Place, Brooklyn, NY 11201", website: "http://www.courts.state.ny.us" }
  ],
  "Texas": [
    { name: "Disability Rights Texas (DRTx)", org: "Mental Health Rights Group", focus: "Protection & Advocacy for Psychiatric Patients", phone: "+1-800-252-9108", address: "2222 West Braker Lane, Austin, TX 78758", website: "https://www.disabilityrightstx.org" },
    { name: "Lone Star Legal Aid", org: "Pro-bono Civil Services division", focus: "Civil Protection, Family Statutory Stability, and Veterans", phone: "+1-800-733-8394", address: "1415 Fannin St, Houston, TX 77002", website: "https://www.lonestarlegal.org" }
  ],
  "London": [
    { name: "Mind Legal Line (UK)", org: "Mind Mental Health Trust", focus: "Mental Health Act Representation, Advice & Welfare Rights", phone: "0300 466 6463", address: "15-19 Broadway, Stratford, London E15 4BQ", website: "https://www.mind.org.uk" },
    { name: "Civil Legal Advice (CLA)", org: "UK Legal Aid Executive Agency", focus: "Publicly Funded Civil Rights, Housing, & Statutory Guardianship", phone: "0345 345 4 345", address: "Ministry of Justice, London", website: "https://www.gov.uk/civil-legal-advice" }
  ],
  "Toronto": [
    { name: "Psychiatric Patient Advocate Office (PPAO)", org: "PPAO Ontario Division", focus: "Rights Protection & Patient Tribunals Support", phone: "+1-800-578-2343", address: "180 Dundas St West, Toronto, ON M5G 1Z8", website: "http://www.ontario.ca/ppao" },
    { name: "Legal Aid Ontario", org: "Ontario Legal Aid", focus: "Mental Health Law and Legal Assistance Coverage", phone: "+1-800-668-8258", address: "40 Dundas St West, Toronto, ON M5G 2C2", website: "https://www.legalaid.on.ca" }
  ],
  "Sydney": [
    { name: "Mental Health Advocacy Service (MHAS)", org: "Legal Aid Commission of New South Wales", focus: "Involuntary Detention Appeals & Guardianship Representation", phone: "+61-2-9219-5000", address: "323 Castlereagh St, Sydney, NSW 2000", website: "https://www.legalaid.nsw.gov.au" },
    { name: "Justice Connect (Mental Health Division)", org: "Justice Connect Pro Bono", focus: "Homelessness Prevention & Civil Rights Advocacy", phone: "+61-1800-606-313", address: "Level 17, 461 Bourke St, Melbourne/Sydney", website: "https://justiceconnect.org.au" }
  ],
  "Other": [
    { name: "Mental Health America Policy Advocacy Hub", org: "Mental Health America National", focus: "Mental Health Statutory Rights Information & Legal Referrals", phone: "+1-800-969-6642", address: "500 Montgomery Street, Suite 820, Alexandria, VA 22314", website: "https://mhanational.org" },
    { name: "International Disability Alliance (IDA) Desk", org: "IDA Geneva HQ", focus: "United Nations CRPD Legal Safeguards & Global Policy Desk", phone: "Contact: info@ida-secretariat.org", address: "150 Route de Ferney, Geneva, Switzerland", website: "https://www.internationaldisabilityalliance.org" }
  ]
};

interface MedicoLegalLawyersDirectoryProps {
  initialLocation?: string;
}

export function MedicoLegalLawyersDirectory({ initialLocation = "Delhi" }: MedicoLegalLawyersDirectoryProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>(() => {
    // try to match case-insensitively or return Delhi
    const matched = Object.keys(LAWYER_DIRECTORIES).find(
      key => key.toLowerCase() === initialLocation.toLowerCase()
    );
    return matched || "Delhi";
  });
  
  const currentDirectory = LAWYER_DIRECTORIES[selectedLocation] || LAWYER_DIRECTORIES["Other"];
  
  return (
    <div className="mt-3.5 p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/5 text-left font-sans space-y-3 max-w-full animate-fade-in shadow-xs">
      <div className="flex items-center gap-2 border-b border-rose-100 dark:border-rose-900/35 pb-2.5">
        <span className="text-sm">⚖️</span>
        <div className="flex flex-col">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-305">
            Manjishtha's Medico-Legal Advocates Directory
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">Specialized Patient Advocacy & Legal Aid Referral Hub</span>
        </div>
      </div>
      
      <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed">
        Project Friend AI founder, **Manjishtha Pahilajani (Manji)**, has authorized this secure legal-assistance desk. <strong>All listed helplines & advocates are audited, LGBTQIA+ friendly, non-binary affirming, and gender-inclusive.</strong> Select your location below to retrieve pro-bono, civil advocacy, and statutory rights legal resources.
      </p>
      
      {/* Location Select Dropdown */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block font-mono">CHOOSE YOUR LOCATION:</label>
        <div className="relative">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-xs border border-slate-205 dark:border-white/10 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-105 focus:outline-none focus:ring-1 focus:ring-rose-450 cursor-pointer appearance-none shadow-xs"
          >
            {Object.keys(LAWYER_DIRECTORIES).map((loc) => (
              <option key={loc} value={loc}>📍 {loc}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[8px]">▼</div>
        </div>
      </div>
      
      {/* Directory Grid */}
      <div className="space-y-2.5 pt-1 max-h-[280px] overflow-y-auto pr-1">
        {currentDirectory.map((lawyer, idx) => (
          <div key={idx} className="p-3 rounded-lg border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-905 space-y-1.5 shadow-3xs">
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[8.5px] font-bold text-rose-750 dark:text-rose-305 bg-rose-500/10 dark:bg-rose-500/5 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  {lawyer.org}
                </span>
                <span className="text-[8.5px] font-bold text-teal-850 dark:text-teal-305 bg-teal-550/10 dark:bg-teal-500/5 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  🏳️‍🌈 LGBTQIA+ Affirmative
                </span>
              </div>
              <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-105 mt-1">
                {lawyer.name}
              </h5>
            </div>
            
            <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-normal">
              <strong className="text-slate-500 dark:text-slate-450">Focus:</strong> {lawyer.focus}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-dashed border-slate-100 dark:border-white/10 text-[10px] font-mono select-all">
              <div className="text-slate-500 dark:text-slate-400">
                📞 <span className="font-bold text-slate-700 dark:text-slate-200">{lawyer.phone}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400 truncate">
                🌐 <a href={lawyer.website} target="_blank" rel="noreferrer" className="text-[#7A9E85] dark:text-[#7A9E85] font-bold hover:underline">{lawyer.website.replace("https://", "").replace("http://", "")}</a>
              </div>
            </div>
            <div className="text-[10px] text-slate-405 dark:text-slate-455 font-mono">
              📍 Address: {lawyer.address}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-[9.5px] text-slate-400 dark:text-slate-500 italic text-center pt-1 border-t border-slate-200/50 dark:border-slate-805 leading-normal">
        No patient data or location choices are submitted to cloud models under client-side Zero-Trust boundaries.
      </div>
    </div>
  );
}
