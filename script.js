async function loadActs() {
  const res = await fetch('acts.json');
  const data = await res.json();
  renderActs(data);
}
function renderActs(acts) {
  const list = document.getElementById('act-list');
  acts.forEach((act, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'act-item';
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" data-index="${i}"> 
      <strong>${act.artist}</strong> <br/>
      <small>${new Date(act.start).toLocaleString()} – ${act.stage}</small>
    `;
    wrapper.appendChild(label);
    list.appendChild(wrapper);
  });
  document.getElementById('download-btn').addEventListener('click', () => downloadICS(acts));
}
function downloadICS(acts) {
  const checkboxes = document.querySelectorAll('input[type=checkbox]');
  const cal = ics();
  checkboxes.forEach((cb, i) => {
    if (cb.checked) {
      const act = acts[i];
      const start = new Date(act.start);
      const end = new Date(act.end);
      cal.addEvent(
        act.artist,
        act.stage,
        'Ferropolis',
        [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
        ],
        [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate(),
          end.getHours(),
          end.getMinutes(),
        ]
      );
    }
  });
  cal.download('hive-festival-2025');
}
loadActs();
