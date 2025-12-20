document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'hrboard_employees';
  const ctx = document.getElementById('employeesChart').getContext('2d');

  let employeesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Inactive'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#3b82f6','#f87171'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 }, boxWidth: 12 } }
      }
    }
  });

  function getStorage(){ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  function setStorage(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

  function renderEmployees(){
    const employees = getStorage();
    const tbody = document.querySelector('.employees-table tbody');
    tbody.innerHTML = '';

    employees.forEach((emp,i) => {
      const tr = document.createElement('tr');
      tr.dataset.index = i;
      tr.innerHTML = `
        <td>${emp.firstName}</td>
        <td>${emp.lastName}</td>
        <td>${emp.department || '-'}</td>
        <td class="${emp.status==='active'?'emp-status-active':'emp-status-inactive'}">
          <i class="fa-solid ${emp.status==='active'?'fa-check':'fa-clock'}"></i> ${emp.status}
        </td>
      `;
      tbody.appendChild(tr);
    });

    updateKPIs();
    updateChart();
  }

  function updateChart(){
    const employees = getStorage();
    const active = employees.filter(e => e.status==='active').length;
    const inactive = employees.length - active;
    employeesChart.data.datasets[0].data = [active, inactive];
    employeesChart.update();
  }

  function updateKPIs(){
    const employees = getStorage();
    const total = employees.length;
    const activeCount = employees.filter(e => e.status==='active').length;
    const kpis = document.querySelectorAll('.emp-kpi-content p');
    if(kpis.length>=2){ kpis[0].textContent = total; kpis[1].textContent = activeCount; }
  }

  // Add employee: modal handled in global script; keep fallback function available but not auto-invoked

  // If modal isn't available, fallback to prompts
  function openModalFallback(){
    const firstName = prompt('First Name');
    const lastName = prompt('Last Name');
    const department = prompt('Department');
    const status = prompt('Status (active/inactive)').toLowerCase();
    if(!firstName || !lastName || (status!=='active' && status!=='inactive')) return alert('Invalid input');
    const employees = getStorage();
    employees.push({firstName, lastName, department, status});
    setStorage(employees);
    renderEmployees();
  }

  // Listen for modal submissions
  window.addEventListener('modalSubmit', (e) => {
    const d = e.detail;
    if (!d || d.type !== 'employee') return;
    const payload = d.data;
    const employees = getStorage();
    employees.push({ firstName: payload.firstName, lastName: payload.lastName, department: payload.department, status: payload.status });
    setStorage(employees);
    renderEmployees();
  });

  // Toggle status by clicking on status cell
  document.querySelector('.employees-table tbody').addEventListener('click', e => {
    const td = e.target.closest('td');
    if(!td || td.cellIndex !== 3) return;
    const tr = td.parentElement;
    const index = Number(tr.dataset.index);
    const employees = getStorage();
    employees[index].status = employees[index].status==='active'?'inactive':'active';
    setStorage(employees);
    renderEmployees();
  });

  // Init demo employees only if none exist
  (function initDemoIfEmpty(){
    const existing = getStorage();
    if (existing.length > 0) { renderEmployees(); return; }
    const demo = [
      {firstName:'John', lastName:'Doe', department:'IT', status:'active'},
      {firstName:'Jane', lastName:'Smith', department:'HR', status:'inactive'},
      {firstName:'Alice', lastName:'Brown', department:'Marketing', status:'active'}
    ];
    setStorage(demo);
    renderEmployees();
  })();

});
