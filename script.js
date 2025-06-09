function parseInlineJSON(id) {
  const scriptTag = document.getElementById(id);
  return JSON.parse(scriptTag.textContent);
}

const acts = parseInlineJSON("acts-data");

function groupActsByStage(acts) {
  const grouped = {};
  acts.forEach((act, i) => {
    if (!grouped[act.stage]) grouped[act.stage] = [];
    grouped[act.stage].push({ ...act, index: i });
  });
  for (const stage in grouped) {
    grouped[stage].sort((a, b) => new Date(a.start) - new Date(b.start));
  }
  return grouped;
}

function renderGroupedActs(groupedActs) {
  const container = document.getElementById('stages-container');
  Object.keys(groupedActs).forEach(stage => {
    const col = document.createElement('div');
    col.className = 'stage-column';

    const title = document.createElement('h2');
    title.textContent = stage;
    col.appendChild(title);

    groupedActs[stage].forEach(act => {
      const div = document.createElement('div');
      div.className = 'act-item';
      const startTime = new Date(act.start).toLocaleString();
      div.innerHTML = `
        <label>
          <input type="checkbox" data-index="${act.index}">
          <strong>${act.artist}</strong><br/>
          <small>${startTime}</small>
        </label>
      `;
      col.appendChild(div);
    });

    container.appendChild(col);
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

const grouped = groupActsByStage(acts);
renderGroupedActs(grouped);
