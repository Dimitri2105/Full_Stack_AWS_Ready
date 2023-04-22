let myForm = document.querySelector('#my-form')
let passwordInput = document.querySelector('#passwordAdd')

myForm.addEventListener("submit",saveToStorage)

function saveToStorage(e) {
  console.log("INSIDE UPDATE FUNCTION")
    e.preventDefault();
    const resetID = new URLSearchParams(window.location.search).get("resetPasswordId");
    console.log(resetID)
    let passwordAdd = passwordInput.value;
    
    let obj = {passwordAdd}
    axios
    .post(`http://localhost:8000 /password/updatepassword${resetID}`,obj,)
    .then(response =>{
        console.log(response.data)
        // localStorage.setItem('token',response.data.token)
        // window.location.href="file:///C:/Users/karan/Documents/Gettin%20Started/Node_Js_To-Do-Project/views/expense/expense.html"
    })
    .catch((error) => {
        document.body.innerHTML =
          document.body.innerHTML + "<h3> Something Went Wrong </h3>";
        console.log(error);
      })

    myForm.reset()

}
