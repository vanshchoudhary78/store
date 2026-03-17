let medicines = JSON.parse(localStorage.getItem("medicines")) || [];
let bill = [];
let total = 0;
// let scannedMedicines = [];

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

let exists = medicines.find(m => 
m.name.toLowerCase() === name.toLowerCase() &&
m.company.toLowerCase() === company.toLowerCase()
)

if(exists){
alert("Medicine already exists ❌")
return
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
<button onclick="editMedicine(${index})">Edit</button>
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

/* EDIT MEDICINE */

function editMedicine(i){

let m = medicines[i]

// form fill karo
document.getElementById("name").value = m.name
document.getElementById("company").value = m.company
document.getElementById("price").value = m.price
document.getElementById("qty").value = m.qty

// old record hata do
medicines.splice(i,1)

localStorage.setItem("medicines", JSON.stringify(medicines))

showMedicines()

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
<button onclick="editMedicine(${index})">Edit</button>
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






// upload csv

function uploadCSV(){

let file=document.getElementById("csvFile").files[0]

if(!file){
alert("Select CSV file")
return
}

let reader=new FileReader()

reader.onload=function(e){

let data=e.target.result

let rows=data.split(/\r?\n/)

rows.shift()

rows.forEach((row)=>{

if(!row.trim()) return

// clean row
row=row.replace(/\r/g,"").trim()

// split (comma + quote safe)
let cols=row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)

// fallback semicolon
if(cols.length<4){
cols=row.split(";")
}

if(cols.length<4) return

let name=cols[0].replace(/"/g,"").trim()
let company=cols[1].replace(/"/g,"").trim()
let price=parseFloat(cols[2])
let qty=parseInt(cols[3])

if(!name || isNaN(price) || isNaN(qty)) return

// 🔥 IMPORTANT: use existing medicines array
let existing=medicines.find(m=>m.name===name && m.company===company)

if(existing){
existing.price=price
existing.qty=qty
}else{
medicines.push({name,company,price,qty})
}

})

// save
localStorage.setItem("medicines",JSON.stringify(medicines))

alert("CSV Imported Successfully")

// refresh table (existing function)
showMedicines()

}

reader.readAsText(file)

}