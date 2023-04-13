let myForm = document.querySelector("#my-form");
let amountInput = document.querySelector("#amount");
let descriptionInput = document.querySelector("#description");
let categoryInput = document.querySelector("#category");
let itemInput = document.querySelector("#users");
let razorbtn = document.querySelector("#razorPaybtn");
let pagination = document.querySelector(".pagination")
let itemsPerPageInput = document.querySelector('#items-per-page')


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
  // deletebtn.className = "btn btn-outline-dark float-end";
  deletebtn.className = "btn btn-dark float-end";
  deletebtn.appendChild(document.createTextNode("Delete Expense"));
  li.append(deletebtn);

  deletebtn.onclick = (e) => {
    deleteExpense(e, obj.id);
  };

  myForm.reset();
}
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const decodeToken = parseJwt(token);
  const premiumUser = decodeToken.isPremiumUser;

  if (premiumUser) {
    premiumUserMessage();
    showLeaderBoard();
    downloadExpense();
    downloadURLHistory();
    // razorbtn.remove();
  }
  const page =1
  const Items_Per_Page = localStorage.getItem('itemsPerPage') || 2;
  
  axios
    .get(`http://localhost:8000/get-expenses/${page}?limit=${Items_Per_Page}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      const expenses = response.data.expenses;

      for (let i = 0; i < expenses.length; i++) {
        addItem(expenses[i]);
      }
      showPagination(response.data.info)
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
    key: response.data.key_id,
    order_id: response.data.order.id,
    handler: async (response) => {
      const res = await axios.post(
        `http://localhost:8000/updateTransactionStatus`,
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        },
        { headers: { Authorization: token } }
      );

      alert("You are Premium user now !!! ");
      premiumUserMessage();
      showLeaderBoard();
      downloadExpense();
      downloadURLHistory();
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

