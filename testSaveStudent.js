const fetch = require('node-fetch');
const { API_URL } = require('./config');

async function getStudent(studentId) {
  const res = await fetch(`${API_URL}?action=getStudent&id=${studentId}`);
  const data = await res.json();
  console.log(data);
}

// اختبار
getStudent("123456789"); // ضع رقم هوية موجود في Sheet2
