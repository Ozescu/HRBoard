document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('.sidebar a');

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

  // keep sidebar link in sync
  document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
  const link = document.querySelector(`.sidebar a[onclick="showSection('${id}')"]`);
  if (link) link.classList.add('active');
}