function premiumUserMessage() {
  const premiumUserText = document.createElement("h4");
  premiumUserText.className = "premiumUserMessage";
  premiumUserText.textContent = "Welcome ... You're a Premium User !!!";
  document.body.appendChild(premiumUserText);

  razorbtn.remove();
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

function showLeaderBoard() {
  const leaderBoardbtn = document.createElement("button");

  leaderBoardbtn.className = "btn btn-success ";
  leaderBoardbtn.innerHTML = "Show LeaderBoard";

  leaderBoardbtn.onclick = async () => {
    const token = localStorage.getItem("token");
    const userLeaderBoard = await axios.get(
      `http://localhost:8000/premium/leaderBoard`,
      { headers: { Authorization: token } }
    );
    console.log(userLeaderBoard);

    const leaderboardContainer = document.createElement("div");
    leaderboardContainer.className = "leaderboard-container";

    const leaderboardTitle = document.createElement("h3");
    leaderboardTitle.className = "leaderboard-title";
    leaderboardTitle.textContent = "Leaderboard";

    leaderboardContainer.appendChild(leaderboardTitle);

    userLeaderBoard.data.forEach((user, index) => {
      const leaderboardRow = document.createElement("div");
      leaderboardRow.className = "leaderboard-row";

      const leaderboardName = document.createElement("div");
      leaderboardName.className = "leaderboard-name";
      leaderboardName.textContent = `${index + 1}. Name: ${
        user.userName
      } Total Expense: ${user.totalExpenses}`;

      leaderboardRow.appendChild(leaderboardName);

      leaderboardContainer.appendChild(leaderboardRow);
    });
    document.body.appendChild(leaderboardContainer);
  };

  document.body.appendChild(leaderBoardbtn);
}

function downloadExpense() {
  const downloadExpensebtn = document.createElement("button");

  downloadExpensebtn.className = "btn btn-success";
  downloadExpensebtn.id = "downloadexpense";
  downloadExpensebtn.innerHTML = "Download";

  downloadExpensebtn.onclick = () => {
    download();
  };
  document.body.appendChild(downloadExpensebtn);
}

async function download() {
  try {
    const token = localStorage.getItem("token");
    const downloadInfo = await axios.get(
      `http://localhost:8000/user/download`,
      { headers: { Authorization: token } }
    );
    console.log(downloadInfo);
    var a = document.createElement("a");
    a.href = downloadInfo.data.fileURL;
    a.download = "myexpense.csv";
    a.click();
  } catch (error) {
    console.log(error);
    document.body.innerHTML =
      document.body.innerHTML + "<h3> Something Went Wrong </h3>";
  }
}

function downloadURLHistory() {
  const downloadURLbtn = document.createElement("button");

  downloadURLbtn.className = "btn btn-success";
  downloadURLbtn.id = "downloadURL";
  downloadURLbtn.innerHTML = "Show File History";

  downloadURLbtn.onclick = async () => {
    const token = localStorage.getItem("token");
    const urlHistory = await axios.get(`http://localhost:8000/user/getURL`, {
      headers: { Authorization: token },
    });
    console.log(urlHistory);

    const urlHistoryContainer = document.createElement("div");
    urlHistoryContainer.className = "urlHistory-container";

    const urlHistoryTitle = document.createElement("h3");
    urlHistoryTitle.className = "urlHistoryTitle-title";
    urlHistoryTitle.textContent = "File Download History";

    urlHistoryContainer.appendChild(urlHistoryTitle);

    urlHistory.data.allURL.forEach((data, index) => {

      const urlHistoryRow = document.createElement("div");
      urlHistoryRow.className = "urlHistory-row";

      const urlHistoryName = document.createElement("div");
      urlHistoryName.className = "urlHistory-name";
      urlHistoryName.innerHTML = `${index + 1} File Name : <a href="${data.fileURL}" download>${data.filename.slice(0,35)}</a>`;

      urlHistoryRow.appendChild(urlHistoryName);

      urlHistoryContainer.appendChild(urlHistoryName);
    });
    document.body.appendChild(urlHistoryContainer);
  };

  document.body.appendChild(downloadURLbtn);
}

function showPagination({ currentPage, hasNextPage, hasPreviousPage, nextPage, previousPage, lastPage }) {
  pagination.innerHTML = '';

  if (hasPreviousPage) {
    const button1 = document.createElement('button');
    button1.className = "btn btn-dark"
    button1.style.marginRight = '0.2rem';
    button1.innerHTML = previousPage;
    button1.addEventListener('click', () => getPageExpenses(previousPage))
    pagination.appendChild(button1)
  }

  const button2 = document.createElement('button');
  button2.classList.add('active')
  button2.className = "btn btn-dark"
  button2.style.marginRight = '0.2rem';
  button2.innerHTML = currentPage;
  button2.addEventListener('click', () => getPageExpenses(currentPage))
  pagination.appendChild(button2)

  if (hasNextPage) {
    const button3 = document.createElement('button');
    button3.innerHTML = nextPage;
    button3.style.marginLeft = '0.2rem';
    button3.style.marginRight = '0.2rem';
    button3.className = "btn btn-dark"
    button3.addEventListener('click', () => getPageExpenses(nextPage))
    pagination.appendChild(button3)
  }

  if (currentPage != lastPage && nextPage != lastPage && lastPage != 0) {
    const button3 = document.createElement('button');
    button3.className = "btn btn-dark"
    button3.style.marginLeft = '0.2rem';
    button3.style.marginRight = '0.2rem';
    button3.innerHTML = lastPage;
    button3.addEventListener('click', () => getPageExpenses(lastPage))
    pagination.appendChild(button3)
  }
}

function getPageExpenses(page) {

  
  const token = localStorage.getItem('token')
  const Items_Per_Page = parseInt(itemsPerPageInput.value) || 2
  localStorage.setItem('itemsPerPage',Items_Per_Page)
  axios
    .get(`http://localhost:8000/get-expenses/${page}?limit=${Items_Per_Page}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      clearItems()
      const expenses = response.data.expenses;

      for (let i = 0; i < expenses.length; i++) {
        addItem(expenses[i]);
      }
      const pageInfo = {
        currentPage: response.data.info.currentPage,
        hasNextPage: response.data.info.hasNextPage,
        hasPreviousPage: response.data.info.hasPreviousPage,
        nextPage: response.data.info.nextPage,
        previousPage: response.data.info.currentPage - 1, // set the correct previousPage value
        lastPage: response.data.info.lastPage
      };
      
      showPagination(pageInfo);
    })
    .catch((error) => {
      document.body.innerHTML =
        document.body.innerHTML + "<h3> Something Went Wrong </h3>";
      console.log(error);
    });
}

function clearItems() {
  itemInput.innerHTML = '';
}
function loadItemsPerPage() {
  const itemsPerPage = localStorage.getItem('itemsPerPage');
  if (itemsPerPage) {
    itemsPerPageInput.value = itemsPerPage;
  }
}

