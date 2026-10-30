import type { AppLanguage } from "@/lib/language";

export const TERMS_ACCEPTED_KEY = "pb-diwali-quiz:terms-accepted";

export type TermsSection = {
  n: number;
  title: string;
  body: string;
};

export type TermsCopy = {
  brand: string;
  heading: string;
  sections: TermsSection[];
};

const en: TermsCopy = {
  brand: "Potato Bazaar Diwali Quiz 2026",
  heading: "Terms & Conditions",
  sections: [
    {
      n: 1,
      title: "Contest Period",
      body: "The Potato Bazaar Diwali Quiz runs from 1 to 10 November 2026. A new quiz will be available daily. Registered users may attempt each day’s quiz once through the latest Potato Bazaar app. Participation is free.",
    },
    {
      n: 2,
      title: "Eligibility",
      body: "Participants must be registered on the Potato Bazaar app with a valid mobile number. One person may use only one account. Employees and team members directly involved in administering the contest are not eligible for prizes. Participation constitutes acceptance of these terms.",
    },
    {
      n: 3,
      title: "Prizes",
      body: "Overall prizes (based on the 10-day performance): First ₹10,000; Second ₹5,000; Third ₹2,000. Daily prizes: One winner will receive ₹1,000 each day. Consolation prizes: five winners receive ₹500 each. All awards are subject to verification.",
    },
    {
      n: 4,
      title: "Overall Prize Eligibility",
      body: "To qualify for an overall prize, a participant must attempt quizzes on at least five different days. Those participating on fewer than five days are ineligible for overall prizes. Scores from all attempted days will be added. A daily prize winner may also win an overall prize if eligible.",
    },
    {
      n: 5,
      title: "Selection and Tie-Breakers",
      body: "Daily winners are ranked by that day’s score; tied scores are ranked by the shorter quiz completion time. Overall winners are ranked by cumulative scores across all attempted days, among those who participated on at least five days. If overall scores tie, the shorter combined completion time across all attempted quizzes ranks higher. If both score and time are identical, a computerised random draw will determine ranking. Five consolation winners will be selected by random draw from eligible participants who did not win an overall prize.",
    },
    {
      n: 6,
      title: "Leaderboard and Results",
      body: "Any in-app leaderboard is provisional. Final rankings will be based on verified official system records. The organisers will endeavour to announce winners by 30 November 2026. Results may be published in the app, on the website or through official channels.",
    },
    {
      n: 7,
      title: "Individual Contact with Winners",
      body: "The authorised Potato Bazaar team will contact selected winners individually via their registered number, phone, WhatsApp or another official channel. Winners must provide requested information and documents within the communicated timeframe. If a winner cannot be reached despite reasonable attempts or fails verification, the prize may be withheld or cancelled and an alternate eligible winner selected under the applicable rules.",
    },
    {
      n: 8,
      title: "Documents and Verification",
      body: "Winners may need to provide their full name, registered mobile number, Aadhaar or other government-issued identity proof, PAN where required, bank account holder name, account number and IFSC. A cancelled cheque, passbook or further verification documents may be requested. False or misleading information may lead to cancellation. Documents should be shared only through authorised channels.",
    },
    {
      n: 9,
      title: "TDS and Taxes",
      body: "Cash prizes are subject to TDS and other statutory deductions under applicable Indian income tax law. The applicable rate, calculation and any threshold will depend on the legal classification of the winnings and the rules in force at payment. PAN and tax details may be requested where necessary. Only the net amount after applicable deductions will be paid. Winners are responsible for any additional personal tax liability.",
    },
    {
      n: 10,
      title: "Prize Payment",
      body: "Prizes will be paid only by electronic transfer to verified bank accounts; no cash payments will be made. Prizes are non-transferable. Payment follows identity, eligibility, bank and statutory verification. Banking or verification processes may cause delays.",
    },
    {
      n: 11,
      title: "Fair Play",
      body: "Multiple accounts, bots, scripts, hacking, score/time manipulation and other unfair methods are prohibited. The organisers may review relevant technical records. Fraud or rule violations may result in disqualification and prize cancellation.",
    },
    {
      n: 12,
      title: "Technical Issues",
      body: "Participants are responsible for their devices, app versions and connectivity. A further attempt is not guaranteed after an interruption. Incorrect scores or rankings may be corrected using verified system records. Unavoidable technical or operational circumstances may require changes, postponement or cancellation.",
    },
    {
      n: 13,
      title: "Organiser Rights",
      body: "Potato Bazaar may verify eligibility and results and reasonably modify contest rules, timing or payment procedures when necessary. Material changes will be communicated through official channels. Decisions remain subject to applicable law.",
    },
    {
      n: 14,
      title: "Consent and Privacy",
      body: "Participation signifies acceptance of these terms. Registration details, scores and completion times may be processed to administer the contest. Winners’ names and prize details may be published for result announcements. Personal and banking information will be handled for verification, payment and legal compliance under applicable privacy rules.",
    },
    {
      n: 15,
      title: "Support and Safety",
      body: "For questions or complaints, use the Help/Support section in the Potato Bazaar app. Participation is free; no advance fee is required to claim a prize. Never share an OTP, password or UPI PIN. Organiser: Potato Bazaar | Operating entity: Future Agri Innovation Labs LLP.",
    },
  ],
};

