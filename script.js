let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
let bill = [];
let total = 0;
let scannedMedicines = [];

/* ---------------- INVENTORY ---------------- */

function addMedicine(){

let name=document.getElementById("name").value;
let company=document.getElementById("company").value;
let price=document.getElementById("price").value;
let qty=document.getElementById("qty").value;

if(!name || !company || !price || !qty){
alert("Fill all fields");
return;
}

medicines.push({name,company,price,qty});

localStorage.setItem("medicines",JSON.stringify(medicines));

showMedicines();

document.getElementById("name").value="";
document.getElementById("company").value="";
document.getElementById("price").value="";
document.getElementById("qty").value="";

}

/* SHOW MEDICINES */

function showMedicines(){

let table=document.querySelector("#medicineTable tbody");

if(!table) return;

table.innerHTML="";

medicines.forEach((med,index)=>{

table.innerHTML+=`

<tr>
<td>${med.name}</td>
<td>${med.company}</td>
<td>${med.price}</td>
<td>${med.qty}</td>
<td>
<button onclick="deleteMedicine(${index})">Delete</button>
</td>
</tr>
`;

});

}

/* DELETE MEDICINE */

function deleteMedicine(i){

medicines.splice(i,1);

localStorage.setItem("medicines",JSON.stringify(medicines));

showMedicines();

}

/* SEARCH MEDICINE */

function searchMedicine(){

let input=document.getElementById("search").value.toLowerCase();

let table=document.querySelector("#medicineTable tbody");

table.innerHTML="";

medicines.forEach((med,index)=>{

if(med.name.toLowerCase().includes(input)){

table.innerHTML+=`

<tr>
<td>${med.name}</td>
<td>${med.company}</td>
<td>${med.price}</td>
<td>${med.qty}</td>
<td>
<button onclick="deleteMedicine(${index})">Delete</button>
</td>
</tr>
`;

}

});

}

/* ---------------- BILLING ---------------- */

/* SMART SEARCH */

function searchMedicineSuggest(){

let input=document.getElementById("medicineName");

if(!input) return;

let value=input.value.toLowerCase();

let box=document.getElementById("suggestions");

box.innerHTML="";

medicines.forEach((med,i)=>{

if(med.name.toLowerCase().includes(value)){

box.innerHTML+=`

<div class="suggestion" onclick="selectMedicine(${i})">
${med.name}
</div>
`;

}

});

}

/* SELECT MEDICINE */

function selectMedicine(index){

let med=medicines[index];

document.getElementById("medicineName").value=med.name;

document.getElementById("price").value=med.price;

document.getElementById("suggestions").innerHTML="";

}

/* ADD BILL */

function addBill(){

let name=document.getElementById("medicineName").value;

let price=parseFloat(document.getElementById("price").value);

let qty=parseInt(document.getElementById("billQty").value);

if(!name || !price || !qty){
alert("Fill all fields");
return;
}

let itemTotal=price*qty;

bill.push({name,price,qty,itemTotal});

renderBill();

}

/* RENDER BILL */

function renderBill(){

let tbody=document.querySelector("#billTable tbody");

if(!tbody) return;

tbody.innerHTML="";

total=0;

bill.forEach((item,index)=>{

total+=item.itemTotal;

tbody.innerHTML+=`

<tr>
<td>${item.name}</td>
<td>${item.price}</td>
<td>${item.qty}</td>
<td>${item.itemTotal}</td>
<td><button onclick="deleteItem(${index})">Delete</button></td>
</tr>
`;

});

document.getElementById("total").innerText=total;

}

/* DELETE BILL ITEM */

function deleteItem(i){

bill.splice(i,1);

renderBill();

}

/* SAVE BILL */

