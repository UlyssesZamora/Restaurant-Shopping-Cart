document.addEventListener("DOMContentLoaded", funct);

document.querySelector("#addBtn").addEventListener('click',func);

document.querySelector("#t").style.display = "none"

async function func(){

  console.log("onclick:" + foodId);
  
  let url = `/api/order?foodId=${foodId[i].value}`;

  let response = await fetch(url);
  
  let data = await response.json();

  console.log("from api:" + data);

  document.querySelector('#t').innerHTML = (data[0].foodName + " " + data[0].price);

  document.querySelector("element").style.display = "block"

}

function funct(){

   var foodId = document.querySelectorAll('#food_id');
   for (let i=0; i<foodId.length; i++) {
      console.log("onload:" + foodId[i].value);
      
}
}
