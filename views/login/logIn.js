let myForm = document.querySelector('#my-form')
let emailInput = document.querySelector('#emailAdd')
let passwordInput = document.querySelector('#passwordAdd')

myForm.addEventListener("submit",saveToStorage)

function saveToStorage(e) {
    console.log("Inside forntend")

    e.preventDefault();
    let emailAdd = emailInput.value;
    let passwordAdd = passwordInput.value;

    let obj = {emailAdd,passwordAdd}
    console.log(obj)

    axios
    // .post(`http://localhost:8000 /user/logIn`, obj)
    .post(`http://localhost:8000/user/logIn`, obj)
    .then(response =>{
        console.log(response.data.token)
        localStorage.setItem('token',response.data.token)
        window.location.href="file:///C:/Users/karan/Documents/Gettin%20Started/Node_Js_To-Do-Project/views/expense/expense.html"
    })
    .catch((error) => {
        document.body.innerHTML =
          document.body.innerHTML + "<h3> Something Went Wrong </h3>";
        console.log(error);
      })

    myForm.reset()

}
