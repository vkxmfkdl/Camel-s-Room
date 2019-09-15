var modal = document.getElementById("loginModal");
var btn = document.getElementById("login");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function(){
    modal.style.display = "block";
}
span.onclick = function(){
    modal.style.display = "none";
}
window.onclick = function(event){
    if(event.target == modal){
        modal.style.display = "none";
    }
}