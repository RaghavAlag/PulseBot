let signUpbtn = document.getElementById("signUpbtn")
let logInbtn = document.getElementById("logInbtn")

signUpbtn.addEventListener('click',async()=>{
    location.href = "/signup";
})

logInbtn.addEventListener('click',async()=>{
    location.href = "/login";
})