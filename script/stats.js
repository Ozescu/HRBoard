document.addEventListener('DOMContentLoaded', ()=>{
  const STORAGE_KEYS = {
    employees: 'hrboard_employees',
    departments: 'hrboard_departments',
    interviews: 'hrboard_interviews',
    tasks: 'hrboard_tasks',
    meetings: 'hrboard_meetings'
  };

  function getStorage(key){ try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }

  // summary
  function renderSummary(){
    const employees = getStorage(STORAGE_KEYS.employees) || [];
    const departments = getStorage(STORAGE_KEYS.departments) || [];
    const interviews = getStorage(STORAGE_KEYS.interviews) || [];
    const tasks = getStorage(STORAGE_KEYS.tasks) || [];
    document.getElementById('statTotalEmployees').textContent = employees.length;
    document.getElementById('statTotalDepartments').textContent = departments.length;
    document.getElementById('statOpenInterviews').textContent = interviews.filter(i=>i.status==='pending').length;
    document.getElementById('statPendingTasks').textContent = tasks.filter(t=>t.status==='pending').length;
  }

  // headcount trend (simple heuristic)
  let headcountChart = null;
  function renderHeadcount(){
    const employees = getStorage(STORAGE_KEYS.employees) || [];
    const total = employees.length;
    const months = Number(document.getElementById('statsPeriod').value || 6);
    const labels = [];
    const data = [];
    for(let i=months-1;i>=0;i--){ labels.push(`${i+1}m`); const v = Math.max(0, Math.round(total - (i*(total/months)))); data.push(v); }
    labels.reverse(); data.reverse();
    if (!headcountChart){
      const ctx = document.getElementById('headcountTrend').getContext('2d');
      headcountChart = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Headcount', data, borderColor:'#4f46e5', backgroundColor:'rgba(79,70,229,0.08)', fill:true, tension:0.3 }] }, options:{ responsive:true, maintainAspectRatio:false } });
    } else { headcountChart.data.labels = labels; headcountChart.data.datasets[0].data = data; headcountChart.update(); }
  }

  // hiring funnel (interviews pending vs completed)
  let funnelChart = null;
  function renderFunnel(){
    const interviews = getStorage(STORAGE_KEYS.interviews) || [];
    const completed = interviews.filter(i=>i.status==='completed').length;
    const pending = interviews.length - completed;
    const labels = ['Completed','Pending'];
    const data = [completed,pending];
    if (!funnelChart){ const ctx = document.getElementById('hiringFunnel').getContext('2d'); funnelChart = new Chart(ctx,{ type:'doughnut', data:{ labels, datasets:[{ data, backgroundColor:['#16a34a','#f59e0b'] }] }, options:{ responsive:true, maintainAspectRatio:false } }); }
    else { funnelChart.data.datasets[0].data = data; funnelChart.update(); }
  }

  // department breakdown
  let deptChart = null;
  function renderDeptBreakdown(){
    const deps = getStorage(STORAGE_KEYS.departments) || [];
    const labels = deps.map(d=>d.name || '—');
    const data = deps.map(d=>Number(d.employees||0));
    if (!deptChart){ const ctx = document.getElementById('deptBreakdown').getContext('2d'); deptChart = new Chart(ctx,{ type:'bar', data:{ labels, datasets:[{ label:'Employees', data, backgroundColor:'#10b981' }] }, options:{ responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } } }); }
    else { deptChart.data.labels = labels; deptChart.data.datasets[0].data = data; deptChart.update(); }

    // render table
    const tbody = document.querySelector('#statsDeptTable tbody'); tbody.innerHTML = '';
    deps.forEach(d=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${d.name}</td><td>${d.manager}</td><td>${d.employees}</td><td>${d.status}</td>`; tbody.appendChild(tr); });
  }

  function renderAll(){ renderSummary(); renderHeadcount(); renderFunnel(); renderDeptBreakdown(); }

  document.getElementById('statsPeriod').addEventListener('change', renderHeadcount);

  // refresh on modalSubmit
  window.addEventListener('modalSubmit', ()=>{ setTimeout(renderAll,150); });

  // initial
  renderAll();
});
