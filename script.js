/* КАЛЬКУЛЯТОР → РЕЗУЛЬТАТ → ФОРМА ЗАЯВКИ
   Сейчас форма работает в demo-режиме.
   Когда выберем сервис приёма заявок, вставим его webhook URL в FORM_ENDPOINT.
*/
const FORM_ENDPOINT = 'https://webhook.site/147add2d-e0aa-405f-b9ae-e38bd427331f';
const $ = (id) => document.getElementById(id);
const inputIds = ["employees","hours","rate","automation"];
function getNumber(id,fallback=0){const value=Number($(id).value);return Number.isFinite(value)?value:fallback}
function formatNumber(value){return Math.round(value).toLocaleString("ru-RU")}
function calculate(){
  const employees=Math.max(1,getNumber("employees",1));
  const hours=Math.max(0,getNumber("hours",0));
  const rate=Math.max(0,getNumber("rate",0));
  const automation=Math.min(100,Math.max(0,getNumber("automation",0)));
  const routine=employees*hours;
  const freed=routine*automation/100;
  const value=freed*rate;
  $("routine").textContent=`${formatNumber(routine)} ч`;
  $("freed").textContent=`${formatNumber(freed)} ч`;
  $("value").textContent=`${formatNumber(value)} ₽`;
  $("heroValue").textContent=`${formatNumber(value)} ₽`;
  $("hiddenEmployees").value=employees;
  $("hiddenHours").value=hours;
  $("hiddenRate").value=rate;
  $("hiddenAutomation").value=automation;
  $("hiddenRoutine").value=Math.round(routine);
  $("hiddenFreed").value=Math.round(freed);
  $("hiddenValue").value=Math.round(value);
  return {employees,hours,rate,automation,routine,freed,value};
}
inputIds.forEach(id=>{$(id).addEventListener("input",calculate);$(id).addEventListener("change",calculate)});
$("leadForm").addEventListener("submit",async(event)=>{
  event.preventDefault();
  const form=event.currentTarget;
  const button=form.querySelector("button[type='submit']");
  const success=$("formSuccess");
  const error=$("formError");
  error.hidden=true;
  calculate();
  const data=Object.fromEntries(new FormData(form).entries());
  if(!FORM_ENDPOINT){
    console.log("Заявка (demo-режим):",data);
    localStorage.setItem("lastLead",JSON.stringify({...data,created_at:new Date().toISOString()}));
    form.hidden=true;
    success.hidden=false;
    return;
  }
  button.disabled=true;button.textContent="Отправляем...";
  try{
    const response=await fetch(FORM_ENDPOINT,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    form.hidden=true;success.hidden=false;
  }catch(e){
    console.error("Ошибка отправки:",e);
    error.hidden=false;button.disabled=false;button.textContent="Получить AI-разбор процесса";
  }
});
calculate();
