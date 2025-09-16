// تكوين التطبيق
const CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycby5T3N60TKxmq0NJrubB_dZk8xu-ZPCIosT8fkwQdECLKLwV3Gq1JRvnwm-ERfT43YO/exec", // ضع رابط الـ Web App هنا
  OFFLINE_STORAGE_KEY: "pending_updates",
  SCHOOLS: {
    "شمال رفح": ["مدرسة شمال رفح الابتدائية", "مدرسة شمال رفح الإعدادية", "مدرسة شمال رفح الثانوية"],
    "جنوب رفح": ["مدرسة جنوب رفح الابتدائية", "مدرسة جنوب رفح الإعدادية", "مدرسة جنوب رفح الثانوية"]
  }
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  // التحقق من تسجيل الدخول
  const userData = sessionStorage.getItem('user');
  if (!userData) {
    window.location.href = 'login.html';
    return;
  }
  
  const user = JSON.parse(userData);
  document.getElementById('userDisplayName').textContent = user.full_name || user.username;
  
  // مراقبة حالة الاتصال بالإنترنت
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
  
  // تحديث حالة الاتصال عند التحميل
  if (navigator.onLine) {
    handleOnlineStatus();
  } else {
    handleOfflineStatus();
  }
  
  // محاولة مزامنة البيانات المعلقة
  syncPendingUpdates();
}

// إدارة حالة الاتصال
function handleOnlineStatus() {
  document.getElementById('onlineStatus').style.display = 'block';
  document.getElementById('offlineStatus').style.display = 'none';
  setTimeout(() => {
    document.getElementById('onlineStatus').style.display = 'none';
  }, 3000);
}

function handleOfflineStatus() {
  document.getElementById('offlineStatus').style.display = 'block';
  document.getElementById('onlineStatus').style.display = 'none';
}

// تسجيل الخروج
function logout() {
  sessionStorage.removeItem('user');
  window.location.href = 'login.html';
}

// البحث عن الطالب
async function searchStudent() {
  const idNumber = document.getElementById('idNumber').value.trim();
  const msg = document.getElementById('searchMessage');
  
  if (!idNumber) {
    showMessage(msg, 'يرجى إدخال رقم الهوية', 'error');
    return;
  }
  
  showMessage(msg, 'جاري البحث...', 'info');
  
  if (!navigator.onLine) {
    showMessage(msg, 'لا يوجد اتصال بالإنترنت. يرجى الاتصال للبحث', 'error');
    return;
  }
  
  try {
    const response = await fetch(CONFIG.WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getStudent',
        studentID: idNumber
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showMessage(msg, 'تم العثور على بيانات الطالب', 'success');
      displayStudentInfo(data.studentData);
      fillFormWithStudentData(data.studentData);
    } else {
      showMessage(msg, data.message, 'error');
      hideSearchResult();
    }
  } catch (error) {
    showMessage(msg, 'حدث خطأ أثناء البحث: ' + error.message, 'error');
    hideSearchResult();
  }
}

// عرض نتيجة البحث
function displayStudentInfo(studentData) {
  const div = document.getElementById('studentInfo');
  let html = '';
  
  const fieldLabels = {
    'رقم_الهوية': 'رقم الهوية',
    'اسم_الطالب': 'اسم الطالب',
    'اسم_الأم': 'اسم الأم',
    'تاريخ_الميلاد': 'تاريخ الميلاد',
    'الجنس': 'الجنس',
    'اسم_ولي_الأمر': 'اسم ولي الأمر',
    'رقم_التسجيل_الفردي': 'رقم التسجيل الفردي',
    'رقم_التسجيل_العائلي': 'رقم التسجيل العائلي',
    'رقم_الجوال_1': 'رقم الجوال',
    'المنطقة': 'المنطقة',
    'المدرسة_التي_يرغب_الدراسة_بها': 'المدرسة المرغوبة'
  };
  
  for (const key in studentData) {
    if (studentData.hasOwnProperty(key)) {
      const label = fieldLabels[key] || key.replace(/_/g, ' ');
      html += `<div class="student-field"><label>${label}:</label><span>${studentData[key] || ''}</span></div>`;
    }
  }
  
  div.innerHTML = html;
  document.getElementById('searchResult').style.display = 'block';
}

function hideSearchResult() {
  document.getElementById('searchResult').style.display = 'none';
}

function fillFormWithStudentData(studentData) {
  document.getElementById('idNumber2').value = studentData.رقم_الهوية || '';
  document.getElementById('fullName').value = studentData.اسم_الطالب || '';
  document.getElementById('motherName').value = studentData.اسم_الأم || '';
  document.getElementById('birthDate').value = formatDate(studentData.تاريخ_الميلاد);
  document.getElementById('gender').value = studentData.الجنس || '';
  document.getElementById('guardianName').value = studentData.اسم_ولي_الأمر || '';
  document.getElementById('individualRegistrationNumber').value = studentData.رقم_التسجيل_الفردي || '';
  document.getElementById('familyRegistrationNumber').value = studentData.رقم_التسجيل_العائلي || '';
  document.getElementById('phone1').value = studentData.رقم_الجوال_1 || '';
  document.getElementById('area').value = studentData.المنطقة || '';
  
  updateSchools();
  document.getElementById('desiredSchool').value = studentData.المدرسة_التي_يرغب_الدراسة_بها || '';
}

