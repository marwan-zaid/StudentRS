const WEB_APP_URL = "https://script.google.com/macros/s/XXXX/exec"; // ضع هنا رابط الـ Web App

// مزامنة تلقائية عند عودة الإنترنت
window.addEventListener("online", syncPendingUpdates);

document.addEventListener('DOMContentLoaded', () => {
  const userData = sessionStorage.getItem('user');
  if (!userData) { alert('يجب تسجيل الدخول أولاً'); window.location.reload(); return; }
  const user = JSON.parse(userData);
  document.getElementById('userDisplayName').textContent = user.full_name || user.username;
});

// تسجيل الخروج
function logout() { sessionStorage.removeItem('user'); window.location.reload(); }

// البحث عن الطالب
function searchStudent() {
  const idNumber = document.getElementById('idNumber').value.trim();
  const msg = document.getElementById('searchMessage');
  if (!idNumber) { showMessage(msg,'يرجى إدخال رقم الهوية','error'); return; }
  showMessage(msg,'جاري البحث...','info');

  if (!navigator.onLine) { showMessage(msg,'لا يوجد اتصال بالإنترنت','error'); return; }

  fetch(WEB_APP_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:'getStudent', studentID:idNumber})
  }).then(r=>r.json())
  .then(data=>{
    if(data.success){
      showMessage(msg,'تم العثور على بيانات الطالب','success');
      displayStudentInfo(data.studentData);
      fillFormWithStudentData(data.studentData);
    } else { showMessage(msg,data.message,'error'); hideSearchResult(); }
  }).catch(err=>{ showMessage(msg,'حدث خطأ: '+err.message,'error'); hideSearchResult(); });
}

// عرض نتيجة البحث
function displayStudentInfo(studentData){
  const div = document.getElementById('studentInfo');
  let html='';
  for(const key in studentData){ if(studentData.hasOwnProperty(key)) html+=`<div class="student-field"><label>${key.replace(/_/g,' ')}:</label><span>${studentData[key]||''}</span></div>`; }
  div.innerHTML=html;
  document.getElementById('searchResult').style.display='block';
}
function hideSearchResult(){ document.getElementById('searchResult').style.display='none'; }

function fillFormWithStudentData(d){
  document.getElementById('idNumber2').value = d.رقم_الهوية || '';
  document.getElementById('fullName').value = d.اسم_الطالب || '';
  document.getElementById('motherName').value = d.اسم_الأم || '';
  document.getElementById('birthDate').value = formatDate(d.تاريخ_الميلاد);
  document.getElementById('gender').value = d.الجنس || '';
  document.getElementById('guardianName').value = d.اسم_ولي_الأمر || '';
  document.getElementById('individualRegistrationNumber').value = d.رقم_التسجيل_الفردي || '';
  document.getElementById('familyRegistrationNumber').value = d.رقم_التسجيل_العائلي || '';
}

// حفظ البيانات أونلاين أو أوفلاين
function saveStudent(){
  const studentData = {
    اسم_الطالب:document.getElementById('fullName').value,
    اسم_الأم:document.getElementById('motherName').value,
    تاريخ_الميلاد:document.getElementById('birthDate').value,
    رقم_الهوية:document.getElementById('idNumber2').value,
    الجنس:document.getElementById('gender').value,
    اسم_ولي_الأمر:document.getElementById('guardianName').value,
    رقم_التسجيل_الفردي:document.getElementById('individualRegistrationNumber').value,
    رقم_التسجيل_العائلي:document.getElementById('familyRegistrationNumber').value,
    المنطقة:document.getElementById('area').value,
    المدرسة_التي_يرغب_الدراسة_بها:document.getElementById('desiredSchool').value,
    رقم_الجوال_1:
