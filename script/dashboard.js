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

  // Listen for modal submissions for interviews, tasks, meetings
  window.addEventListener('modalSubmit', (e) => {
    const d = e.detail;
    if (!d) return;
    const type = d.type;
    if (type === 'interview'){
      const payload = d.data;
      const interviews = getStorage(STORAGE_KEYS.interviews);
      interviews.push({ firstName: payload.firstName, lastName: payload.lastName, department: payload.department, status: payload.status });
      setStorage(STORAGE_KEYS.interviews, interviews);
      renderInterviews();
    } else if (type === 'task'){
      const payload = d.data;
      const tasks = getStorage(STORAGE_KEYS.tasks);
      tasks.push({ task: payload.task, assignedTo: payload.assignedTo, dueDate: payload.dueDate, status: payload.status });
      setStorage(STORAGE_KEYS.tasks, tasks);
      renderTasks();
    } else if (type === 'meeting'){
      const payload = d.data;
      const meetings = getStorage(STORAGE_KEYS.meetings);
      meetings.push(payload);
      setStorage(STORAGE_KEYS.meetings, meetings);
      // Append to table if present
      const tbody = document.getElementById('meetingsTableBody');
      if (tbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${payload.meeting}</td><td>${payload.date}</td><td>${payload.time}</td><td>${payload.location}</td>`;
        tbody.appendChild(tr);
      }
    }
  });

  // Departments rendering and demo data handled in script/departemets.js

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

  // ----- ADDITIONAL ANALYTICS CHARTS -----
  // Employee growth (line)
  let employeeGrowthChart = null;
  const empGrowthCanvas = document.getElementById('employeeGrowthChart');
  if (empGrowthCanvas) {
    const ctxEmp = empGrowthCanvas.getContext('2d');
    employeeGrowthChart = new Chart(ctxEmp, { type: 'line', data: { labels: [], datasets: [{ label: 'Employees', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', tension: 0.3 }] }, options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } } });
  }

  // Departments bar chart
  let departmentBarChart = null;
  const deptBarCanvas = document.getElementById('departmentBarChart');
  if (deptBarCanvas) {
    const ctxDeptBar = deptBarCanvas.getContext('2d');
    departmentBarChart = new Chart(ctxDeptBar, { type: 'bar', data: { labels: [], datasets: [{ label: 'Employees', data: [], backgroundColor: '#10b981' }] }, options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } } });
  }

  // KPI radar
  let kpiRadarChart = null;
  const kpiCanvas = document.getElementById('kpiRadarChart');
  if (kpiCanvas) {
    const ctxKpi = kpiCanvas.getContext('2d');
    kpiRadarChart = new Chart(ctxKpi, { type: 'radar', data: { labels: ['Employees','Departments','Interviews','Tasks','Meetings'], datasets: [{ label:'Overview', data: [], backgroundColor: 'rgba(79,70,229,0.12)', borderColor:'#4f46e5' }] }, options: { responsive:true, maintainAspectRatio:false, plugins: { legend:{ display:false } } } });
  }

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

  // ----- ADDITIONAL UPDATE HELPERS -----
  function updateEmployeeGrowth(){
    if (!employeeGrowthChart) return;
    const employees = getStorage(STORAGE_KEYS.employees) || [];
    const total = employees.length;
    // build 6-point trend ending at total
    const points = 6;
    const data = [];
    for (let i=points-1;i>=0;i--){
      const val = Math.max(0, Math.round(total - (i * (total/points)) + (Math.random()*2 -1)));
      data.push(val);
    }
    const labels = Array.from({length:points}, (_,i)=>`${i+1}m`);
    employeeGrowthChart.data.labels = labels;
    employeeGrowthChart.data.datasets[0].data = data;
    employeeGrowthChart.update();
  }

  function updateDepartmentBar(){
    if (!departmentBarChart) return;
    const deps = getStorage(STORAGE_KEYS.departments) || [];
    const labels = deps.map(d=>d.name || '—');
    const data = deps.map(d=>Number(d.employees||0));
    departmentBarChart.data.labels = labels;
    departmentBarChart.data.datasets[0].data = data;
    departmentBarChart.update();
  }

  function updateKpiRadar(){
    if (!kpiRadarChart) return;
    const employees = getStorage(STORAGE_KEYS.employees) || [];
    const departments = getStorage(STORAGE_KEYS.departments) || [];
    const interviews = getStorage(STORAGE_KEYS.interviews) || [];
    const tasks = getStorage(STORAGE_KEYS.tasks) || [];
    const meetings = getStorage(STORAGE_KEYS.meetings) || [];
    kpiRadarChart.data.datasets[0].data = [employees.length, departments.length, interviews.length, tasks.length, meetings.length];
    kpiRadarChart.update();
  }

  function updateAllAnalytics(){ updateEmployeeGrowth(); updateDepartmentBar(); updateKpiRadar(); }

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

  // Initialize demo interviews/tasks only when storage empty
  (function initDemoInterviewsTasksIfEmpty(){
    const interviews = getStorage(STORAGE_KEYS.interviews);
    const tasks = getStorage(STORAGE_KEYS.tasks);
    if ((interviews && interviews.length>0) || (tasks && tasks.length>0)) {
      renderInterviews();
      renderTasks();
      return;
    }
    initDemoInterviewsTasks();
  })();

  // update analytics initially
  updateAllAnalytics();

  // update analytics on modal submits (employee/department/interview/task/meeting)
  window.addEventListener('modalSubmit', (e)=>{ if(!e.detail) return; const t=e.detail.type; if(['employee','department','interview','task','meeting'].includes(t)) setTimeout(updateAllAnalytics,150); });

});
