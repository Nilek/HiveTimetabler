async function loadActs() {
  const [actsRes, colorsRes] = await Promise.all([
    fetch('acts.json'),
    fetch('stage-colors.json')
  ]);
  const acts = await actsRes.json();
  const colorData = await colorsRes.json();
  const colorMap = Object.fromEntries(colorData.map(c => [c.stage, c.color_rgb]));
  renderGroupedActs(acts, colorMap);
}

function renderGroupedActs(acts, colorMap) {
  const grouped = {};
  acts.forEach(act => {
    if (!grouped[act.stage]) grouped[act.stage] = [];
    grouped[act.stage].push(act);
  });

  Object.values(grouped).forEach(list => {
    list.sort((a, b) => new Date(a.start) - new Date(b.start));
  });

  const wrapper = document.getElementById('stage-wrapper');

  Object.keys(grouped).forEach(stage => {
    const column = document.createElement('div');
    column.className = 'stage-column';

    const rgb = colorMap[stage] || [60, 60, 60];
    column.style.backgroundColor = `rgb(${rgb.join(',')})`;

    const heading = document.createElement('h2');
    heading.textContent = stage;
    heading.style.color = 'white';
    column.appendChild(heading);

    grouped[stage].forEach(act => {
      const item = document.createElement('div');
      item.className = 'act-item';

      const label = document.createElement('label');
      label.innerHTML = `
        <input type="checkbox" data-artist="${act.artist}" data-start="${act.start}" data-end="${act.end}" data-stage="${act.stage}">
        <strong>${act.artist}</strong><br/>
        <small>${new Date(act.start).toLocaleString()} – ${new Date(act.end).toLocaleTimeString()}</small>
      `;

      item.appendChild(label);
      column.appendChild(item);
    });

    wrapper.appendChild(column);
  });

  document.getElementById('download-btn').addEventListener('click', () => downloadICS());
}

function downloadICS() {
  const checkboxes = document.querySelectorAll('input[type=checkbox]');
  const cal = script();

  checkboxes.forEach(cb => {
    if (cb.checked) {
      const start = new Date(cb.dataset.start);
      const end = new Date(cb.dataset.end);
      cal.addEvent(
        cb.dataset.artist,
        cb.dataset.stage,
        'Ferropolis',
        [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          start.getHours(),
          start.getMinutes()
        ],
        [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate(),
          end.getHours(),
          end.getMinutes()
        ]
      );
    }
  });

  cal.download('hive-festival-2025');

  // Zeige Hinweis oder Link nach dem Download
  const notice = document.createElement('p');
  notice.innerHTML = `
    <strong>✅ Datei wurde erstellt!</strong><br/>
    Falls sich dein Kalender nicht automatisch öffnet, kannst du sie manuell öffnen:<br/>
    <a href="hive-festival-2025.ics" download style="color:#ffcc00;">hive-festival-2025.ics manuell öffnen</a>
  `;
  notice.style.textAlign = "center";
  notice.style.marginTop = "1rem";
  document.querySelector("main").appendChild(notice);
}

loadActs();
