// ========================================
// REEN BANK - DASHBOARD.JS
// ========================================


// ========================================
// USER DATA
// ========================================

const USER_KEY = "reenUser";

const user =
  JSON.parse(localStorage.getItem(USER_KEY));


// ========================================
// DISPLAY USER INFORMATION
// ========================================

const userName =
  document.getElementById("dashboard-user-name");

const accountNumber =
  document.getElementById("dashboard-account-number");
const userVerification =
  document.getElementById("dashboard-user-verification");


if (user) {

  if (userName) {
    userName.textContent = user.name;
  }

  if (accountNumber) {
    accountNumber.textContent =
      user.accountNumber;
  }

  if (userVerification && user.verified === true) {
    userVerification.classList.remove("hidden");
  }

  document.querySelectorAll("[data-profile-avatar]").forEach(function (avatar) {
    if (user.profileImage) avatar.src = user.profileImage;
  });

}


// ========================================
// GET DATA FROM LOCAL STORAGE
// ========================================

const accounts = getAccounts();

const transactions = getTransactions();


// ========================================
// CALCULATE CURRENT ACCOUNT DATA
// ========================================

// Main account
const mainAccount = accounts.find(
  account => account.type === "main"
);


// Total balance
const totalBalance = accounts.reduce(
  (total, account) => {
    return total + Number(account.balance);
  },
  0
);


// ========================================
// CALCULATE INCOME
// ========================================

const totalIncome = transactions
  .filter(transaction => transaction.amount > 0)
  .reduce(
    (total, transaction) => {
      return total + Number(transaction.amount);
    },
    0
  );


// ========================================
// CALCULATE EXPENSE
// ========================================

const totalExpense = transactions
  .filter(transaction => transaction.amount < 0)
  .reduce(
    (total, transaction) => {
      return total + Math.abs(
        Number(transaction.amount)
      );
    },
    0
  );


// ========================================
// CURRENT ACCOUNT DATA
// ========================================

const currentAccount = [
  {
    type: "Current Balance",
    amount: totalBalance
  },
  {
    type: "Income",
    amount: totalIncome
  },
  {
    type: "Expense",
    amount: totalExpense
  }
];


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(amount) {

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(amount);

}


// ========================================
// GET BALANCE DATA
// ========================================

const balance =
  currentAccount.find(
    item => item.type === "Current Balance"
  );

const income =
  currentAccount.find(
    item => item.type === "Income"
  );

const expense =
  currentAccount.find(
    item => item.type === "Expense"
  );


// ========================================
// OVERVIEW BALANCE ELEMENTS
// ========================================

const balanceAmount =
  document.getElementById("balance-amount");

const incomeAmount =
  document.getElementById("income-amount");

const expenseAmount =
  document.getElementById("expense-amount");


// ========================================
// DISPLAY BALANCE
// ========================================

if (balanceAmount && balance) {

  balanceAmount.textContent =
    formatMoney(balance.amount);

}

if (incomeAmount && income) {

  incomeAmount.textContent =
    formatMoney(income.amount);

}

if (expenseAmount && expense) {

  expenseAmount.textContent =
    formatMoney(expense.amount);

}


// ========================================
// SHOW / HIDE BALANCE
// ========================================

const toggleBalance =
  document.getElementById("toggle-balance");

const balanceEye =
  document.getElementById("balance-eye");

let balanceVisible = true;


if (toggleBalance) {

  toggleBalance.addEventListener(
    "click",
    function () {

      balanceVisible =
        !balanceVisible;


      // ==============================
      // SHOW
      // ==============================

      if (balanceVisible) {

        if (balanceAmount && balance) {

          balanceAmount.textContent =
            formatMoney(balance.amount);

        }

        if (incomeAmount && income) {

          incomeAmount.textContent =
            formatMoney(income.amount);

        }

        if (expenseAmount && expense) {

          expenseAmount.textContent =
            formatMoney(expense.amount);

        }

        if (balanceEye) {

          balanceEye.setAttribute(
            "data-lucide",
            "eye-off"
          );

        }

      }


      // ==============================
      // HIDE
      // ==============================

      else {

        if (balanceAmount) {

          balanceAmount.textContent =
            "••••••";

        }

        if (incomeAmount) {

          incomeAmount.textContent =
            "••••••";

        }

        if (expenseAmount) {

          expenseAmount.textContent =
            "••••••";

        }

        if (balanceEye) {

          balanceEye.setAttribute(
            "data-lucide",
            "eye"
          );

        }

      }

      lucide.createIcons();

    }
  );

}


// ========================================
// RENDER ACCOUNTS
// ========================================

