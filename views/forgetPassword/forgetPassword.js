let myForm = document.querySelector('#my-form')
let emailInput = document.querySelector('#emailAdd')

myForm.addEventListener("submit",saveToStorage)

function saveToStorage(e) {
    e.preventDefault();
    let emailAdd = emailInput.value;

    let obj = {emailAdd}
    const token = localStorage.getItem("token");
    axios
    .post(`http://localhost:8000/password/forgotpassword`, obj,{ headers: { Authorization: token } })
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
