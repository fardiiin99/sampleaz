// Demo data — all names, fees and records are fictional.
window.CC_DATA = (function () {
  const departments = [
    { id: 'medicine', name: 'Medicine', icon: 'stethoscope' },
    { id: 'cardiology', name: 'Cardiology', icon: 'heart' },
    { id: 'pediatrics', name: 'Pediatrics', icon: 'baby' },
    { id: 'gynecology', name: 'Gynecology', icon: 'flower' },
    { id: 'dermatology', name: 'Dermatology', icon: 'sparkle' },
    { id: 'neurology', name: 'Neurology', icon: 'brain' },
    { id: 'orthopedics', name: 'Orthopedics', icon: 'bone' },
    { id: 'ent', name: 'ENT', icon: 'ear' },
    { id: 'psychiatry', name: 'Psychiatry', icon: 'smile' },
    { id: 'gastro', name: 'Gastroenterology', icon: 'pill' },
  ];

  const doctors = [
    { id: 'd1', name: 'Dr. Farhana Rahman', dept: 'medicine', title: 'Associate Professor, Internal Medicine', degrees: 'MBBS, FCPS (Medicine)', hospital: 'Dhaka Medical College Hospital', exp: 14, rating: 4.9, reviews: 1284, fee: 800, followUp: 500, languages: ['Bangla', 'English'], online: true, next: 'Today, 4:30 PM', hue: 152 },
    { id: 'd2', name: 'Dr. Tanvir Ahmed', dept: 'cardiology', title: 'Consultant Cardiologist', degrees: 'MBBS, MD (Cardiology)', hospital: 'National Heart Foundation', exp: 18, rating: 4.9, reviews: 2140, fee: 1200, followUp: 800, languages: ['Bangla', 'English'], online: true, next: 'Today, 6:00 PM', hue: 212 },
    { id: 'd3', name: 'Dr. Nusrat Jahan', dept: 'pediatrics', title: 'Child Specialist & Neonatologist', degrees: 'MBBS, DCH, FCPS (Paediatrics)', hospital: 'Dhaka Shishu Hospital', exp: 11, rating: 4.8, reviews: 967, fee: 900, followUp: 600, languages: ['Bangla', 'English'], online: true, next: 'Today, 5:15 PM', hue: 330 },
    { id: 'd4', name: 'Dr. Sharmin Akter', dept: 'gynecology', title: 'Gynecologist & Obstetrician', degrees: 'MBBS, FCPS (Obs & Gynae)', hospital: 'Square Hospitals', exp: 16, rating: 4.9, reviews: 1532, fee: 1000, followUp: 700, languages: ['Bangla', 'English', 'Hindi'], online: false, next: 'Tomorrow, 10:00 AM', hue: 290 },
    { id: 'd5', name: 'Dr. Imran Hossain', dept: 'dermatology', title: 'Skin & VD Specialist', degrees: 'MBBS, DDV, MD (Dermatology)', hospital: 'BSMMU', exp: 9, rating: 4.7, reviews: 811, fee: 800, followUp: 500, languages: ['Bangla', 'English'], online: true, next: 'Today, 7:30 PM', hue: 28 },
    { id: 'd6', name: 'Dr. Mahmudul Hasan', dept: 'neurology', title: 'Consultant Neurologist', degrees: 'MBBS, MD (Neurology)', hospital: 'National Institute of Neurosciences', exp: 15, rating: 4.8, reviews: 1043, fee: 1200, followUp: 800, languages: ['Bangla', 'English'], online: false, next: 'Tomorrow, 11:30 AM', hue: 260 },
    { id: 'd7', name: 'Dr. Rashed Karim', dept: 'orthopedics', title: 'Orthopedic & Trauma Surgeon', degrees: 'MBBS, MS (Orthopedics)', hospital: 'NITOR', exp: 20, rating: 4.8, reviews: 1390, fee: 1000, followUp: 700, languages: ['Bangla', 'English'], online: true, next: 'Today, 8:00 PM', hue: 190 },
    { id: 'd8', name: 'Dr. Sadia Islam', dept: 'ent', title: 'ENT & Head-Neck Surgeon', degrees: 'MBBS, FCPS (ENT)', hospital: 'Labaid Specialized Hospital', exp: 10, rating: 4.7, reviews: 702, fee: 800, followUp: 500, languages: ['Bangla', 'English'], online: true, next: 'Today, 5:45 PM', hue: 12 },
    { id: 'd9', name: 'Dr. Kamrul Hassan', dept: 'psychiatry', title: 'Psychiatrist & Counselor', degrees: 'MBBS, MD (Psychiatry)', hospital: 'National Institute of Mental Health', exp: 13, rating: 4.9, reviews: 1188, fee: 1000, followUp: 800, languages: ['Bangla', 'English'], online: true, next: 'Today, 9:00 PM', hue: 170 },
    { id: 'd10', name: 'Dr. Ayesha Siddiqua', dept: 'gastro', title: 'Gastroenterologist & Hepatologist', degrees: 'MBBS, MD (Gastroenterology)', hospital: 'BIRDEM General Hospital', exp: 12, rating: 4.8, reviews: 876, fee: 1000, followUp: 700, languages: ['Bangla', 'English'], online: false, next: 'Tomorrow, 3:00 PM', hue: 45 },
    { id: 'd11', name: 'Dr. Mizanur Rahman', dept: 'medicine', title: 'Diabetes & Hormone Specialist', degrees: 'MBBS, FCPS, MD (Endocrinology)', hospital: 'BIRDEM General Hospital', exp: 17, rating: 4.8, reviews: 1655, fee: 1000, followUp: 700, languages: ['Bangla', 'English'], online: true, next: 'Today, 6:30 PM', hue: 120 },
    { id: 'd12', name: 'Dr. Rubina Yasmin', dept: 'cardiology', title: 'Interventional Cardiologist', degrees: 'MBBS, FCPS, FACC', hospital: 'Ibrahim Cardiac Hospital', exp: 19, rating: 4.9, reviews: 1902, fee: 1500, followUp: 1000, languages: ['Bangla', 'English'], online: false, next: 'Tomorrow, 12:00 PM', hue: 230 },
  ];

  const patient = {
    name: 'Arif Chowdhury',
    age: 34,
    sex: 'Male',
    blood: 'B+',
    id: 'CC-204918',
    weight: '72 kg',
    height: "5'8\"",
  };

  // Prescription the doctor writes live during the demo consultation.
  const demoRx = {
    complaints: ['Fever on and off for 4 days', 'Headache and body ache', 'Mild dry cough'],
    vitals: { bp: '120/80', pulse: '92 bpm', temp: '100.8 °F', spo2: '97%' },
    diagnosis: 'Suspected viral fever — rule out dengue',
    medicines: [
      { name: 'Napa Extend 665 mg', generic: 'Paracetamol', dose: '1 + 0 + 1', duration: '5 days', note: 'After meal', price: 2, qty: 10 },
      { name: 'Fexo 120 mg', generic: 'Fexofenadine', dose: '0 + 0 + 1', duration: '7 days', note: 'At night', price: 9, qty: 7 },
      { name: 'Seclo 20 mg', generic: 'Omeprazole', dose: '1 + 0 + 1', duration: '7 days', note: 'Before meal', price: 6, qty: 14 },
      { name: 'Orsaline-N', generic: 'Oral rehydration salt', dose: '1 sachet after loose motion', duration: 'As needed', note: 'Mix in 500 ml water', price: 6, qty: 10 },
    ],
    tests: [
      { name: 'Complete Blood Count (CBC)', price: 400, tat: '6 hrs' },
      { name: 'Dengue NS1 Antigen', price: 500, tat: '6 hrs' },
      { name: 'SGPT (ALT)', price: 400, tat: '12 hrs' },
      { name: 'Urine R/E', price: 250, tat: '6 hrs' },
    ],
    advice: [
      'Drink plenty of fluids — at least 3 litres a day',
      'Take complete rest; avoid strenuous activity',
      'Do not take aspirin or ibuprofen',
      'Come back immediately if bleeding, severe stomach pain or vomiting',
    ],
    referral: { doctorId: 'd10', reason: 'If SGPT is raised — liver evaluation' },
    followUp: 'After 5 days with test reports',
  };

  const history = [
    { id: 'RX-1007', date: '12 Aug 2026', doctorId: 'd5', diagnosis: 'Contact dermatitis', meds: 3 },
    { id: 'RX-0981', date: '28 May 2026', doctorId: 'd8', diagnosis: 'Acute sinusitis', meds: 4 },
    { id: 'RX-0920', date: '03 Feb 2026', doctorId: 'd11', diagnosis: 'Pre-diabetes — lifestyle plan', meds: 1 },
  ];

  return { departments, doctors, patient, demoRx, history };
})();