function completeSale(){
    let sales = JSON.parse(localStorage.getItem("sales")) || [];

bill.forEach(item=>{

let med=medicines.find(m=>m.name===item.name);

if(med){
med.qty=parseInt(med.qty)-item.qty;
}

});

/* SAVE SALE */

sales.push({
date:new Date().toISOString(),
amount:total
});

localStorage.setItem("sales",JSON.stringify(sales));

/* UPDATE MEDICINES */
localStorage.setItem("medicines",JSON.stringify(medicines));
alert("Bill Saved");

document.getElementById("downloadBtn").style.display="inline-block";

}

/* PDF BILL */

function downloadPDF(){

const {jsPDF}=window.jspdf;

let doc=new jsPDF();

doc.text("Pharmacy Bill",20,20);

let y=40;

bill.forEach(item=>{

doc.text(`${item.name} - ${item.qty} x ${item.price} = ₹${item.itemTotal}`,20,y);

y+=10;

});

doc.text("Total: ₹"+total,20,y+10);

doc.save("bill.pdf");

}

/* LOAD TABLE */

showMedicines();


/* -------- DASHBOARD -------- */

function loadDashboard(){

let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];

/* TOTAL MEDICINES */

let totalMed = medicines.length;

let totalMedEl = document.getElementById("totalMedicine");

if(totalMedEl){
totalMedEl.innerText = totalMed;
}

/* LOW STOCK */

let low = medicines.filter(m => m.qty <= 5).length;

let lowStockEl = document.getElementById("lowStock");

if(lowStockEl){
lowStockEl.innerText = low;
}

/* TOTAL SALES */

let totalSales = sales.reduce((sum,s)=>sum+s.amount,0);

let totalSalesEl = document.getElementById("totalSales");

if(totalSalesEl){
totalSalesEl.innerText = "₹"+totalSales;
}

/* SALES CHART */

let chartEl = document.getElementById("salesChart");

if(chartEl){

let salesByDate = {};

/* GROUP SALES BY DATE */

sales.forEach(s => {

let d = new Date(s.date);

/* FORMAT DATE SAME */

let dateKey =
d.getFullYear() + "-" +
(d.getMonth()+1) + "-" +
d.getDate();

if(!salesByDate[dateKey]){
salesByDate[dateKey] = 0;
}

salesByDate[dateKey] += Number(s.amount);

});

let dates = Object.keys(salesByDate);
let amounts = Object.values(salesByDate);

new Chart(chartEl,{
type:'bar',
data:{
labels:dates,
datasets:[{
label:'Daily Sales',
data:amounts
}]
}
});

}

}

loadDashboard();




/* BILL OCR SCANNER */

function scanBill(){

let file=document.getElementById("billImage").files[0];

if(!file){
alert("Upload bill image");
return;
}

document.getElementById("scanStatus").innerText="Scanning bill... please wait";

Tesseract.recognize(
file,
'eng',
{
logger: m => console.log(m)
}
).then(({ data: { text } }) => {

console.log(text);
document.getElementById("scanStatus").innerText="Scan completed";

parseBillText(text);

});

}


function parseBillText(text){

let lines=text.split("\n");

let table=document.querySelector("#scanTable tbody");

table.innerHTML="";

lines.forEach(line=>{

let words=line.trim().split(/\s+/);

if(words.length>=3){

let price=parseFloat(words[words.length-1]);
let qty=parseInt(words[words.length-2]);

let name=words.slice(0,words.length-2).join(" ");

if(!isNaN(price) && !isNaN(qty)){

table.innerHTML+=`
<tr>
<td contenteditable="true">${name}</td>
<td contenteditable="true">${qty}</td>
<td contenteditable="true">${price}</td>
</tr>
`;

}

}

});

}

function saveScannedMedicines(){

let rows = document.querySelectorAll("#scanTable tbody tr");

rows.forEach(row=>{

let name = row.cells[0].innerText;
let qty = row.cells[1].innerText;
let price = row.cells[2].innerText;

medicines.push({
name:name,
company:"Imported",
price:price,
qty:qty
});

});

localStorage.setItem("medicines",JSON.stringify(medicines));

alert("Medicines Saved");

showMedicines();

}