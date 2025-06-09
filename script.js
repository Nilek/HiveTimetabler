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
  let content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HiveTimetabler//EN"
  ];

  checkboxes.forEach((cb, index) => {
    if (!cb.checked) return;

    const start = new Date(cb.dataset.start);
    const end = new Date(cb.dataset.end);
    const stage = cb.dataset.stage;
    const artist = cb.dataset.artist;

    const formatDate = (d) => {
      const pad = (n) => (n < 10 ? '0' + n : n);
      return (
        d.getUTCFullYear().toString() +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) + "T" +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        "00Z"
      );
    };

    content.push(
      "BEGIN:VEVENT",
      `UID:${index}@hivefestival2025`,
      `SUMMARY:${artist}`,
      `DESCRIPTION:${stage}`,
      `LOCATION:Ferropolis`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      "END:VEVENT"
    );
  });

  content.push("END:VCALENDAR");

  const blob = new Blob([content.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "hive-festival-2025.ics";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

loadActs();
