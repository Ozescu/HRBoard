/*
  Fichier: departemets.js
  Rôle: gestion du stockage local (localStorage) pour les départements, rendu du
  tableau des départements, mise à jour des KPI et du graphique en doughnut
  représentant les départements actifs vs en croissance. Les commentaires
  inline ont été supprimés; description générale ci-dessus.
*/

const STORAGE_KEY = 'hrboard_departments';

function getStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function setStorage(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

let departmentChart = null;
const deptCanvas = document.getElementById('departmentChart');
if (deptCanvas) {
  const deptChartCtx = deptCanvas.getContext('2d');
  departmentChart = new Chart(deptChartCtx, {
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
}

function updateChart(departments) {
  if (!departmentChart) return;
  const active = departments.filter(d => d.status === 'active').length;
  const growing = departments.length - active;
  departmentChart.data.datasets[0].data = [active, growing];
  departmentChart.update();
}

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

const addBtn = document.querySelector('.dept-add-btn');
if (addBtn) addBtn.addEventListener('click', () => {});

window.addEventListener('modalSubmit', (e) => {
  const d = e.detail;
  if (!d || d.type !== 'department') return;
  const payload = d.data;
  const departments = getStorage();
  departments.push({ name: payload.name, manager: payload.manager, employees: Number(payload.employees||0), status: payload.status });
  setStorage(departments);
  renderDepartments();
});

function initDemoDataIfEmpty() {
  const existing = getStorage();
  if (existing.length > 0) { renderDepartments(); return; }
  const demoDepartments = [
    { name: 'IT', manager: 'Ahmed Benali', employees: 35, status: 'active' },
    { name: 'Human Resources', manager: 'Imane Zahra', employees: 15, status: 'active' },
    { name: 'Marketing', manager: 'Sarah El Idrissi', employees: 20, status: 'growing' },
    { name: 'Finance', manager: 'Yahya Guirnaoui', employees: 17, status: 'active' }
  ];
  setStorage(demoDepartments);
  renderDepartments();
}

initDemoDataIfEmpty();
