displayState();

document.getElementById("signUp").onclick = function () {
  location.href = "/signup";
}

document.getElementById("login").onclick = function () {
  location.href = "/login";
}

async function displayState() {
  let url = "https://cst336.herokuapp.com/projects/api/state_abbrAPI.php";
  let data = await fetchData(url);
  console.log(data);
  for(i = 0; i < data.length; i++) 
    document.getElementById("inputState").append(`<option value="${data[i].usps}">${data[i].state}</option>`);
}

async function fetchData(url){
  let response = await fetch(url);
  let data = await response.json();
  return data;
}