const accountsContainer =
  document.getElementById(
    "accounts-container"
  );


if (accountsContainer) {

  accountsContainer.innerHTML = "";


  accounts.forEach(function (account) {

    const accountHTML = `

      <div
        class="bg-reen-light rounded-2xl p-5 shadow-sm"
      >

        <div
          class="flex items-center justify-between mb-2"
        >

          <p
            class="text-reen-purple text-xs font-medium"
          >
            ${account.name}
          </p>


          <button
            type="button"
            class="account-eye text-gray-500 hover:text-reen-dark transition"
            data-id="${account.id}"
          >

            <i
              data-lucide="eye-off"
              class="w-4 h-4"
            ></i>

          </button>

        </div>


        <p
          id="account-balance-${account.id}"
          class="text-lg md:text-xl font-bold text-gray-900"
        >
          ${formatMoney(account.balance)}
        </p>

      </div>

    `;


    accountsContainer.insertAdjacentHTML(
      "beforeend",
      accountHTML
    );
    const accountCard = accountsContainer.lastElementChild;
    accountCard.dataset.dashboardSearchItem = "account";
    accountCard.dataset.searchText = account.name;

  });


  lucide.createIcons();

}


// ========================================
// ACCOUNT BALANCE SHOW / HIDE
// ========================================

const accountVisibility = {};


accounts.forEach(function (account) {

  accountVisibility[account.id] = true;

});


const accountEyeButtons =
  document.querySelectorAll(".account-eye");


accountEyeButtons.forEach(
  function (eyeButton) {

    eyeButton.addEventListener(
      "click",
      function () {

        const accountId =
          Number(eyeButton.dataset.id);


        const account =
          accounts.find(
            account => account.id === accountId
          );


        const balanceElement =
          document.getElementById(
            `account-balance-${accountId}`
          );


        if (!account || !balanceElement) {
          return;
        }


        accountVisibility[accountId] =
          !accountVisibility[accountId];


        // ==============================
        // SHOW ACCOUNT BALANCE
        // ==============================

        if (accountVisibility[accountId]) {

          balanceElement.textContent =
            formatMoney(account.balance);


          eyeButton.innerHTML = `

            <i
              data-lucide="eye-off"
              class="w-4 h-4"
            ></i>

          `;

        }


        // ==============================
        // HIDE ACCOUNT BALANCE
        // ==============================

        else {

          balanceElement.textContent =
            "••••••";


          eyeButton.innerHTML = `

            <i
              data-lucide="eye"
              class="w-4 h-4"
            ></i>

          `;

        }


        lucide.createIcons();

      }
    );

  }
);


// ========================================
// STATISTICS
// ========================================

const statisticsIncome =
  document.getElementById(
    "statistics-income"
  );


const statisticsExpense =
  document.getElementById(
    "statistics-expense"
  );


const incomeBar =
  document.getElementById(
    "income-bar"
  );


const expenseBar =
  document.getElementById(
    "expense-bar"
  );


// Display income

if (statisticsIncome && income) {

  statisticsIncome.textContent =
    formatMoney(income.amount);

}


// Display expense

if (statisticsExpense && expense) {

  statisticsExpense.textContent =
    formatMoney(expense.amount);

}


// Income bar

if (incomeBar) {

  incomeBar.style.width = "100%";

}


// Expense bar

if (
  expenseBar &&
  income &&
  income.amount > 0
) {

  const expensePercentage =
    (
      expense.amount /
      income.amount
    ) * 100;


  expenseBar.style.width =
    `${expensePercentage}%`;

}


// ========================================
// RENDER TRANSACTIONS
// ========================================

const transactionsContainer =
  document.getElementById(
    "transactions-container"
  );


if (transactionsContainer) {

  transactionsContainer.innerHTML = "";


  transactions.forEach(
    function (transaction) {

      const isIncome =
        transaction.amount > 0;


      const amountClass =
        isIncome
          ? "text-reen-green"
          : "text-red-500";


      const sign =
        isIncome
          ? "+"
          : "-";


      const formattedAmount =
        formatMoney(
          Math.abs(transaction.amount)
        )
          .replace("₦", "")
          .trim();


      const transactionHTML = `

        <div
          class="flex justify-between items-center border-b border-gray-100 pb-3"
        >

          <div class="flex-1">

            <p
              class="text-xs md:text-sm text-gray-500 font-medium"
            >
              ${transaction.name}
            </p>


            <p
              class="text-[10px] md:text-xs text-gray-400 md:hidden"
            >
              ${transaction.date}
              -
              ${transaction.time}
            </p>

          </div>


          <p
            class="text-xs text-gray-400 hidden md:block px-2"
          >
            ${transaction.date}
            -
            ${transaction.time}
          </p>


          <p
            class="${amountClass} font-bold text-xs md:text-sm text-right"
          >
            ${sign} ₦${formattedAmount}
          </p>

        </div>

      `;


      transactionsContainer.insertAdjacentHTML(
        "beforeend",
        transactionHTML
      );
      const transactionRow = transactionsContainer.lastElementChild;
      transactionRow.dataset.dashboardSearchItem = "transaction";
      transactionRow.dataset.searchText = `${transaction.name} ${transaction.bank || ""}`;

    }
  );

}