const hi: TermsCopy = {
  brand: "Potato Bazaar दिवाली क्विज़ 2026",
  heading: "नियम एवं शर्तें",
  sections: [
    {
      n: 1,
      title: "प्रतियोगिता की अवधि",
      body: "Potato Bazaar दिवाली क्विज़ 1 से 10 नवंबर 2026 तक आयोजित होगा। हर दिन नया क्विज़ उपलब्ध होगा। प्रतिभागी नवीनतम Potato Bazaar ऐप से प्रतिदिन केवल एक बार क्विज़ खेल सकते हैं। भागीदारी निःशुल्क है।",
    },
    {
      n: 2,
      title: "पात्रता",
      body: "प्रतिभागी का Potato Bazaar ऐप पर वैध मोबाइल नंबर से पंजीकृत होना आवश्यक है। एक व्यक्ति केवल एक खाते से भाग ले सकता है। प्रतियोगिता के संचालन से सीधे जुड़े कर्मचारी और आयोजन टीम पुरस्कार के पात्र नहीं होंगे। भाग लेने का अर्थ इन नियमों की स्वीकृति है।",
    },
    {
      n: 3,
      title: "पुरस्कार",
      body: "मुख्य पुरस्कार (10 दिनों के कुल प्रदर्शन पर): प्रथम ₹10,000; द्वितीय ₹5,000; तृतीय ₹2,000। दैनिक पुरस्कार: हर दिन एक विजेता को ₹1,000 मिलेंगे। सांत्वना पुरस्कार: 5 विजेताओं को ₹500 प्रत्येक। सभी पुरस्कार सत्यापन के अधीन हैं।",
    },
    {
      n: 4,
      title: "मुख्य पुरस्कारों की पात्रता",
      body: "मुख्य पुरस्कार के लिए कम से कम 5 अलग-अलग दिनों के क्विज़ में भाग लेना अनिवार्य है। 5 दिनों से कम भाग लेने वाले मुख्य पुरस्कार के पात्र नहीं होंगे। भाग लिए गए सभी दिनों के अंक जोड़कर कुल स्कोर बनाया जाएगा। दैनिक पुरस्कार जीतने वाला प्रतिभागी मुख्य पुरस्कार भी जीत सकता है, यदि वह पात्रता पूरी करता है।",
    },
    {
      n: 5,
      title: "विजेताओं का चयन एवं टाई-ब्रेकर",
      body: "दैनिक रैंकिंग उस दिन के अंकों के आधार पर होगी; समान अंक होने पर कम समय में क्विज़ पूरा करने वाले को ऊँची रैंक मिलेगी। मुख्य रैंकिंग कम से कम 5 दिनों में भाग लेने वाले प्रतिभागियों के सभी प्रयासों के कुल अंकों पर आधारित होगी। मुख्य रैंकिंग में समान कुल अंक होने पर भाग लिए गए सभी क्विज़ का कुल समय देखा जाएगा; कम समय वाले को ऊँची रैंक मिलेगी। अंक और समय दोनों समान होने पर कंप्यूटर आधारित रैंडम ड्रॉ से रैंक तय होगी। सांत्वना पुरस्कार के लिए मुख्य पुरस्कार न जीतने वाले पात्र प्रतिभागियों में से 5 का रैंडम ड्रॉ होगा।",
    },
    {
      n: 6,
      title: "लीडरबोर्ड और परिणाम",
      body: "ऐप पर उपलब्ध लीडरबोर्ड की रैंकिंग अस्थायी होगी। अंतिम रैंकिंग आधिकारिक सिस्टम रिकॉर्ड और सत्यापन पर आधारित होगी। आयोजक 30 नवंबर 2026 तक विजेताओं की घोषणा करने का प्रयास करेंगे। परिणाम ऐप, वेबसाइट या आधिकारिक संचार माध्यमों पर प्रकाशित हो सकते हैं।",
    },
    {
      n: 7,
      title: "विजेताओं से संपर्क",
      body: "Potato Bazaar की अधिकृत टीम चयनित विजेताओं से उनके पंजीकृत नंबर पर फोन, WhatsApp या अन्य आधिकारिक माध्यम से व्यक्तिगत संपर्क करेगी। बताई गई समय-सीमा में जानकारी और दस्तावेज़ देना आवश्यक होगा। उचित प्रयासों के बाद भी संपर्क न होने या सत्यापन पूरा न होने पर पुरस्कार रोका/रद्द किया जा सकता है और नियमों के अनुसार अगले पात्र विजेता का चयन किया जा सकता है।",
    },
    {
      n: 8,
      title: "आवश्यक दस्तावेज़",
      body: "विजेताओं को पूरा नाम, पंजीकृत मोबाइल नंबर, आधार या अन्य सरकारी पहचान पत्र, जहाँ आवश्यक हो PAN, बैंक खाताधारक का नाम, खाता संख्या और IFSC देना पड़ सकता है। आवश्यकता पड़ने पर कैंसिल चेक/पासबुक या अतिरिक्त सत्यापन दस्तावेज़ माँगे जा सकते हैं। गलत या भ्रामक विवरण देने पर पुरस्कार रद्द हो सकता है। दस्तावेज़ केवल अधिकृत माध्यम से साझा करें।",
    },
    {
      n: 9,
      title: "TDS और कर",
      body: "नकद पुरस्कारों पर लागू भारतीय आयकर कानूनों के अनुसार TDS एवं अन्य वैधानिक कटौतियाँ की जाएँगी। लागू दर, कर की गणना और किसी सीमा का निर्धारण पुरस्कार की कानूनी श्रेणी एवं भुगतान के समय लागू नियमों के अनुसार होगा। आवश्यक होने पर PAN और कर संबंधी विवरण माँगे जाएँगे। लागू कटौती के बाद शेष राशि दी जाएगी। अन्य व्यक्तिगत कर देनदारी विजेता की होगी।",
    },
    {
      n: 10,
      title: "पुरस्कार भुगतान",
      body: "पुरस्कार केवल सत्यापित बैंक खाते में इलेक्ट्रॉनिक बैंक ट्रांसफर से दिए जाएँगे; नकद भुगतान नहीं होगा। पुरस्कार किसी अन्य व्यक्ति को हस्तांतरित नहीं किया जा सकता। पहचान, पात्रता, बैंक विवरण और वैधानिक जाँच पूरी होने के बाद भुगतान होगा। बैंकिंग/सत्यापन के कारण देरी संभव है।",
    },
    {
      n: 11,
      title: "निष्पक्षता और प्रतिबंध",
      body: "एक से अधिक खाते, बॉट, स्क्रिप्ट, हैकिंग, समय/अंक में छेड़छाड़ या अन्य अनुचित साधन प्रतिबंधित हैं। आयोजक तकनीकी रिकॉर्ड की जाँच कर सकते हैं। धोखाधड़ी या नियम उल्लंघन पर प्रतिभागी को अयोग्य घोषित कर पुरस्कार रद्द किया जा सकता है।",
    },
    {
      n: 12,
      title: "तकनीकी समस्याएँ",
      body: "प्रतिभागी अपने डिवाइस, ऐप और इंटरनेट कनेक्शन के लिए जिम्मेदार हैं। तकनीकी रुकावट पर दोबारा प्रयास मिलना सुनिश्चित नहीं है। त्रुटिपूर्ण स्कोर या रैंकिंग को सत्यापित सिस्टम रिकॉर्ड के अनुसार सुधारा जा सकता है। अपरिहार्य परिस्थितियों में प्रतियोगिता बदली, स्थगित या रद्द की जा सकती है।",
    },
    {
      n: 13,
      title: "आयोजक के अधिकार",
      body: "Potato Bazaar पात्रता और परिणाम सत्यापित कर सकता है तथा आवश्यक होने पर नियम, समय-सारणी या भुगतान प्रक्रिया में उचित बदलाव कर सकता है। महत्वपूर्ण बदलाव आधिकारिक माध्यमों से बताए जाएँगे। निर्णय लागू कानून के अधीन होंगे।",
    },
    {
      n: 14,
      title: "सहमति और गोपनीयता",
      body: "भाग लेकर प्रतिभागी इन शर्तों को स्वीकार करते हैं। प्रतियोगिता संचालन हेतु पंजीकरण, स्कोर और समय संबंधी जानकारी संसाधित की जा सकती है। विजेताओं के नाम और पुरस्कार विवरण घोषित किए जा सकते हैं। व्यक्तिगत/बैंक विवरण का उपयोग सत्यापन, भुगतान और कानूनी अनुपालन हेतु लागू गोपनीयता नियमों के अनुसार होगा।",
    },
    {
      n: 15,
      title: "सहायता और सुरक्षा",
      body: "प्रश्न या शिकायत के लिए Potato Bazaar ऐप के Help/Support सेक्शन का उपयोग करें। भागीदारी निःशुल्क है; पुरस्कार पाने के लिए कोई अग्रिम शुल्क नहीं लिया जाएगा। OTP, पासवर्ड या UPI PIN किसी से साझा न करें। आयोजक: Potato Bazaar | संचालक संस्था: Future Agri Innovation Labs LLP।",
    },
  ],
};

