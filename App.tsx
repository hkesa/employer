import React, { useState, useEffect, useCallback } from 'react';
import { FormData, INITIAL_DATA, Language, FamilyMember, OldHelper } from './types';
import { TRANSLATIONS, getLang } from './constants';
import { TextInput, TextArea, Select, Divider, SubSection } from './components/InputFields';

const PreviewSection: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-8 mb-4">
    {title && <h3 className="text-primary font-bold mb-4 border-b-2 border-primary pb-1 text-[21px]">{title}</h3>}
    {children}
  </div>
);

// WhatsApp Logo SVG (Updated to a clearer version)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 inline-block mr-2 align-text-bottom">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const t = getLang(lang);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('formData_v1.5');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('formData_v1.5', JSON.stringify(data));
  }, [data]);

  const handleChange = (field: keyof FormData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear dependent fields logic to avoid contradictions
      if (field === 'roomArrangement') {
        newData.roomSize = '';
        newData.roomShareChild = '';
        newData.roomOther = '';
      }
      
      if (field === 'salaryType') {
        newData.salaryOtherAmount = '';
      }

      if (field === 'foodAllowance') {
        newData.foodAllowanceAmount = '';
      }

      if (field === 'appType') {
        newData.localWorkArrangement = '';
        newData.localVacationDays = '';
        newData.overseasWorkArrangement = '';
        newData.overseasArrivalMonth = '';
      }

      if (field === 'localWorkArrangement') {
        newData.localVacationDays = '';
      }

      if (field === 'overseasWorkArrangement') {
        newData.overseasArrivalMonth = '';
      }

      if (field === 'expectingBaby') {
        newData.babyDueDateMonth = '';
        newData.babyGender = '';
      }

      if (field === 'hasOtherHelpers') {
        if (value === t.options.no || value === '沒有' || value === 'No') {
          newData.oldHelperCount = '';
          newData.oldHelpers = [];
        }
      }

      if (field === 'hasDogs') {
        newData.dogCount = '';
      }

      if (field === 'hasCats') {
        newData.catCount = '';
      }

      if (field === 'hasOtherPets') {
        newData.otherPetDetails = '';
      }

      return newData;
    });
  };

  const handleClear = () => {
    if (confirm(t.clearConfirm)) {
      localStorage.removeItem('formData_v1.5');
      setData(INITIAL_DATA);
      window.scrollTo(0, 0);
    }
  };

  const getFamilyOptions = (lang: Language) => {
    const opts = [0,1,2,3,4,5,6,7,8,9,10,11,12].map(n => n.toString());
    if (lang === 'zh') {
        opts[0] = "0 (只有僱主)";
        opts[1] = "1 (僱主 +1)";
    } else {
        opts[0] = "0 (only employer)";
        opts[1] = "1 (employer +1)";
    }
    return opts;
  };

  const updateFamilyCount = (countStr: string) => {
    const count = parseInt(countStr) || 0;
    const currentMembers = [...data.familyMembers];
    
    // Resize array
    if (count > currentMembers.length) {
      for (let i = currentMembers.length; i < count; i++) {
        currentMembers.push({ id: Date.now() + '_' + i, name: '', yob: '', relation: '', relationOther: '', hkid: '' });
      }
    } else {
      currentMembers.splice(count);
    }
    
    setData(prev => ({ ...prev, familyCount: countStr, familyMembers: currentMembers }));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const newMembers = [...data.familyMembers];
    // Clear dependent field for relation
    if (field === 'relation' && value !== '其他' && value !== 'Other') {
      newMembers[index] = { ...newMembers[index], [field]: value, relationOther: '' };
    } else {
      newMembers[index] = { ...newMembers[index], [field]: value };
    }
    setData(prev => ({ ...prev, familyMembers: newMembers }));
  };

  const updateOldHelperCount = (countStr: string) => {
    const count = parseInt(countStr) || 0;
    const currentHelpers = [...data.oldHelpers];

    if (count > currentHelpers.length) {
      for (let i = currentHelpers.length; i < count; i++) {
        currentHelpers.push({ 
          id: Date.now() + '_' + i, name: '', hkid: '', contractNo: '', 
          visaExpiry: '', employer: '', arrangement: '', handoverDays: '' 
        });
      }
    } else {
      currentHelpers.splice(count);
    }

    setData(prev => ({ ...prev, oldHelperCount: countStr, oldHelpers: currentHelpers }));
  };

  const updateOldHelper = (index: number, field: keyof OldHelper, value: string) => {
    const newHelpers = [...data.oldHelpers];
    // Clear dependent field for arrangement
    if (field === 'arrangement' && 
        value !== t.options.helperArrangement[3] && 
        value !== 'This old helper will be replaced, and a handover period is required' &&
        value !== '此舊外傭走，但想有交接期') {
      newHelpers[index] = { ...newHelpers[index], [field]: value, handoverDays: '' };
    } else {
      newHelpers[index] = { ...newHelpers[index], [field]: value };
    }
    setData(prev => ({ ...prev, oldHelpers: newHelpers }));
  };

  const formatNumber = (value: string) => {
    if (!value) return '';
    // Remove existing commas to parse
    const num = parseFloat(value.replace(/,/g, ''));
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  const handleIncomeBlur = () => {
    setData(prev => ({...prev, income: formatNumber(prev.income)}));
  };

  // Helper to format date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateForWhatsApp = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // WhatsApp Message Generation
  const generateWhatsAppLinks = useCallback(() => {
    let message = t.whatsappPrefix;
    
    const addLine = (label: string, value: string) => {
      const displayVal = (value && value.trim() !== '') ? value : `(${t.empty})`;
      message += `*${label}:* ${displayVal}\n`;
    };

    addLine(t.shortLabels.employerName, data.employerName);
    addLine(t.shortLabels.address, data.address);
    addLine(t.shortLabels.housingType, data.housingType);
    addLine(t.shortLabels.houseSize, data.houseSize);
    addLine(t.shortLabels.bedrooms, data.bedrooms);
    addLine(t.shortLabels.nationality, data.nationality);
    addLine(t.shortLabels.occupation, data.occupation);
    addLine(t.shortLabels.income, data.income); // Already formatted in state
    
    // Gap after Income
    message += "\n";

    addLine(t.shortLabels.roomArrangement, data.roomArrangement);
    if (data.roomArrangement === t.options.roomArrangement[0] || data.roomArrangement === 'Yes, separate room') { // Yes separate
      addLine(t.shortLabels.roomSize, data.roomSize);
    } else if (data.roomArrangement === t.options.roomArrangement[1] || data.roomArrangement === 'Share room with child') { // Share child
      addLine(t.shortLabels.roomShareChild, data.roomShareChild);
    } else if (data.roomArrangement === t.options.roomArrangement[5] || data.roomArrangement === 'Other') { // Other
      addLine(t.shortLabels.roomOther, data.roomOther);
    }

    addLine(t.shortLabels.salaryType, data.salaryType);
    if (data.salaryType === t.options.salary[1] || data.salaryType === 'Other') {
      addLine(t.shortLabels.salaryOtherAmount, data.salaryOtherAmount);
    }

    addLine(t.shortLabels.foodAllowance, data.foodAllowance);
    if (data.foodAllowance === t.options.food[1] || data.foodAllowance === 'With Allowance') {
      addLine(t.shortLabels.foodAllowanceAmount, data.foodAllowanceAmount);
    }

    addLine(t.shortLabels.appType, data.appType);
    if (data.appType === t.options.appType[0] || data.appType === 'HK finish contract／Special case／Contract renewal') {
      addLine(t.shortLabels.localWorkArrangement, data.localWorkArrangement);
      if (data.localWorkArrangement === t.options.localWork[1] || data.localWorkArrangement === 'Home Vacation First, Work Later') {
        addLine(t.shortLabels.localVacationDays, data.localVacationDays);
      }
    } else if (data.appType === t.options.appType[1] || data.appType === 'Overseas Helper') {
      // Logic for English/Chinese Replacements in Export
      let workArr = data.overseasWorkArrangement;
      // English
      if (workArr === 'ASAP (within 4 months)') workArr = 'ASAP';
      if (workArr === 'Arrive in specific month') workArr = 'Specific month';
      // Chinese
      if (workArr === '盡快四個月內') workArr = '盡快';
      
      addLine(t.shortLabels.overseasWorkArrangement, workArr);
      
      if (data.overseasWorkArrangement === t.options.overseasWork[1] || data.overseasWorkArrangement === 'Arrive in specific month') {
        addLine(t.shortLabels.overseasArrivalMonth, data.overseasArrivalMonth);
      }
    }

    // Gap before Family Member Header
    message += "\n";
    addLine(t.shortLabels.familyCount, data.familyCount);
    
    data.familyMembers.forEach((m, i) => {
      // Remove gap before Member 1, but add gap for subsequent members
      message += `*${t.shortLabels.familyMemberTitle.replace('{i}', (i+1).toString())}*\n`;
      addLine(t.shortLabels.fullName, m.name);
      addLine(t.shortLabels.yob, m.yob);
      addLine(t.shortLabels.relation, m.relation);
      if (m.relation === '其他' || m.relation === 'Other') {
        addLine(t.shortLabels.relationOther, m.relationOther);
      }
      addLine(t.shortLabels.hkid, m.hkid);
      message += "\n"; // Gap between members
    });

    // Gap before Expecting Newborn
    // Note: the loop above adds a gap at the end of the last member, so we don't need another one.
    // If no family members, we might want one. But usually family count > 0 is common or at least count is 0.
    if (data.familyMembers.length === 0) message += "\n";
    
    addLine(t.shortLabels.expectingBaby, data.expectingBaby);
    if (data.expectingBaby === t.options.yes || data.expectingBaby === 'Yes') {
      addLine(t.shortLabels.babyDueDateMonth, data.babyDueDateMonth);
      addLine(t.shortLabels.babyGender, data.babyGender);
    }

    addLine(t.shortLabels.hasOtherHelpers, data.hasOtherHelpers);
    if (data.hasOtherHelpers === t.options.yes || data.hasOtherHelpers === 'Yes') {
      addLine(t.shortLabels.oldHelperCount, data.oldHelperCount);
      data.oldHelpers.forEach((h, i) => {
        message += `\n*${t.shortLabels.helperTitle.replace('{i}', (i+1).toString())}*\n`;
        addLine(t.shortLabels.helperName, h.name);
        addLine(t.shortLabels.helperHkid, h.hkid);
        addLine(t.shortLabels.contractNo, h.contractNo);
        // Format date for WhatsApp
        const formattedDate = formatDateForWhatsApp(h.visaExpiry);
        addLine(t.shortLabels.visaExpiry, formattedDate);
        
        addLine(t.shortLabels.helperEmployer, h.employer);
        addLine(t.shortLabels.arrangement, h.arrangement);
        if (h.arrangement === t.options.helperArrangement[3] || h.arrangement === 'This old helper will be replaced, and a handover period is required') {
          addLine(t.shortLabels.handoverDays, h.handoverDays);
        }
      });
    }

    // Gap before Car Wash
    message += "\n";

    addLine(t.shortLabels.carWash, data.carWash);
    
    addLine(t.shortLabels.hasDogs, data.hasDogs);
    if (data.hasDogs === t.options.yes || data.hasDogs === 'Yes') addLine(t.shortLabels.dogCount, data.dogCount);

    addLine(t.shortLabels.hasCats, data.hasCats);
    if (data.hasCats === t.options.yes || data.hasCats === 'Yes') addLine(t.shortLabels.catCount, data.catCount);

    addLine(t.shortLabels.hasOtherPets, data.hasOtherPets);
    if (data.hasOtherPets === t.options.yes || data.hasOtherPets === 'Yes') addLine(t.shortLabels.otherPetDetails, data.otherPetDetails);

    addLine(t.shortLabels.remarks, data.remarks);

    // Split logic
    const LIMIT = 1500;
    const parts: string[] = [];
    let currentPart = "";
    
    message.split('\n').forEach(line => {
      if ((currentPart + line).length > LIMIT) {
        parts.push(currentPart);
        currentPart = line + "\n";
      } else {
        currentPart += line + "\n";
      }
    });
    if (currentPart) parts.push(currentPart);

    return parts;
  }, [data, t]);

  const PreviewItem = ({ label, value }: { label: string, value: string }) => (
    <div className="border-b border-gray-200 pb-3 mb-6 last:border-0">
      <span className="block font-bold text-gray-700 mb-2 text-[21px]">{label}</span>
      <span className="block text-black pl-1 whitespace-pre-wrap text-[21px]">
        {value && value.trim() !== '' ? value : <span className="text-gray-400 italic">({t.empty})</span>}
      </span>
    </div>
  );

  const oldHelperCountOptions = [
    t.options.planningToHire,
    ...[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => n.toString())
  ];

  // --- RENDER ---

  if (view === 'preview') {
    const whatsappParts = generateWhatsAppLinks();
    return (
      <div className="max-w-[800px] mx-auto min-h-screen bg-white shadow-lg p-5">
        <h1 className="text-center text-[#25D366] font-bold mb-6 mt-4 text-[21px]">{t.previewTitle}</h1>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <PreviewItem label={t.labels.employerName} value={data.employerName} />
          <PreviewItem label={t.labels.address} value={data.address} />
          <PreviewItem label={t.labels.housingType} value={data.housingType} />
          <PreviewItem label={t.labels.houseSize} value={data.houseSize} />
          <PreviewItem label={t.labels.bedrooms} value={data.bedrooms} />
          <PreviewItem label={t.labels.nationality} value={data.nationality} />
          <PreviewItem label={t.labels.occupation} value={data.occupation} />
          <PreviewItem label={t.labels.income} value={data.income} />
          
          <PreviewItem label={t.labels.roomArrangement} value={data.roomArrangement} />
          {(data.roomArrangement === t.options.roomArrangement[0] || data.roomArrangement === 'Yes, separate room') && <PreviewItem label={t.labels.roomSize} value={data.roomSize} />}
          {(data.roomArrangement === t.options.roomArrangement[1] || data.roomArrangement === 'Share room with child') && <PreviewItem label={t.labels.roomShareChild} value={data.roomShareChild} />}
          {(data.roomArrangement === t.options.roomArrangement[5] || data.roomArrangement === 'Other') && <PreviewItem label={t.labels.roomOther} value={data.roomOther} />}

          <PreviewItem label={t.labels.salaryType} value={data.salaryType} />
          {(data.salaryType === t.options.salary[1] || data.salaryType === 'Other') && <PreviewItem label={t.labels.salaryOtherAmount} value={data.salaryOtherAmount} />}

          <PreviewItem label={t.labels.foodAllowance} value={data.foodAllowance} />
          {(data.foodAllowance === t.options.food[1] || data.foodAllowance === 'With Allowance') && <PreviewItem label={t.labels.foodAllowanceAmount} value={data.foodAllowanceAmount} />}

          <PreviewItem label={t.labels.appType} value={data.appType} />
          {(data.appType === t.options.appType[0] || data.appType === 'HK finish contract／Special case／Contract renewal') && (
            <>
              <PreviewItem label={t.labels.localWorkArrangement} value={data.localWorkArrangement} />
              {(data.localWorkArrangement === t.options.localWork[1] || data.localWorkArrangement === 'Home Vacation First, Work Later') && 
                <PreviewItem label={t.labels.localVacationDays} value={data.localVacationDays} />
              }
            </>
          )}
          {(data.appType === t.options.appType[1] || data.appType === 'Overseas Helper') && (
            <>
              <PreviewItem label={t.labels.overseasWorkArrangement} value={data.overseasWorkArrangement} />
              {(data.overseasWorkArrangement === t.options.overseasWork[1] || data.overseasWorkArrangement === 'Arrive in specific month') && 
                <PreviewItem label={t.labels.overseasArrivalMonth} value={data.overseasArrivalMonth} />
              }
            </>
          )}

          <Divider />

          <PreviewItem label={t.labels.familyCount} value={data.familyCount} />
          {data.familyMembers.map((m, i) => (
            <PreviewSection key={m.id} title={t.labels.familyMemberTitle.replace('{i}', (i+1).toString())}>
              <PreviewItem label={t.labels.fullName} value={m.name} />
              <PreviewItem label={t.labels.yob} value={m.yob} />
              <PreviewItem label={t.labels.relation} value={m.relation} />
              {(m.relation === '其他' || m.relation === 'Other') && <PreviewItem label={t.labels.relationOther} value={m.relationOther} />}
              <PreviewItem label={t.labels.hkid} value={m.hkid} />
            </PreviewSection>
          ))}

          <PreviewItem label={t.labels.expectingBaby} value={data.expectingBaby} />
          {(data.expectingBaby === t.options.yes || data.expectingBaby === 'Yes') && (
            <>
              <PreviewItem label={t.labels.babyDueDateMonth} value={data.babyDueDateMonth} />
              <PreviewItem label={t.labels.babyGender} value={data.babyGender} />
            </>
          )}

          <Divider />

          <PreviewItem label={t.labels.hasOtherHelpers} value={data.hasOtherHelpers} />
          {(data.hasOtherHelpers === t.options.yes || data.hasOtherHelpers === 'Yes') && (
            <>
              <PreviewItem label={t.labels.oldHelperCount} value={data.oldHelperCount} />
              {data.oldHelpers.map((h, i) => (
                <PreviewSection key={h.id} title={t.labels.helperTitle.replace('{i}', (i+1).toString())}>
                  <PreviewItem label={t.labels.helperName} value={h.name} />
                  <PreviewItem label={t.labels.helperHkid} value={h.hkid} />
                  <PreviewItem label={t.labels.contractNo} value={h.contractNo} />
                  {/* Format date for Preview Page */}
                  <PreviewItem label={t.labels.visaExpiry} value={formatDateForWhatsApp(h.visaExpiry)} />
                  <PreviewItem label={t.labels.helperEmployer} value={h.employer} />
                  <PreviewItem label={t.labels.arrangement} value={h.arrangement} />
                  {(h.arrangement === t.options.helperArrangement[3] || h.arrangement === 'This old helper will be replaced, and a handover period is required') &&
                    <PreviewItem label={t.labels.handoverDays} value={h.handoverDays} />
                  }
                </PreviewSection>
              ))}
            </>
          )}

          <Divider />

          <PreviewItem label={t.labels.carWash} value={data.carWash} />
          <PreviewItem label={t.labels.hasDogs} value={data.hasDogs} />
          {(data.hasDogs === t.options.yes || data.hasDogs === 'Yes') && <PreviewItem label={t.labels.dogCount} value={data.dogCount} />}
          
          <PreviewItem label={t.labels.hasCats} value={data.hasCats} />
          {(data.hasCats === t.options.yes || data.hasCats === 'Yes') && <PreviewItem label={t.labels.catCount} value={data.catCount} />}

          <PreviewItem label={t.labels.hasOtherPets} value={data.hasOtherPets} />
          {(data.hasOtherPets === t.options.yes || data.hasOtherPets === 'Yes') && <PreviewItem label={t.labels.otherPetDetails} value={data.otherPetDetails} />}

          <PreviewItem label={t.labels.remarks} value={data.remarks} />
        </div>

        <button 
          onClick={() => { setView('form'); window.scrollTo(0,0); }}
          className="w-full bg-gray-600 text-white font-bold p-4 rounded-lg hover:opacity-90 transition-all shadow-md text-[21px] mb-4"
        >
          {t.back}
        </button>

        <div className="flex flex-col gap-4 mb-8">
          {whatsappParts.map((part, index) => (
            <button 
              key={index}
              onClick={() => window.open(`https://wa.me/85296111003?text=${encodeURIComponent(part)}`, '_blank')}
              className="w-full bg-[#25D366] text-white font-bold p-4 rounded-lg hover:opacity-90 transition-all shadow-md text-[21px] flex items-center justify-center"
            >
              <WhatsAppIcon />
              {t.exportBtn} {whatsappParts.length > 1 ? `(${index + 1}/${whatsappParts.length})` : ''}
            </button>
          ))}
          {whatsappParts.length > 1 && <p className="text-center text-gray-500 text-sm text-[21px]">{t.exportTip}</p>}
        </div>

        <div className="text-center mt-4 mb-10">
          <span className="inline-block bg-white text-white px-2 py-1 rounded text-sm select-text">V1.14</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto min-h-screen bg-white shadow-lg p-5">
      {/* Top Buttons Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-4">
           <button 
             onClick={() => setLang('zh')} 
             className={`w-full p-4 rounded-lg font-bold text-white text-[24px] transition-opacity hover:opacity-90 shadow-md ${lang === 'zh' ? 'bg-[#4169E1] ring-4 ring-blue-300' : 'bg-[#4169E1]'}`}
           >
             {t.navZh}
           </button>
           <button 
             onClick={() => setLang('en')} 
             className={`w-full p-4 rounded-lg font-bold text-white text-[24px] transition-opacity hover:opacity-90 shadow-md ${lang === 'en' ? 'bg-orange-500 ring-4 ring-orange-300' : 'bg-orange-500'}`}
           >
             {t.navEn}
           </button>
        </div>
        <button 
          onClick={handleClear} 
          className="w-full bg-danger text-white font-bold p-4 rounded-lg hover:opacity-90 transition-all shadow-md text-[21px]"
        >
          {t.clear}
        </button>
      </div>

      <div className="mb-6">
           <h1 className="text-center text-primary font-bold mb-2 text-[30px] leading-tight">{t.title}</h1>
           <h2 className="text-center font-bold text-gray-700 text-[26px]">{t.subTitle}</h2>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8 text-[21px] whitespace-pre-wrap leading-relaxed">
        {t.intro}
      </div>

      <TextInput label={t.labels.employerName} value={data.employerName} onChange={e => handleChange('employerName', e.target.value)} />
      <TextArea label={t.labels.address} value={data.address} onChange={e => handleChange('address', e.target.value)} />
      
      <Select label={t.labels.housingType} options={t.options.housing} placeholder={t.options.pleaseSelect} value={data.housingType} onChange={e => handleChange('housingType', e.target.value)} />
      <TextInput label={t.labels.houseSize} type="number" inputMode="decimal" value={data.houseSize} onChange={e => handleChange('houseSize', e.target.value)} />
      <Select label={t.labels.bedrooms} options={t.options.rooms} placeholder={t.options.pleaseSelect} value={data.bedrooms} onChange={e => handleChange('bedrooms', e.target.value)} />
      
      <TextInput label={t.labels.nationality} value={data.nationality} onChange={e => handleChange('nationality', e.target.value)} />
      <TextInput label={t.labels.occupation} value={data.occupation} onChange={e => handleChange('occupation', e.target.value)} />
      <TextInput label={t.labels.income} inputMode="decimal" value={data.income} onChange={e => handleChange('income', e.target.value)} onBlur={handleIncomeBlur} />
      
      <Divider />

      <Select label={t.labels.roomArrangement} options={t.options.roomArrangement} placeholder={t.options.pleaseSelect} value={data.roomArrangement} onChange={e => handleChange('roomArrangement', e.target.value)} />
      {(data.roomArrangement === t.options.roomArrangement[0] || data.roomArrangement === 'Yes, separate room') && (
         <TextInput label={t.labels.roomSize} type="number" inputMode="decimal" value={data.roomSize} onChange={e => handleChange('roomSize', e.target.value)} />
      )}
      {(data.roomArrangement === t.options.roomArrangement[1] || data.roomArrangement === 'Share room with child') && (
         <TextInput label={t.labels.roomShareChild} value={data.roomShareChild} onChange={e => handleChange('roomShareChild', e.target.value)} />
      )}
      {(data.roomArrangement === t.options.roomArrangement[5] || data.roomArrangement === 'Other') && (
         <TextInput label={t.labels.roomOther} value={data.roomOther} onChange={e => handleChange('roomOther', e.target.value)} />
      )}

      <Select label={t.labels.salaryType} options={t.options.salary} placeholder={t.options.pleaseSelect} value={data.salaryType} onChange={e => handleChange('salaryType', e.target.value)} />
      {(data.salaryType === t.options.salary[1] || data.salaryType === 'Other') && (
         <TextInput label={t.labels.salaryOtherAmount} type="number" inputMode="decimal" value={data.salaryOtherAmount} onChange={e => handleChange('salaryOtherAmount', e.target.value)} />
      )}

      <Select label={t.labels.foodAllowance} options={t.options.food} placeholder={t.options.pleaseSelect} value={data.foodAllowance} onChange={e => handleChange('foodAllowance', e.target.value)} />
      {(data.foodAllowance === t.options.food[1] || data.foodAllowance === 'With Allowance') && (
         <TextInput label={t.labels.foodAllowanceAmount} type="number" inputMode="decimal" value={data.foodAllowanceAmount} onChange={e => handleChange('foodAllowanceAmount', e.target.value)} />
      )}

      {/* Removed Divider here as per V1.12 requirement */}

      <Select label={t.labels.appType} options={t.options.appType} placeholder={t.options.pleaseSelect} value={data.appType} onChange={e => handleChange('appType', e.target.value)} />
      {(data.appType === t.options.appType[0] || data.appType === 'HK finish contract／Special case／Contract renewal') && (
          <>
            <Select label={t.labels.localWorkArrangement} options={t.options.localWork} placeholder={t.options.pleaseSelect} value={data.localWorkArrangement} onChange={e => handleChange('localWorkArrangement', e.target.value)} />
            {(data.localWorkArrangement === t.options.localWork[1] || data.localWorkArrangement === 'Home Vacation First, Work Later') && (
               <TextInput label={t.labels.localVacationDays} type="number" inputMode="decimal" value={data.localVacationDays} onChange={e => handleChange('localVacationDays', e.target.value)} />
            )}
          </>
      )}
      {(data.appType === t.options.appType[1] || data.appType === 'Overseas Helper') && (
          <>
            <Select label={t.labels.overseasWorkArrangement} options={t.options.overseasWork} placeholder={t.options.pleaseSelect} value={data.overseasWorkArrangement} onChange={e => handleChange('overseasWorkArrangement', e.target.value)} />
            {(data.overseasWorkArrangement === t.options.overseasWork[1] || data.overseasWorkArrangement === 'Arrive in specific month') && (
               <Select label={t.labels.overseasArrivalMonth} options={t.options.months} placeholder={t.options.pleaseSelect} value={data.overseasArrivalMonth} onChange={e => handleChange('overseasArrivalMonth', e.target.value)} />
            )}
          </>
      )}
      
      <Divider />
      
      <Select label={t.labels.familyCount} options={getFamilyOptions(lang)} placeholder={t.options.pleaseSelect} value={data.familyCount} onChange={e => updateFamilyCount(e.target.value)} />
      {data.familyMembers.map((m, i) => (
          <SubSection key={m.id} title={t.labels.familyMemberTitle.replace('{i}', (i+1).toString())}>
              <TextInput label={t.labels.fullName} value={m.name} onChange={e => updateFamilyMember(i, 'name', e.target.value)} />
              <TextInput label={t.labels.yob} type="number" inputMode="decimal" value={m.yob} onChange={e => updateFamilyMember(i, 'yob', e.target.value)} />
              <Select label={t.labels.relation} options={t.options.relations} placeholder={t.options.pleaseSelect} value={m.relation} onChange={e => updateFamilyMember(i, 'relation', e.target.value)} />
              {(m.relation === '其他' || m.relation === 'Other') && (
                 <TextInput label={t.labels.relationOther} value={m.relationOther} onChange={e => updateFamilyMember(i, 'relationOther', e.target.value)} />
              )}
              <TextInput label={t.labels.hkid} value={m.hkid} onChange={e => updateFamilyMember(i, 'hkid', e.target.value)} />
          </SubSection>
      ))}

      <Select label={t.labels.expectingBaby} options={[t.options.yes, t.options.no]} placeholder={t.options.pleaseSelect} value={data.expectingBaby} onChange={e => handleChange('expectingBaby', e.target.value)} />
      {(data.expectingBaby === t.options.yes || data.expectingBaby === 'Yes') && (
          <>
            <Select label={t.labels.babyDueDateMonth} options={t.options.months} placeholder={t.options.pleaseSelect} value={data.babyDueDateMonth} onChange={e => handleChange('babyDueDateMonth', e.target.value)} />
            <Select label={t.labels.babyGender} options={t.options.genders} placeholder={t.options.pleaseSelect} value={data.babyGender} onChange={e => handleChange('babyGender', e.target.value)} />
          </>
      )}

      <Divider />
      
      <Select label={t.labels.hasOtherHelpers} options={[t.options.yes, t.options.no]} placeholder={t.options.pleaseSelect} value={data.hasOtherHelpers} onChange={e => handleChange('hasOtherHelpers', e.target.value)} />
      {(data.hasOtherHelpers === t.options.yes || data.hasOtherHelpers === 'Yes') && (
          <>
             <Select label={t.labels.oldHelperCount} options={oldHelperCountOptions} placeholder={t.options.pleaseSelect} value={data.oldHelperCount} onChange={e => updateOldHelperCount(e.target.value)} />
             {data.oldHelpers.map((h, i) => (
                 <SubSection key={h.id} title={t.labels.helperTitle.replace('{i}', (i+1).toString())}>
                     <TextInput label={t.labels.helperName} value={h.name} onChange={e => updateOldHelper(i, 'name', e.target.value)} />
                     <TextInput label={t.labels.helperHkid} value={h.hkid} onChange={e => updateOldHelper(i, 'hkid', e.target.value)} />
                     <TextInput label={t.labels.contractNo} value={h.contractNo} onChange={e => updateOldHelper(i, 'contractNo', e.target.value)} />
                     <TextInput label={t.labels.visaExpiry} type="date" className="no-transition" placeholder="" value={h.visaExpiry} onChange={e => updateOldHelper(i, 'visaExpiry', e.target.value)} />
                     <TextInput label={t.labels.helperEmployer} value={h.employer} onChange={e => updateOldHelper(i, 'employer', e.target.value)} />
                     <Select label={t.labels.arrangement} options={t.options.helperArrangement} placeholder={t.options.pleaseSelect} value={h.arrangement} onChange={e => updateOldHelper(i, 'arrangement', e.target.value)} />
                     {(h.arrangement === t.options.helperArrangement[3] || h.arrangement === 'This old helper will be replaced, and a handover period is required' || h.arrangement === '此舊外傭走，但想有交接期') && (
                        <TextInput label={t.labels.handoverDays} type="number" inputMode="decimal" value={h.handoverDays} onChange={e => updateOldHelper(i, 'handoverDays', e.target.value)} />
                     )}
                 </SubSection>
             ))}
          </>
      )}

      <Divider />
      
      <Select label={t.labels.carWash} options={[t.options.yes, t.options.no]} placeholder={t.options.pleaseSelect} value={data.carWash} onChange={e => handleChange('carWash', e.target.value)} />
      
      <Select label={t.labels.hasDogs} options={[t.options.yes, t.options.no]} placeholder={t.options.pleaseSelect} value={data.hasDogs} onChange={e => handleChange('hasDogs', e.target.value)} />
      {(data.hasDogs === t.options.yes || data.hasDogs === 'Yes') && (
         <TextInput label={t.labels.dogCount} type="number" inputMode="decimal" value={data.dogCount} onChange={e => handleChange('dogCount', e.target.value)} />
      )}
      
      <Select label={t.labels.hasCats} options={[t.options.yes, t.options.no]} placeholder={t.options.pleaseSelect} value={data.hasCats} onChange={e => handleChange('hasCats', e.target.value)} />
      {(data.hasCats === t.options.yes || data.hasCats === 'Yes') && (
         <TextInput label={t.labels.catCount} type="number" inputMode="decimal" value={data.catCount} onChange={e => handleChange('catCount', e.target.value)} />
      )}

      <Select label={t.labels.hasOtherPets} options={[t.options.yes, t.options.no]} placeholder={t.options.pleaseSelect} value={data.hasOtherPets} onChange={e => handleChange('hasOtherPets', e.target.value)} />
      {(data.hasOtherPets === t.options.yes || data.hasOtherPets === 'Yes') && (
         <TextInput label={t.labels.otherPetDetails} value={data.otherPetDetails} onChange={e => handleChange('otherPetDetails', e.target.value)} />
      )}

      <TextArea label={t.labels.remarks} value={data.remarks} onChange={e => handleChange('remarks', e.target.value)} />

      <div className="mt-8 mb-10">
         <button onClick={() => { setView('preview'); window.scrollTo(0,0); }} className="w-full bg-blue-600 text-white font-bold p-4 rounded-lg hover:bg-blue-700 transition-all shadow-md text-[21px]">
            {t.preview}
         </button>
      </div>

      <div className="text-center mt-4 mb-10">
        <span className="inline-block bg-white text-white px-2 py-1 rounded text-sm select-text">V1.14</span>
      </div>
    </div>
  );
}

export default App;