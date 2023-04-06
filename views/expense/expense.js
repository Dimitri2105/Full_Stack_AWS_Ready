let myForm = document.querySelector("#my-form");
let amountInput = document.querySelector("#amount");
let descriptionInput = document.querySelector("#description");
let categoryInput = document.querySelector("#category");
let itemInput = document.querySelector("#users");
let razorbtn = document.querySelector("#razorPaybtn");

myForm.addEventListener("submit", saveToStorage);

function saveToStorage(e) {
  console.log("inside frontend");
  e.preventDefault();
  let amountAdd = amountInput.value;
  let descriptionAdd = descriptionInput.value;
  let categoryAdd = categoryInput.value;

  let obj = { amountAdd, descriptionAdd, categoryAdd };
  console.log(obj);

  const token = localStorage.getItem("token");

  axios
    .post(`http://localhost:8000/add-expense`, obj, {
      headers: { Authorization: token },
    })
    .then((response) => {
      addItem(response.data.newExpense);
    })
    .catch((error) => {
      document.body.innerHTML =
        document.body.innerHTML + "<h3> Something Went Wrong </h3>";
      console.log(error);
    });
}

function addItem(obj) {
  let amountAdd = obj.expenseAmount;
  let descriptionAdd = obj.description;
  let categoryAdd = obj.category;

  let li = document.createElement("li");
  li.className = "items";
  li.textContent =
    li.textContent +
    obj.expenseAmount +
    "     " +
    obj.description +
    "    " +
    obj.category;
  itemInput.append(li);

  let deletebtn = document.createElement("button");
  deletebtn.className = "btn btn-outline-dark";
  deletebtn.appendChild(document.createTextNode("Delete Expense"));
  li.append(deletebtn);

  deletebtn.onclick = (e) => {
    deleteExpense(e, obj.id);
  };

  myForm.reset();
}
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const decodeToken = parseJwt(token)
  console.log(decodeToken)
  const premiumUser = decodeToken.isPremiumUser

  if(premiumUser){
    premiumUserMessage()
    showLeaderBoard()
    // razorbtn.remove();
  }
  axios
    .get("http://localhost:8000/get-expenses", {
      headers: { Authorization: token },
    })
    .then((response) => {

      const expenses = response.data.expense;

      for (let i = 0; i < expenses.length; i++) {
        addItem(expenses[i]);
      }
    })
    .catch((error) => {
      document.body.innerHTML =
        document.body.innerHTML + "<h3> Something Went Wrong </h3>";
      console.log(error);
    });
});

function deleteExpense(e, obj_id) {
  const deletedItem = e.target.parentElement;
  itemInput.removeChild(deletedItem);

  const token = localStorage.getItem("token");

  axios
    .delete(`http://localhost:8000/delete-expense/${obj_id}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      console.log("inside axios delete function");
    })
    .catch((error) => {
      document.body.innerHTML =
        document.body.innerHTML + "<h3> Something Went Wrong </h3>";
      console.log(error);
    });
  myForm.reset();
}

razorbtn.onclick = async (e) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `http://localhost:8000/buyPremiumMembership`,
    { headers: { Authorization: token } }
  );
  console.log(response);

  

  var options = {
    "key": response.data.key_id,
    "order_id": response.data.order.id,
    "handler": async (response) => {
      const res =  await axios.post(
        `http://localhost:8000/updateTransactionStatus`,
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );

      alert("You are Premium user now !!! ");
      premiumUserMessage()
      showLeaderBoard()
    },
  };

  const razor = new Razorpay(options);
  razor.open();
  e.preventDefault();

  razor.on("payment.failed", (response) => {
    console.log(response);
    alert("Transaction failed");
  });
};

function premiumUserMessage(){
  const premiumUserText = document.createElement("h3");

      premiumUserText.className = "form-label";
      premiumUserText.style.fontFamily = "sans-Serif";
      premiumUserText.style.fontWeight = "600;";
      premiumUserText.style.textAlign = "center";
      premiumUserText.style.color = "";

      
      premiumUserText.textContent = "Welcome ... You're a Premium User !!!";

      document.body.appendChild(premiumUserText);
      razorbtn.remove();


}


function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function showLeaderBoard() {
  const leaderBoardbtn = document.createElement('button');

  leaderBoardbtn.className = "btn btn-success";
  leaderBoardbtn.style.fontFamily = "sans-Serif";
  leaderBoardbtn.style.fontWeight = "600";
  leaderBoardbtn.style.display = "block";
  leaderBoardbtn.style.margin = "0 auto";
  leaderBoardbtn.innerHTML = "Show LeaderBoard !!! ";

  leaderBoardbtn.onclick  = async() =>{

    const token = localStorage.getItem("token");
    const userLeaderBoard = await axios.get(`http://localhost:8000/premium/leaderBoard`,{ headers: { Authorization: token } });
    console.log(userLeaderBoard)

    const leaderboardContainer = document.createElement('div');
    leaderboardContainer.className = 'leaderboard-container';

    const leaderboardTitle = document.createElement('h3');
    leaderboardTitle.className = 'leaderboard-title';
    leaderboardTitle.textContent = 'Leaderboard';

    leaderboardContainer.appendChild(leaderboardTitle);

    userLeaderBoard.data.forEach((user, index) => {
      const leaderboardRow = document.createElement('div');
      leaderboardRow.className = 'leaderboard-row';

      const leaderboardName = document.createElement('div');
      leaderboardName.className = 'leaderboard-name';
      leaderboardName.textContent = `${index + 1}. Name: ${user.name} Total Expense: ${user.totalExpense}`;

      leaderboardRow.appendChild(leaderboardName);

      leaderboardContainer.appendChild(leaderboardRow);
    });
    document.body.appendChild(leaderboardContainer);
  }

  document.body.appendChild(leaderBoardbtn);
}
  