const gu: TermsCopy = {
  brand: "Potato Bazaar દિવાળી ક્વિઝ 2026",
  heading: "નિયમો અને શરતો",
  sections: [
    {
      n: 1,
      title: "સ્પર્ધાનો સમયગાળો",
      body: "Potato Bazaar દિવાળી ક્વિઝ 1 થી 10 નવેમ્બર 2026 દરમિયાન યોજાશે. દરરોજ નવી ક્વિઝ ઉપલબ્ધ થશે. નોંધાયેલા વપરાશકર્તાઓ એપના નવીનતમ વર્ઝન દ્વારા દરરોજ માત્ર એક જ વાર ક્વિઝ રમી શકશે. ભાગ લેવો સંપૂર્ણપણે મફત છે.",
    },
    {
      n: 2,
      title: "પાત્રતા",
      body: "ભાગ લેનાર વ્યક્તિનો માન્ય મોબાઇલ નંબર સાથે Potato Bazaar એપમાં નોંધાયેલ હોવો જરૂરી છે. એક વ્યક્તિ માત્ર એક જ એકાઉન્ટથી ભાગ લઈ શકશે. સ્પર્ધાના આયોજન અને સંચાલનમાં સીધા સંકળાયેલા કર્મચારીઓ અને ટીમના સભ્યો ઇનામ માટે પાત્ર નહીં હોય. ભાગ લેવાથી આ શરતો સ્વીકારેલી ગણાશે.",
    },
    {
      n: 3,
      title: "ઇનામો",
      body: "મુખ્ય ઇનામો (10 દિવસના પ્રદર્શનના આધારે): પ્રથમ ₹10,000; દ્વિતીય ₹5,000; તૃતીય ₹2,000. દૈનિક ઇનામો: દરરોજ એક વિજેતાને ₹1,000 મળશે. સાંત્વના ઇનામો: 5 વિજેતાઓને ₹500 દરેક. તમામ ઇનામો ચકાસણીને આધીન છે.",
    },
    {
      n: 4,
      title: "મુખ્ય ઇનામ માટેની પાત્રતા",
      body: "મુખ્ય ઇનામ મેળવવા માટે 10 દિવસમાંથી ઓછામાં ઓછા 5 અલગ-અલગ દિવસની ક્વિઝમાં ભાગ લેવો ફરજિયાત છે. 5 દિવસથી ઓછા ભાગ લેનાર મુખ્ય ઇનામ માટે પાત્ર નહીં હોય. ભાગ લીધેલા તમામ દિવસોના ગુણ જોડવામાં આવશે. દૈનિક ઇનામ જીતનાર વ્યક્તિ પાત્રતા પૂરી કરે તો મુખ્ય ઇનામ પણ જીતી શકે છે.",
    },
    {
      n: 5,
      title: "વિજેતાઓની પસંદગી અને ટાઇ-બ્રેકર",
      body: "દૈનિક ક્રમ તે દિવસના ગુણ પર આધારિત રહેશે; સમાન ગુણ હોય તો ઓછા સમયમાં ક્વિઝ પૂર્ણ કરનારને ઊંચો ક્રમ મળશે. મુખ્ય ક્રમ ઓછામાં ઓછા 5 દિવસ ભાગ લેનારના તમામ પ્રયાસોના કુલ ગુણ પર આધારિત રહેશે. મુખ્ય ક્રમમાં ગુણ સમાન હોય તો તમામ રમેલી ક્વિઝ પૂર્ણ કરવામાં લાગેલા કુલ સમયની સરખામણી થશે; ઓછો સમય લેનાર આગળ રહેશે. ગુણ અને સમય બંને સમાન હોય તો કમ્પ્યુટરાઇઝ્ડ રેન્ડમ ડ્રો દ્વારા ક્રમ નક્કી થશે. મુખ્ય ઇનામ ન જીતેલા પાત્ર ભાગ લેનારાઓમાંથી રેન્ડમ ડ્રો દ્વારા 5 સાંત્વના વિજેતાઓ પસંદ થશે.",
    },
    {
      n: 6,
      title: "લીડરબોર્ડ અને પરિણામ",
      body: "એપમાં દર્શાવાતું લીડરબોર્ડ પ્રાથમિક રહેશે. અંતિમ ક્રમ સત્તાવાર સિસ્ટમ રેકોર્ડની ચકાસણીના આધારે નક્કી થશે. આયોજકો 30 નવેમ્બર 2026 સુધીમાં વિજેતાઓ જાહેર કરવાનો પ્રયત્ન કરશે. પરિણામ એપ, વેબસાઇટ અથવા સત્તાવાર માધ્યમો પર જાહેર થઈ શકે છે.",
    },
    {
      n: 7,
      title: "વિજેતાઓનો વ્યક્તિગત સંપર્ક",
      body: "Potato Bazaar ની અધિકૃત ટીમ પસંદ થયેલા વિજેતાઓનો નોંધાયેલા નંબર, ફોન, WhatsApp અથવા અન્ય સત્તાવાર માધ્યમથી વ્યક્તિગત સંપર્ક કરશે. જણાવેલી સમયમર્યાદામાં માહિતી અને દસ્તાવેજો આપવા પડશે. યોગ્ય પ્રયત્નો છતાં સંપર્ક ન થાય અથવા ચકાસણી પૂર્ણ ન થાય તો ઇનામ અટકાવી અથવા રદ કરી શકાય છે અને નિયમ મુજબ અન્ય પાત્ર વિજેતા પસંદ થઈ શકે છે.",
    },
    {
      n: 8,
      title: "જરૂરી દસ્તાવેજો અને ચકાસણી",
      body: "વિજેતાઓએ પૂરું નામ, નોંધાયેલ મોબાઇલ નંબર, આધાર અથવા અન્ય સરકારી ઓળખપત્ર, જરૂરી હોય ત્યાં PAN, બેંક ખાતાધારકનું નામ, ખાતા નંબર અને IFSC આપવાના રહી શકે છે. જરૂરી જણાય તો કેન્સલ ચેક, પાસબુક અથવા વધારાના પુરાવા માગી શકાય છે. ખોટી અથવા ભ્રામક માહિતીથી ઇનામ રદ થઈ શકે છે. દસ્તાવેજો માત્ર અધિકૃત માધ્યમથી આપો.",
    },
    {
      n: 9,
      title: "TDS અને કર",
      body: "રોકડ ઇનામો પર લાગુ ભારતીય આવકવેરા કાયદા મુજબ TDS અને અન્ય કાયદેસરની કપાત લાગુ પડશે. લાગુ દર, ગણતરી અને કોઈ મર્યાદા હોય તો તે જીતની કાનૂની શ્રેણી તથા ચુકવણી સમયે લાગુ નિયમો પર આધારિત રહેશે. જરૂર પડે ત્યારે PAN અને કર સંબંધિત વિગતો માગવામાં આવશે. લાગુ કપાત બાદ બાકી રકમ ચૂકવાશે. અન્ય વ્યક્તિગત કર જવાબદારી વિજેતાની રહેશે.",
    },
    {
      n: 10,
      title: "ઇનામની ચુકવણી",
      body: "ઇનામ માત્ર ચકાસાયેલા બેંક ખાતામાં ઇલેક્ટ્રોનિક ટ્રાન્સફરથી ચૂકવાશે; રોકડ ચુકવણી નહીં થાય. ઇનામ અન્ય વ્યક્તિને ટ્રાન્સફર કરી શકાશે નહીં. ઓળખ, પાત્રતા, બેંક અને કાયદેસરની ચકાસણી પછી ચુકવણી થશે. બેંકિંગ અથવા ચકાસણીને કારણે વિલંબ થઈ શકે છે.",
    },
    {
      n: 11,
      title: "નિષ્પક્ષ ભાગીદારી",
      body: "એકથી વધુ એકાઉન્ટ, બોટ, સ્ક્રિપ્ટ, હેકિંગ, ગુણ/સમયમાં ચેડાં અથવા અન્ય અયોગ્ય રીતો પ્રતિબંધિત છે. આયોજકો ટેક્નિકલ રેકોર્ડ તપાસી શકે છે. છેતરપિંડી અથવા નિયમભંગ થાય તો ભાગ લેનારને ગેરલાયક ઠરાવી ઇનામ રદ કરી શકાય છે.",
    },
    {
      n: 12,
      title: "ટેક્નિકલ સમસ્યાઓ",
      body: "પોતાના ઉપકરણ, એપ અને ઇન્ટરનેટ કનેક્શન માટે ભાગ લેનાર જવાબદાર છે. ક્વિઝ વચ્ચે અટકે તો ફરી પ્રયાસ મળશે તેની ખાતરી નથી. ખોટા ગુણ અથવા ક્રમને ચકાસાયેલા સિસ્ટમ રેકોર્ડ મુજબ સુધારી શકાય છે. અનિવાર્ય પરિસ્થિતિમાં સ્પર્ધા બદલી, મુલતવી અથવા રદ થઈ શકે છે.",
    },
    {
      n: 13,
      title: "આયોજકના અધિકારો",
      body: "Potato Bazaar પાત્રતા અને પરિણામ ચકાસી શકે છે અને જરૂર પડે ત્યારે નિયમો, સમય અથવા ચુકવણી પ્રક્રિયામાં યોગ્ય ફેરફાર કરી શકે છે. મહત્વપૂર્ણ ફેરફારો સત્તાવાર માધ્યમથી જણાવાશે. તમામ નિર્ણયો લાગુ કાયદાને આધીન રહેશે.",
    },
    {
      n: 14,
      title: "સંમતિ અને ગોપનીયતા",
      body: "ભાગ લેવાથી આ શરતોની સંમતિ આપવામાં આવે છે. સ્પર્ધા સંચાલન માટે નોંધણી વિગતો, ગુણ અને સમયની માહિતીનો ઉપયોગ થઈ શકે છે. પરિણામ જાહેર કરવા વિજેતાઓના નામ અને ઇનામની વિગતો પ્રકાશિત થઈ શકે છે. વ્યક્તિગત અને બેંક માહિતીનો ઉપયોગ ચકાસણી, ચુકવણી અને કાયદાકીય પાલન માટે લાગુ ગોપનીયતા નિયમો અનુસાર થશે.",
    },
    {
      n: 15,
      title: "મદદ અને સુરક્ષા",
      body: "પ્રશ્નો અથવા ફરિયાદ માટે Potato Bazaar એપના Help/Support વિભાગનો ઉપયોગ કરો. ભાગ લેવો મફત છે; ઇનામ મેળવવા કોઈ આગોતરી ફી લેવામાં આવતી નથી. OTP, પાસવર્ડ અથવા UPI PIN કોઈને આપશો નહીં. આયોજક: Potato Bazaar | સંચાલક સંસ્થા: Future Agri Innovation Labs LLP.",
    },
  ],
};

/** Hindi and Gujarati when the app language is hi/gu; every other language uses English. */
export function termsCopy(lang: AppLanguage): TermsCopy {
  if (lang === "hi") return hi;
  if (lang === "gu") return gu;
  return en;
}
