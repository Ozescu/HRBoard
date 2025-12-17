document.addEventListener('DOMContentLoaded', () => {

  // ----- STORAGE KEYS -----
  const STORAGE_KEYS = {
    interviews: 'hrboard_interviews',
    tasks: 'hrboard_tasks',
    employees: 'hrboard_employees',
    meetings: 'hrboard_meetings',
    departments: 'hrboard_departments',
    meta: 'hrboard_meta'
  };

  function getStorage(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  }

  function setStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ----- DEPARTMENTS -----
  const ctxDept = document.getElementById('departmentChart').getContext('2d');
  let departmentChart = new Chart(ctxDept, {
    type: 'doughnut',
    data: { labels:['Active','Growing'], datasets:[{data:[0,0], backgroundColor:['#16a34a','#f59e0b'], borderWidth:1}] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{size:12}, boxWidth:12 } } } }
  });

  function renderDepartments() {
    const departments = getStorage(STORAGE_KEYS.departments);
    const tbody = document.querySelector('.dept-table tbody');
    tbody.innerHTML = '';
    departments.forEach((d,i)=>{
      const tr = document.createElement('tr');
      tr.dataset.index = i;
      tr.innerHTML = `
        <td>${d.name}</td>
        <td>${d.manager}</td>
        <td>${d.employees}</td>
        <td class="${d.status==='active'?'dept-status-active':'dept-status-growing'}">
          <i class="fa-solid ${d.status==='active'?'fa-check':'fa-clock'}"></i> ${d.status}
        </td>
      `;
      tbody.appendChild(tr);
    });
    updateDepartmentsKPIs();
    updateDepartmentChart();
  }

  function updateDepartmentChart() {
    const departments = getStorage(STORAGE_KEYS.departments);
    const active = departments.filter(d=>d.status==='active').length;
    const growing = departments.length - active;
    departmentChart.data.datasets[0].data = [active,growing];
    departmentChart.update();
  }

  function updateDepartmentsKPIs() {
    const departments = getStorage(STORAGE_KEYS.departments);
    const totalEmployees = departments.reduce((sum,d)=>sum+d.employees,0);
    const kpis = document.querySelectorAll('.dept-kpi-content p');
    if(kpis.length>=2){
      kpis[0].textContent = departments.length;
      kpis[1].textContent = totalEmployees;
    }
  }

  document.querySelector('.dept-add-btn').addEventListener('click', ()=>{
    const name = prompt('Department name');
    const manager = prompt('Manager name');
    const employees = prompt('Number of employees');
    const status = prompt('Status (active/growing)').toLowerCase();
    if(!name || !manager || !employees || (status!=='active' && status!=='growing')) return alert('Invalid input');
    const departments = getStorage(STORAGE_KEYS.departments);
    departments.push({name, manager, employees:Number(employees), status});
    setStorage(STORAGE_KEYS.departments, departments);
    renderDepartments();
  });

  document.querySelector('.dept-table tbody').addEventListener('click', e=>{
    const td = e.target.closest('td');
    if(!td || td.cellIndex !== 3) return;
    const tr = td.parentElement;
    const index = Number(tr.dataset.index);
    const departments = getStorage(STORAGE_KEYS.departments);
    departments[index].status = departments[index].status==='active'?'growing':'active';
    setStorage(STORAGE_KEYS.departments, departments);
    renderDepartments();
  });

  function initDemoDepartments(){
    const demo = [
      {name:'IT', manager:'Ahmed Benali', employees:35, status:'active'},
      {name:'HR', manager:'Imane Zahra', employees:15, status:'active'},
      {name:'Marketing', manager:'Sarah El Idrissi', employees:20, status:'growing'}
    ];
    setStorage(STORAGE_KEYS.departments, demo);
    renderDepartments();
  }

  initDemoDepartments();

  // ----- INTERVIEWS -----
  const ctxInterview = document.getElementById('interviewChart').getContext('2d');
  let interviewChart = new Chart(ctxInterview, {
    type: 'doughnut',
    data: { labels:['Completed','Pending'], datasets:[{data:[0,0], backgroundColor:['#16a34a','#dc2626'], borderWidth:1}] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{size:11}, boxWidth:12 } } } }
  });

  function renderInterviews(){
    const stored = getStorage(STORAGE_KEYS.interviews);
    const tbody = document.getElementById('interviewTableBody');
    tbody.innerHTML = '';
    stored.forEach((item,i)=>{
      const tr = document.createElement('tr');
      tr.dataset.index = i;
      tr.innerHTML = `<td>${escapeHtml(item.firstName)}</td><td>${escapeHtml(item.lastName)}</td><td>${escapeHtml(item.department)}</td>
      <td class="${item.status}">${item.status==='completed'?'<i class="fa-solid fa-check"></i> Completed':'<i class="fa-solid fa-clock"></i> Pending'}</td>`;
      tbody.appendChild(tr);
    });
    updateInterviewChart();
  }

  function updateInterviewChart(){
    const stored = getStorage(STORAGE_KEYS.interviews);
    const completed = stored.filter(s=>s.status==='completed').length;
    const pending = stored.length-completed;
    interviewChart.data.datasets[0].data = [completed,pending];
    interviewChart.update();
  }

  document.getElementById('interviewTableBody').addEventListener('click', e=>{
    const td = e.target.closest('td');
    if(!td || !td.classList.contains('pending')) return;
    const tr = td.parentElement;
    const index = Number(tr.dataset.index);
    const interviews = getStorage(STORAGE_KEYS.interviews);
    interviews[index].status = 'completed';
    setStorage(STORAGE_KEYS.interviews, interviews);
    renderInterviews();
  });

  // ----- TASKS -----
  const ctxTask = document.getElementById('taskChart').getContext('2d');
  let taskChart = new Chart(ctxTask, {
    type:'doughnut',
    data:{ labels:['Completed','Pending'], datasets:[{data:[0,0], backgroundColor:['#3b82f6','#facc15'], borderWidth:1}] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{size:11}, boxWidth:12 } } } }
  });

  function renderTasks(){
    const stored = getStorage(STORAGE_KEYS.tasks);
    const tbody = document.getElementById('tasksTableBody');
    tbody.innerHTML='';
    stored.forEach((item,i)=>{
      const tr = document.createElement('tr');
      tr.dataset.index=i;
      tr.innerHTML = `<td>${escapeHtml(item.task)}</td><td>${escapeHtml(item.assignedTo)}</td><td>${escapeHtml(item.dueDate)}</td>
      <td class="${item.status}">${item.status==='completed'?'<i class="fa-solid fa-check"></i> Completed':'<i class="fa-solid fa-clock"></i> Pending'}</td>`;
      tbody.appendChild(tr);
    });
    updateTaskChart();
  }

  function updateTaskChart(){
    const stored = getStorage(STORAGE_KEYS.tasks);
    const completed = stored.filter(s=>s.status==='completed').length;
    const pending = stored.length-completed;
    taskChart.data.datasets[0].data = [completed,pending];
    taskChart.update();
  }

  document.getElementById('tasksTableBody').addEventListener('click', e=>{
    const td = e.target.closest('td');
    if(!td || !td.classList.contains('pending')) return;
    const tr = td.parentElement;
    const index = Number(tr.dataset.index);
    const tasks = getStorage(STORAGE_KEYS.tasks);
    tasks[index].status='completed';
    setStorage(STORAGE_KEYS.tasks, tasks);
    renderTasks();
  });

  // ----- UTIL -----
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // ----- DEMO DATA -----
  function initDemoInterviewsTasks(){
    const departments = ['HR','IT','Marketing'];
    const interviewsDemo = [
      {firstName:'John', lastName:'Doe', department:'IT', status:'pending'},
      {firstName:'Jane', lastName:'Smith', department:'HR', status:'completed'},
      {firstName:'Alice', lastName:'Brown', department:'Marketing', status:'pending'}
    ];
    const tasksDemo = [
      {task:'Update Records', assignedTo:'John Doe', dueDate:'2025-12-20', status:'pending'},
      {task:'Prepare Report', assignedTo:'Jane Smith', dueDate:'2025-12-22', status:'completed'}
    ];
    setStorage(STORAGE_KEYS.interviews, interviewsDemo);
    setStorage(STORAGE_KEYS.tasks, tasksDemo);
    renderInterviews();
    renderTasks();
  }

  initDemoInterviewsTasks();

});
