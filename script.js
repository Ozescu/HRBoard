/*
  Fichier: script.js
  Rôle: gestion de l'interface globale (sidebar, modal, navigation entre sections) et
  dispatch d'événements `modalSubmit` pour que les modules spécifiques (interviews, tasks,
  employees, departments) puissent réagir. Les commentaires inline ont été supprimés;
  description générale ci-dessus.
*/

document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('.sidebar a');
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');

  try {
    if (localStorage.getItem('hrboard_sidebar_collapsed') === '1') sidebar.classList.add('collapsed');
  } catch (e) {}

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      try { localStorage.setItem('hrboard_sidebar_collapsed', sidebar.classList.contains('collapsed') ? '1' : '0'); } catch(e){}
    });
  }

  const modal = document.getElementById('modal');
  const modalForm = document.getElementById('modalForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalType = document.getElementById('modalType');
  const modalCancel = document.getElementById('modalCancel');

  function openModal(type) {
    modal.querySelectorAll('.form-interview, .form-task, .form-meeting, .form-employee, .form-department').forEach(el => el.style.display = 'none');
    modalTitle.textContent = ({interview:'Add Interview', task:'Add Task', meeting:'Add Meeting', employee:'Add Employee', department:'Add Department'})[type] || 'Add Item';
    modalType.value = type;
    const panel = modal.querySelector('.form-' + type);
    if (panel) {
      panel.style.display = 'grid';
      const firstInput = panel.querySelector('input, select, textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }
    modal.classList.add('open');
    document.querySelector('.content').classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('open');
    document.querySelector('.content').classList.remove('modal-open');
    modalForm.reset();
  }

  document.querySelectorAll('.add-btn').forEach(b => b.addEventListener('click', e => {
    const t = b.dataset.target;
    if (t) openModal(t);
  }));

  document.querySelectorAll('.emp-add-btn').forEach(b => b.addEventListener('click', e => openModal('employee')));
  document.querySelectorAll('.dept-add-btn').forEach(b => b.addEventListener('click', e => openModal('department')));

  if (modalCancel) modalCancel.addEventListener('click', e => { e.preventDefault(); closeModal(); });

  modalForm.addEventListener('submit', function(e){
    e.preventDefault();
    const type = modalType.value;
    const detail = { type, data: {} };
    if (type === 'interview') {
      detail.data = { firstName: document.getElementById('firstName').value, lastName: document.getElementById('lastName').value, department: document.getElementById('department').value, status: document.getElementById('interviewStatus').value };
    } else if (type === 'task') {
      detail.data = { task: document.getElementById('taskName').value, assignedTo: document.getElementById('assignedTo').value, dueDate: document.getElementById('dueDate').value, status: document.getElementById('taskStatus').value };
    } else if (type === 'meeting') {
      detail.data = { meeting: document.getElementById('meetingName').value, date: document.getElementById('meetingDate').value, time: document.getElementById('meetingTime').value, location: document.getElementById('meetingLocation').value };
    } else if (type === 'employee') {
      detail.data = { firstName: document.getElementById('empFirstName').value, lastName: document.getElementById('empLastName').value, department: document.getElementById('empDepartment').value, status: document.getElementById('empStatus').value };
    } else if (type === 'department') {
      detail.data = { name: document.getElementById('deptName').value, manager: document.getElementById('deptManager').value, employees: Number(document.getElementById('deptEmployees').value||0), status: document.getElementById('deptStatus').value };
    }

    window.dispatchEvent(new CustomEvent('modalSubmit', { detail }));
    closeModal();
  });

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      sidebarLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      const onclickAttr = this.getAttribute('onclick') || '';
      const match = onclickAttr.match(/showSection\('([^']+)'\)/);
      if (match) showSection(match[1]);
    });
  });
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active');
  document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
  const link = document.querySelector(`.sidebar a[onclick="showSection('${id}')"]`);
  if (link) link.classList.add('active');
}