// ========================================
// DASHBOARD SEARCH
// ========================================

const dashboardSearch = document.getElementById("dashboard-search");
const accountsEmptyState = document.getElementById("accounts-empty-state");
const transactionsEmptyState = document.getElementById("transactions-empty-state");

if (dashboardSearch) {
  dashboardSearch.addEventListener("input", function () {
    const query = dashboardSearch.value.trim().toLowerCase();
    const accountItems = document.querySelectorAll('[data-dashboard-search-item="account"]');
    const transactionItems = document.querySelectorAll('[data-dashboard-search-item="transaction"]');

    function filterItems(items, emptyState) {
      let visibleCount = 0;
      items.forEach(function (item) {
        const matches = item.dataset.searchText.toLowerCase().includes(query);
        item.classList.toggle("hidden", !matches);
        if (matches) visibleCount += 1;
      });
      if (emptyState) emptyState.classList.toggle("hidden", visibleCount > 0);
    }

    filterItems(accountItems, accountsEmptyState);
    filterItems(transactionItems, transactionsEmptyState);
  });
}

// ========================================
// NOTIFICATIONS
// ========================================

const notificationButton = document.getElementById("notification-button");
const notificationPanel = document.getElementById("notification-panel");
const notificationList = document.getElementById("notification-list");
const notificationIndicator = document.getElementById("notification-indicator");
const notificationReadKey = "reenReadNotifications";
let readNotificationIds = [];

try {
  const savedReadIds = JSON.parse(localStorage.getItem(notificationReadKey) || "[]");
  if (Array.isArray(savedReadIds)) readNotificationIds = savedReadIds.map(String);
} catch (error) {
  readNotificationIds = [];
}

function renderNotifications() {
  if (!notificationList) return;
  notificationList.replaceChildren();

  if (transactions.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "py-3 text-sm text-gray-500";
    emptyMessage.textContent = "No recent activity yet.";
    notificationList.append(emptyMessage);
    return;
  }

  transactions.forEach(function (transaction) {
    const link = document.createElement("a");
    link.href = "transaction.html";
    link.className = "block rounded-lg px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-reen-green";

    const title = document.createElement("span");
    title.className = "block truncate text-sm font-medium text-gray-800";
    title.textContent = transaction.name || "Account activity";

    const detail = document.createElement("span");
    detail.className = "mt-1 block text-xs text-gray-500";
    const sign = Number(transaction.amount) >= 0 ? "+" : "-";
    detail.textContent = `${sign} ${formatMoney(Math.abs(Number(transaction.amount) || 0))} · ${transaction.date || ""} ${transaction.time || ""}`;

    link.append(title, detail);
    notificationList.append(link);
  });
}

function updateNotificationIndicator() {
  if (!notificationIndicator) return;
  const hasUnread = transactions.some(function (transaction) {
    return !readNotificationIds.includes(String(transaction.id));
  });
  notificationIndicator.classList.toggle("hidden", !hasUnread);
}

function closeNotificationPanel() {
  if (!notificationPanel || !notificationButton) return;
  notificationPanel.classList.add("hidden");
  notificationButton.setAttribute("aria-expanded", "false");
}

if (notificationButton && notificationPanel) {
  renderNotifications();
  updateNotificationIndicator();

  notificationButton.addEventListener("click", function () {
    const isOpen = !notificationPanel.classList.contains("hidden");
    if (isOpen) {
      closeNotificationPanel();
      return;
    }

    notificationPanel.classList.remove("hidden");
    notificationButton.setAttribute("aria-expanded", "true");
    readNotificationIds = Array.from(new Set([
      ...readNotificationIds,
      ...transactions.map(transaction => String(transaction.id))
    ]));
    localStorage.setItem(notificationReadKey, JSON.stringify(readNotificationIds));
    updateNotificationIndicator();
  });

  document.addEventListener("click", function (event) {
    if (!notificationPanel.contains(event.target) && !notificationButton.contains(event.target)) {
      closeNotificationPanel();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeNotificationPanel();
  });
}