const accountGrid = document.getElementById("account-grid");
const addAccountButton = document.getElementById("add-account-button");
const hiddenBalances = new Set();

function formatBalance(balance) {
  return `₦ ${Number(balance).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function makeAccountCard(account) {
  const card = makeElement("div", "bg-reen-light rounded-2xl p-6 shadow-sm flex flex-col justify-between h-48");
  card.dataset.accountId = account.id;

  const top = makeElement("div", "flex justify-between items-start");
  const details = makeElement("div", "");
  details.append(
    makeElement("p", "account-name text-reen-purple text-sm font-medium mb-1", account.name),
    makeElement("p", "account-balance text-2xl font-bold text-gray-900")
  );

  const eyeButton = makeElement("button", "text-gray-500 hover:text-gray-700");
  eyeButton.type = "button";
  eyeButton.dataset.action = "toggle-balance";
  eyeButton.dataset.accountId = account.id;
  top.append(details, eyeButton);

  const actions = makeElement("div", "flex gap-3 mt-4");
  [
    ["Fund", "fund", "flex-1 bg-reen-green text-white text-sm font-medium py-2 rounded-lg hover:bg-green-600 transition-colors"],
    ["Withdraw", "withdraw", "flex-1 bg-[#D1EBE1] text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-200 transition-colors"]
  ].forEach(function ([label, action, className]) {
    const button = makeElement("button", className, label);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.accountId = account.id;
    actions.append(button);
  });

  card.append(top, actions);
  return card;
}

function renderAccounts() {
  getAccounts().forEach(function (account) {
    let card = Array.from(accountGrid.querySelectorAll("[data-account-id]"))
      .find(function (candidate) {
        return candidate.dataset.accountId === String(account.id);
      });

    if (!card) {
      card = makeAccountCard(account);
      accountGrid.insertBefore(card, addAccountButton);
    }

    const name = card.querySelector(".account-name");
    const balance = card.querySelector(".account-balance");
    if (name) name.textContent = account.name;
    if (balance) {
      balance.textContent = hiddenBalances.has(String(account.id))
        ? "••••••"
        : formatBalance(account.balance);
    }

    const eyeButton = card.querySelector('[data-action="toggle-balance"]');
    if (eyeButton) {
      const hidden = hiddenBalances.has(String(account.id));
      eyeButton.setAttribute("aria-label", hidden ? "Show balance" : "Hide balance");
      eyeButton.innerHTML = `<i data-lucide="${hidden ? "eye" : "eye-off"}" class="w-4 h-4"></i>`;
    }
  });
  if (window.lucide) {
    lucide.createIcons();
  }
}

renderAccounts();

const accountActionModal = document.getElementById("account-action-modal");
const accountActionForm = document.getElementById("account-action-form");
const accountActionAmount = document.getElementById("account-action-amount");
const accountActionBank = document.getElementById("account-action-bank");
const accountActionBankField = document.getElementById("account-action-bank-field");
const creditPaymentFields = document.getElementById("credit-payment-fields");
const creditCardNumber = document.getElementById("credit-card-number");
const creditCardCvv = document.getElementById("credit-card-cvv");
const creditCardExpiry = document.getElementById("credit-card-expiry");
const fundPaymentMethods = document.getElementById("fund-payment-methods");
const accountActionError = document.getElementById("account-action-error");
let selectedAccountId = null;
let selectedAction = null;
let lastActionTrigger = null;

function updateFundingMethodFields() {
  const selectedMethod = accountActionForm.querySelector(
    'input[name="payment-method"]:checked'
  )?.value;
  const isFunding = selectedAction === "fund";
  const isCreditPay = isFunding && selectedMethod === "credit";

  fundPaymentMethods.hidden = !isFunding;
  fundPaymentMethods.disabled = !isFunding;
  accountActionBankField.hidden = isCreditPay;
  accountActionBank.required = !isCreditPay;
  creditPaymentFields.classList.toggle("hidden", !isCreditPay);
  if (!isCreditPay) {
    creditCardNumber.value = "";
    creditCardCvv.value = "";
    creditCardExpiry.value = "";
  }
  if (!isFunding) {
    creditPaymentFields.classList.add("hidden");
  }
}

function openAccountAction(accountId, action, trigger) {
  const account = getAccountById(accountId);
  if (!account) return;

  selectedAccountId = account.id;
  selectedAction = action;
  lastActionTrigger = trigger;
  accountActionForm.reset();
  accountActionError.textContent = "";
  updateFundingMethodFields();
  document.getElementById("account-action-title").textContent =
    action === "fund" ? "Fund account" : "Withdraw from account";
  document.getElementById("account-action-bank-label").textContent =
    action === "fund" ? "Bank you are funding from" : "Bank to withdraw to";
  document.getElementById("account-action-name").textContent = account.name;
  document.getElementById("submit-account-action").textContent =
    action === "fund" ? "Fund" : "Withdraw";
  accountActionModal.classList.add("app-modal-open");
  accountActionAmount.focus();
}

function closeAccountAction() {
  accountActionModal.classList.remove("app-modal-open");
  if (lastActionTrigger) lastActionTrigger.focus();
}

accountGrid.addEventListener("click", function (event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const accountId = button.dataset.accountId;
  if (button.dataset.action === "toggle-balance") {
    if (hiddenBalances.has(accountId)) hiddenBalances.delete(accountId);
    else hiddenBalances.add(accountId);
    renderAccounts();
    return;
  }

  openAccountAction(accountId, button.dataset.action, button);
});

fundPaymentMethods.addEventListener("change", updateFundingMethodFields);

accountActionForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const account = getAccountById(selectedAccountId);
  const amount = Number(accountActionAmount.value);
  const bank = accountActionBank.value.trim();
  const paymentMethod = accountActionForm.querySelector(
    'input[name="payment-method"]:checked'
  )?.value;
  const cardNumber = creditCardNumber.value.trim().replace(/\s+/g, "");
  const cardCvv = creditCardCvv.value.trim();
  const cardExpiry = creditCardExpiry.value.trim();

  if (!account || !Number.isFinite(amount) || amount <= 0) {
    accountActionError.textContent = "Enter an amount greater than zero.";
    return;
  }
  if ((selectedAction === "withdraw" || paymentMethod === "direct") && !bank) {
    accountActionError.textContent = "Choose or enter a bank.";
    accountActionBank.focus();
    return;
  }
  if (selectedAction === "fund" && paymentMethod === "credit") {
    if (!/^[0-9]{15,19}$/.test(cardNumber)) {
      accountActionError.textContent = "Enter a valid card number.";
      creditCardNumber.focus();
      return;
    }
    if (!/^[0-9]{3,4}$/.test(cardCvv)) {
      accountActionError.textContent = "Enter a valid CVV.";
      creditCardCvv.focus();
      return;
    }
    if (!/^[0-9]{4}$/.test(cardExpiry)) {
      accountActionError.textContent = "Enter a valid expiry year.";
      creditCardExpiry.focus();
      return;
    }
  }
  if (selectedAction === "withdraw" && amount > Number(account.balance)) {
    accountActionError.textContent = "The withdrawal exceeds this account's balance.";
    return;
  }

  const signedAmount = selectedAction === "fund" ? amount : -amount;
  const updated = updateAccount(account.id, {
    balance: Number(account.balance) + signedAmount
  });
  if (!updated) {
    accountActionError.textContent = "This account could not be updated.";
    return;
  }

  const now = new Date();
  const paymentSource = selectedAction === "fund" && paymentMethod === "credit"
    ? `Credit Pay • ${cardNumber.slice(-4)}`
    : bank;
  addTransaction({
    name: `${account.name} - ${paymentSource}`,
    amount: signedAmount,
    bank: paymentSource,
    date: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  });
  renderAccounts();
  closeAccountAction();
});

document.getElementById("cancel-account-action").addEventListener("click", closeAccountAction);
accountActionModal.addEventListener("click", function (event) {
  if (event.target === accountActionModal) closeAccountAction();
});

const addAccountModal = document.getElementById("add-account-modal");
const addAccountForm = document.getElementById("add-account-form");
const newAccountName = document.getElementById("new-account-name");
const addAccountError = document.getElementById("add-account-error");

function closeAddAccount() {
  addAccountModal.classList.remove("app-modal-open");
  addAccountButton.focus();
}

addAccountButton.addEventListener("click", function () {
  addAccountForm.reset();
  addAccountError.textContent = "";
  addAccountModal.classList.add("app-modal-open");
  newAccountName.focus();
});

addAccountForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = newAccountName.value.trim();
  const duplicate = getAccounts().some(function (account) {
    return account.name.toLowerCase() === name.toLowerCase();
  });

  if (!name) {
    addAccountError.textContent = "Enter a name for this account.";
    return;
  }
  if (duplicate) {
    addAccountError.textContent = "An account with this name already exists.";
    return;
  }

  addAccount({ name: name, balance: 0, type: "savings" });
  renderAccounts();
  closeAddAccount();
});

document.getElementById("cancel-add-account").addEventListener("click", closeAddAccount);
addAccountModal.addEventListener("click", function (event) {
  if (event.target === addAccountModal) closeAddAccount();
});
