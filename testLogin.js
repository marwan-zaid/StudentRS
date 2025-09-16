const fetch = require('node-fetch');
const { API_URL } = require('./config');

async function saveStudent() {
  const student = {
    studentId: "123456789",
    "اسم_الطالب": "أحمد",
    "اسم_الأم": "فاطمة",
    "تاريخ_الميلاد": "2005-03-15",
    "رقم_الواتس_بالمقدمة": "0591234567",
    "المنطقة": "الخليل",
    updatedBy: "marwan"
  };

  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(student),
    headers: {"Content-Type": "application/json"}
  });

  const data = await res.json();
  console.log(data);
}

// اختبار
saveStudent();
