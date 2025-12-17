document.addEventListener('DOMContentLoaded', () => {
  const sidebarLinks = document.querySelectorAll('.sidebar a');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      sidebarLinks.forEach(l => l.classList.remove('active'));

      this.classList.add('active');
    });
  });
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}