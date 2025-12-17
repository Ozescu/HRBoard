/* ---------- STORAGE ---------- */
const STORAGE_KEY = 'hrboard_departments';

function getStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function setStorage(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

/* ---------- CHART ---------- */
const deptChartCtx = document.getElementById('departmentChart').getContext('2d');
let departmentChart = new Chart(deptChartCtx, {
  type: 'doughnut',
  data: {
    labels: ['Active', 'Growing'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#16a34a', '#f59e0b'],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 }, boxWidth: 12 }
      }
    }
  }
});

function updateChart(departments) {
  const active = departments.filter(d => d.status === 'active').length;
  const growing = departments.length - active;
  departmentChart.data.datasets[0].data = [active, growing];
  departmentChart.update();
}

/* ---------- RENDER TABLE ---------- */
const tableBody = document.querySelector('.dept-table tbody');
function renderDepartments() {
  const departments = getStorage();
  tableBody.innerHTML = '';

  departments.forEach((dept, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    tr.innerHTML = `
      <td>${dept.name}</td>
      <td>${dept.manager}</td>
      <td>${dept.employees}</td>
      <td class="${dept.status==='active'?'dept-status-active':'dept-status-growing'}">
        <i class="fa-solid ${dept.status==='active'?'fa-check':'fa-clock'}"></i> ${dept.status}
      </td>
    `;
    tableBody.appendChild(tr);
  });

  updateKPIs();
  updateChart(departments);
}

/* ---------- KPI ---------- */
function updateKPIs() {
  const departments = getStorage();
  const totalDepartments = departments.length;
  const totalEmployees = departments.reduce((sum, d) => sum + d.employees, 0);
  const kpis = document.querySelectorAll('.dept-kpi-content p');
  if (kpis.length >= 2) {
    kpis[0].textContent = totalDepartments;
    kpis[1].textContent = totalEmployees;
  }
}

/* ---------- ADD DEPARTMENT ---------- */
document.querySelector('.dept-add-btn').addEventListener('click', () => {
  const name = prompt('Department name');
  const manager = prompt('Manager name');
  const employees = prompt('Number of employees');
  if (!name || !manager || !employees) return;

  const departments = getStorage();
  departments.push({
    name,
    manager,
    employees: Number(employees),
    status: Math.random() > 0.5 ? 'active' : 'growing'
  });

  setStorage(departments);
  renderDepartments();
});

/* ---------- INIT DEMO DATA ---------- */
function initDemoData() {
  const demoDepartments = [
    { name: 'IT', manager: 'Ahmed Benali', employees: 35, status: 'active' },
    { name: 'Human Resources', manager: 'Imane Zahra', employees: 15, status: 'active' },
    { name: 'Marketing', manager: 'Sarah El Idrissi', employees: 20, status: 'growing' },
    { name : 'finance',manager :'yahya Guirnaoui' , employees : 17 , status : 'active'}
  ];
  setStorage(demoDepartments);
  renderDepartments();
}

// Reset localStorage for demo
localStorage.removeItem(STORAGE_KEY);
initDemoData();
