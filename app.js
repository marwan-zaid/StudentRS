const API_URL = "https://script.google.com/macros/s/XXXX/exec"; // ضع رابط Apps Script

// تسجيل الدخول
async function login(){
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await fetch(`${API_URL}?action=login&username=${username}&password=${password}`);
  const data = await res.json();
  if(data.status==="success"){
    localStorage.setItem("employee", JSON.stringify(data));
    window.location.href = "profile.html";
  } else {
    document.getElementById("msg").textContent = data.message;
  }
}

// تحميل بيانات الطالب
async function loadStudent(studentId){
  const res = await fetch(`${API_URL}?action=getStudent&id=${studentId}`);
  const data = await res.json();
  if(data.status==="success"){
    document.getElementById("studentId").value = data.student["رقم_الهوية"];
    document.getElementById("اسم_الطالب").value = data.student["اسم_الطالب"];
    document.getElementById("اسم_الأم").value = data.student["اسم_الأم"];
    document.getElementById("تاريخ_الميلاد").value = data.student["تاريخ_الميلاد"];
    document.getElementById("رقم_الواتس_بالمقدمة").value = data.student["رقم_الواتس_بالمقدمة"] || "";
    document.getElementById("المنطقة").value = data.student["المنطقة"] || "";
    // خزّن نسخة محلية للأوفلاين
    localStorage.setItem("studentOffline", JSON.stringify(data.student));
  } else {
    alert(data.message);
  }
}

// حفظ بيانات الطالب (أوفلاين/أونلاين)
async function saveStudent(){
  const employee = JSON.parse(localStorage.getItem("employee"));
  if(!employee) return alert("يجب تسجيل الدخول");

  const student = {
    studentId: document.getElementById("studentId").value,
    "اسم_الطالب": document.getElementById("اسم_الطالب").value,
    "اسم_الأم": document.getElementById("اسم_الأم").value,
    "تاريخ_الميلاد": document.getElementById("تاريخ_الميلاد").value,
    "رقم_الواتس_بالمقدمة": document.getElementById("رقم_الواتس_بالمقدمة").value,
    "المنطقة": document.getElementById("المنطقة").value,
    updatedBy: employee.username
  };

  // تخزين محلي دائمًا
  localStorage.setItem("pendingUpdate", JSON.stringify(student));

  try{
    await fetch(API_URL,{
      method:"POST",
      body: JSON.stringify(student),
      headers: {"Content-Type":"application/json"}
    });
    document.getElementById("status").textContent = "تم الحفظ ✅";
    localStorage.removeItem("pendingUpdate");
  }catch(err){
    document.getElementById("status").textContent = "تم الحفظ محليًا (أوفلاين)";
  }
}

// مزامنة تلقائية عند عودة الإنترنت
window.addEventListener("online", async ()=>{
  const pending = localStorage.getItem("pendingUpdate");
  if(pending){
    try{
      await fetch(API_URL,{
        method:"POST",
        body: pending,
        headers: {"Content-Type":"application/json"}
      });
      localStorage.removeItem("pendingUpdate");
      alert("تم مزامنة التحديثات تلقائيًا ✅");
    }catch(err){}
  }
});