function formatDate(dateString) {
  if (!dateString) return '';
  // تحويل التاريخ من صيغة DD/MM/YYYY إلى YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateString;
}

// تحديث قائمة المدارس بناءً على المنطقة المختارة
function updateSchools() {
  const area = document.getElementById('area').value;
  const schoolSelect = document.getElementById('desiredSchool');
  
  schoolSelect.innerHTML = '<option value="">اختر المدرسة</option>';
  
  if (area && CONFIG.SCHOOLS[area]) {
    CONFIG.SCHOOLS[area].forEach(school => {
      const option = document.createElement('option');
      option.value = school;
      option.textContent = school;
      schoolSelect.appendChild(option);
    });
  }
}

// حفظ بيانات الطالب
async function saveStudent() {
  const userData = JSON.parse(sessionStorage.getItem('user'));
  const studentData = {
    اسم_الطالب: document.getElementById('fullName').value,
    اسم_الأم: document.getElementById('motherName').value,
    تاريخ_الميلاد: document.getElementById('birthDate').value,
    رقم_الهوية: document.getElementById('idNumber2').value,
    الجنس: document.getElementById('gender').value,
    اسم_ولي_الأمر: document.getElementById('guardianName').value,
    رقم_التسجيل_الفردي: document.getElementById('individualRegistrationNumber').value,
    رقم_التسجيل_العائلي: document.getElementById('familyRegistrationNumber').value,
    رقم_الجوال_1: document.getElementById('phone1').value,
    المنطقة: document.getElementById('area').value,
    المدرسة_التي_يرغب_الدراسة_بها: document.getElementById('desiredSchool').value,
    updatedBy: userData.username,
    updatedAt: new Date().toISOString()
  };
  
  const msg = document.getElementById('saveMessage');
  
  // التحقق من البيانات المطلوبة
  if (!studentData.رقم_الهوية) {
    showMessage(msg, 'رقم الهوية مطلوب', 'error');
    return;
  }
  
  if (navigator.onLine) {
    // محاولة الحفظ أونلاين
    showMessage(msg, 'جاري حفظ البيانات...', 'info');
    
    try {
      const response = await fetch(CONFIG.WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveStudent',
          studentData: studentData
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        showMessage(msg, 'تم حفظ البيانات بنجاح', 'success');
      } else {
        showMessage(msg, result.message, 'error');
      }
    } catch (error) {
      showMessage(msg, 'خطأ في الاتصال. يتم حفظ البيانات محلياً', 'error');
      saveOffline(studentData);
    }
  } else {
    // حفظ أوفلاين
    showMessage(msg, 'يتم حفظ البيانات محلياً (غير متصل بالإنترنت)', 'info');
    saveOffline(studentData);
  }
}

// حفظ البيانات محلياً عند عدم وجود اتصال
function saveOffline(studentData) {
  let pendingUpdates = JSON.parse(localStorage.getItem(CONFIG.OFFLINE_STORAGE_KEY)) || [];
  pendingUpdates.push(studentData);
  localStorage.setItem(CONFIG.OFFLINE_STORAGE_KEY, JSON.stringify(pendingUpdates));
  
  setTimeout(() => {
    document.getElementById('saveMessage').style.display = 'none';
  }, 3000);
}

// مزامنة البيانات المعلقة عند عودة الاتصال
async function syncPendingUpdates() {
  if (!navigator.onLine) return;
  
  const pendingUpdates = JSON.parse(localStorage.getItem(CONFIG.OFFLINE_STORAGE_KEY)) || [];
  
  if (pendingUpdates.length === 0) return;
  
  const msg = document.createElement('div');
  msg.className = 'message info';
  msg.textContent = `جاري مزامنة ${pendingUpdates.length} عملية معلقة...`;
  document.body.appendChild(msg);
  
  let successfulSyncs = 0;
  
  for (const update of pendingUpdates) {
    try {
      const response = await fetch(CONFIG.WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveStudent',
          studentData: update
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        successfulSyncs++;
      }
    } catch (error) {
      console.error('فشل في مزامنة التحديث:', error);
    }
  }
  
  // إزالة العناصر التي تمت مزامنتها بنجاح
  if (successfulSyncs > 0) {
    const remainingUpdates = pendingUpdates.slice(successfulSyncs);
    localStorage.setItem(CONFIG.OFFLINE_STORAGE_KEY, JSON.stringify(remainingUpdates));
    
    msg.textContent = `تمت مزامنة ${successfulSyncs} عملية بنجاح.`;
    msg.className = 'message success';
  } else {
    msg.textContent = 'فشل في مزامنة البيانات المعلقة.';
    msg.className = 'message error';
  }
  
  setTimeout(() => {
    msg.remove();
  }, 5000);
}

// وظيفة مساعدة لعرض الرسائل
function showMessage(element, message, type) {
  element.textContent = message;
  element.className = `message ${type}`;
  element.style.display = 'block';
}
