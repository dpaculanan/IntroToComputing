const assignmentPanels = document.querySelectorAll('.assignment-panel');
const assignmentTitle = document.querySelector('#assignment-title');
const assignmentLabel = document.querySelector('#assignment-label');
const homeView = document.querySelector('#home-view');
const workspace = document.querySelector('.workspace');
const navigationLinks = document.querySelectorAll('[data-page]');
const projectsMenu = document.querySelector('.projects-menu');

const assignmentInfo = {
  conversion: { number: '01', name: 'CONVERSION', title: 'Convert a unit.' },
  tax: { number: '02', name: 'INCOME TAX', title: 'Calculate income tax.' },
  sequences: { number: '03', name: 'NUMBER LOOPS', title: 'Count it three ways.' },
  payroll: { number: '04', name: 'SIMPLE PAYROLL', title: 'Manage the payroll list.' }
};

function showPage() {
  const project = window.location.hash.match(/^#project-(conversion|tax|sequences|payroll)$/)?.[1];
  const page = project || 'home';
  const info = project ? assignmentInfo[project] : null;
  homeView.hidden = Boolean(project);
  workspace.hidden = !project;
  navigationLinks.forEach((link) => {
    const isActive = link.dataset.page === page;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  projectsMenu.querySelector('summary').classList.toggle('active', Boolean(project));
  assignmentPanels.forEach((panel) => {
    const isActive = panel.id === `project-${project}`;
    panel.hidden = !isActive;
    panel.classList.toggle('active', isActive);
  });
  if (info) {
    assignmentTitle.textContent = info.title;
    assignmentLabel.innerHTML = `PROJECT ${info.number} <span>/</span> ${info.name}`;
    document.title = `${info.title} — Dave's Humble Abode`;
  } else {
    document.title = "Dave's Humble Abode";
  }
  projectsMenu.open = false;
}

window.addEventListener('hashchange', showPage);
showPage();

const conversionOptions = {
  'c-to-f': {
    from: '°C', to: '°F', formula: 'Formula: °F = (°C × 9/5) + 32',
    convert: (value) => value * 9 / 5 + 32
  },
  'f-to-c': {
    from: '°F', to: '°C', formula: 'Formula: °C = (°F − 32) × 5/9',
    convert: (value) => (value - 32) * 5 / 9
  },
  'm-to-ft': {
    from: 'm', to: 'ft', formula: 'Formula: feet = meters × 3.28084',
    convert: (value) => value * 3.28084
  },
  'ft-to-m': {
    from: 'ft', to: 'm', formula: 'Formula: meters = feet × 0.3048',
    convert: (value) => value * 0.3048
  }
};

const conversionType = document.querySelector('#conversion-type');
const conversionInput = document.querySelector('#conversion-value');
const conversionUnit = document.querySelector('#conversion-unit');
const conversionUnitSuffix = document.querySelector('#conversion-unit-suffix');
const conversionFormula = document.querySelector('#conversion-formula');
const conversionResult = document.querySelector('#conversion-result');

function updateConversionLabels() {
  const option = conversionOptions[conversionType.value];
  conversionUnit.textContent = option.from;
  conversionUnitSuffix.textContent = option.from;
  conversionFormula.textContent = option.formula;
  conversionInput.setAttribute('aria-label', `Value in ${option.from}`);
  conversionInput.placeholder = option.from === '°C' ? 'e.g. 24' : option.from === '°F' ? 'e.g. 75' : 'e.g. 10';
}

function showError(container, message) {
  container.innerHTML = `<span class="result-label">CHECK YOUR INPUT</span><p class="result-placeholder result-error">${message}</p>`;
}

conversionType.addEventListener('change', updateConversionLabels);
document.querySelector('#convert-button').addEventListener('click', () => {
  const rawValue = conversionInput.value.trim();
  if (rawValue === '' || !Number.isFinite(Number(rawValue))) {
    showError(conversionResult, 'Enter a number to convert.');
    conversionInput.focus();
    return;
  }
  const option = conversionOptions[conversionType.value];
  const value = Number(rawValue);
  const answer = option.convert(value);
  conversionResult.innerHTML = `<span class="result-label">YOUR RESULT</span><p class="result-value">${formatNumber(answer)} <span class="result-detail">${option.to}</span></p><p class="result-detail">${formatNumber(value)} ${option.from} converted to ${formatNumber(answer)} ${option.to}</p>`;
});

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);
}

function formatPeso(value) {
  return `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
}

document.querySelector('#tax-button').addEventListener('click', () => {
  const incomeInput = document.querySelector('#tax-income');
  const taxableIncome = Number(incomeInput.value);
  const result = document.querySelector('#tax-result');
  if (incomeInput.value.trim() === '' || !Number.isFinite(taxableIncome) || taxableIncome < 0) {
    showError(result, 'Enter a taxable income of ₱0 or more.');
    incomeInput.focus();
    return;
  }

  let basicTax = 0;
  let rate = 0;
  let bracketFloor = 0;
  let formula = '0%';

  if (taxableIncome <= 250000) {
    formula = '0%';
  } else if (taxableIncome <= 400000) {
    bracketFloor = 250000;
    rate = 0.20;
    formula = '20% of excess over ₱250,000';
  } else if (taxableIncome <= 800000) {
    basicTax = 30000;
    bracketFloor = 400000;
    rate = 0.25;
    formula = '₱30,000 + 25% of excess over ₱400,000';
  } else if (taxableIncome <= 2000000) {
    basicTax = 130000;
    bracketFloor = 800000;
    rate = 0.30;
    formula = '₱130,000 + 30% of excess over ₱800,000';
  } else if (taxableIncome <= 8000000) {
    basicTax = 490000;
    bracketFloor = 2000000;
    rate = 0.32;
    formula = '₱490,000 + 32% of excess over ₱2,000,000';
  } else {
    basicTax = 2410000;
    bracketFloor = 8000000;
    rate = 0.35;
    formula = '₱2,410,000 + 35% of excess over ₱8,000,000';
  }

  const tax = basicTax + (taxableIncome - bracketFloor) * rate;
  result.innerHTML = `<span class="result-label">INCOME TAX</span><p class="result-value">${formatPeso(tax)}</p><div class="result-list"><div class="result-row"><span>Taxable income</span><strong>${formatPeso(taxableIncome)}</strong></div><div class="result-row"><span>Calculation</span><strong>${formula}</strong></div></div>`;
});

document.querySelector('#sequence-button').addEventListener('click', () => {
  const input = document.querySelector('#sequence-n');
  const count = Number(input.value);
  const result = document.querySelector('#sequence-result');
  if (input.value.trim() === '' || !Number.isInteger(count) || count < 1 || count > 10000) {
    showError(result, 'Enter a whole number from 1 to 10,000.');
    input.focus();
    return;
  }

  let factorial = 1;
  let factor = 1;
  while (factor <= count) {
    factorial *= factor;
    factor += 1;
  }

  let sum = 0;
  let current = 1;
  do {
    sum += current;
    current += 1;
  } while (current <= count);

  let total = 0;
  for (let number = 1; number <= count; number += 1) {
    total += number;
  }
  const average = total / count;

  result.innerHTML = `<span class="result-label">LOOP RESULTS FOR N = ${count}</span><div class="result-list"><div class="result-row"><span>Factorial <small>(while loop)</small></span><strong>${factorial.toLocaleString('en-US')}</strong></div><div class="result-row"><span>Sum <small>(do while loop)</small></span><strong>${sum.toLocaleString('en-US')}</strong></div><div class="result-row"><span>Average <small>(for loop)</small></span><strong>${formatNumber(average)}</strong></div></div>`;
});

const employees = [];
const payrollList = document.querySelector('#payroll-list');
const payResult = document.querySelector('#pay-result');
const employeeNameInput = document.querySelector('#employee-name');
const daysWorkedInput = document.querySelector('#days-worked');
const dailyRateInput = document.querySelector('#daily-rate');
const deductionInput = document.querySelector('#pay-deduction');

// here's dave's little employee parade.
function renderPayrollList() {
  payrollList.replaceChildren();
  if (employees.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'payroll-empty';
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 7;
    emptyCell.textContent = 'No employees in the payroll list yet.';
    emptyRow.append(emptyCell);
    payrollList.append(emptyRow);
    return;
  }

  employees.forEach((employee, index) => {
    const row = document.createElement('tr');
    const values = [
      index + 1,
      employee.name,
      formatNumber(employee.daysWorked),
      formatPeso(employee.dailyRate),
      formatPeso(employee.grossPay),
      formatPeso(employee.deduction),
      formatPeso(employee.netPay)
    ];
    values.forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });
    payrollList.append(row);
  });
}

document.querySelector('#pay-button').addEventListener('click', () => {
  const name = employeeNameInput.value.trim();
  const daysWorked = Number(daysWorkedInput.value);
  const dailyRate = Number(dailyRateInput.value);
  const deduction = deductionInput.value.trim() === '' ? 0 : Number(deductionInput.value);

  if (name === '') {
    showError(payResult, 'Enter the employee name.');
    employeeNameInput.focus();
    return;
  }
  if (daysWorkedInput.value.trim() === '' || !Number.isFinite(daysWorked) || daysWorked < 0) {
    showError(payResult, 'Enter days worked of 0 or more.');
    daysWorkedInput.focus();
    return;
  }
  if (dailyRateInput.value.trim() === '' || !Number.isFinite(dailyRate) || dailyRate < 0) {
    showError(payResult, 'Enter a daily rate of ₱0 or more.');
    dailyRateInput.focus();
    return;
  }
  if (!Number.isFinite(deduction) || deduction < 0) {
    showError(payResult, 'Deduction amount must be ₱0 or more.');
    deductionInput.focus();
    return;
  }

  // cute face, serious math: days worked times the daily rate.
  const grossPay = daysWorked * dailyRate;
  employees.push({ name, daysWorked, dailyRate, grossPay, deduction, netPay: grossPay - deduction });
  renderPayrollList();
  payResult.innerHTML = '<span class="result-label">PAYROLL UPDATED</span><p class="result-placeholder">Employee added to the payroll list.</p>';
  employeeNameInput.value = '';
  daysWorkedInput.value = '';
  dailyRateInput.value = '';
  deductionInput.value = '';
  employeeNameInput.focus();
});

document.querySelector('#delete-employee-button').addEventListener('click', () => {
  const lineInput = document.querySelector('#delete-line');
  const lineNumber = Number(lineInput.value);
  if (employees.length === 0) {
    showError(payResult, 'There are no employees to delete.');
    lineInput.focus();
    return;
  }
  if (lineInput.value.trim() === '' || !Number.isInteger(lineNumber) || lineNumber < 1 || lineNumber > employees.length) {
    showError(payResult, `Enter a line number from 1 to ${employees.length}.`);
    lineInput.focus();
    return;
  }

  employees.splice(lineNumber - 1, 1);
  renderPayrollList();
  payResult.innerHTML = '<span class="result-label">PAYROLL UPDATED</span><p class="result-placeholder">Employee deleted and line numbers updated.</p>';
  lineInput.value = '';
});

updateConversionLabels();