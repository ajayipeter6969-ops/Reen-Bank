// ================================
// ACCOUNT BALANCE SHOW / HIDE
// ================================

const storedAccounts = getAccounts();

function formatAccountBalance(balance) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(Number(balance) || 0);
}

const transactionAccounts = [
  {
    eye: document.getElementById("main-eye"),
    balance: document.getElementById("main-balance"),
    amount: formatAccountBalance(
      storedAccounts.find(account => account.type === "main")?.balance
    ),
    visible: true
  },

  {
    eye: document.getElementById("school-eye"),
    balance: document.getElementById("school-balance"),
    amount: formatAccountBalance(
      storedAccounts.find(account => account.name === "School Savings")?.balance
    ),
    visible: true
  },

  {
    eye: document.getElementById("holiday-eye"),
    balance: document.getElementById("holiday-balance"),
    amount: formatAccountBalance(
      storedAccounts.find(account => account.name === "Holiday Plan")?.balance
    ),
    visible: true
  }
];

transactionAccounts.forEach(function (account) {

  account.balance.textContent = account.amount;
  account.eye.addEventListener("click", function () {

    // Toggle true / false
    account.visible = !account.visible;

    if (account.visible) {

      // Show balance
      account.balance.textContent = account.amount;

      // Show eye-off icon
      account.eye.innerHTML = `
        <i data-lucide="eye-off" class="w-4 h-4"></i>
      `;

    } else {

      // Hide balance
      account.balance.textContent = "••••••";

      // Show eye icon
      account.eye.innerHTML = `
        <i data-lucide="eye" class="w-4 h-4"></i>
      `;
    }

    // Re-render Lucide icon
    lucide.createIcons();
  });

});