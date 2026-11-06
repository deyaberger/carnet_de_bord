const STORAGE_KEY = 'carnet-de-bord-v1';
const today = new Date();
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let entries = {};
let storageAvailable = true;
const $ = (id) => document.getElementById(id);

function warnStorage(message) {
  $('storage-warning').textContent = message;
  $('storage-warning').hidden = false;
  $('save-status').textContent = 'Non enregistré';
}

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) ||
        Object.entries(parsed).some(([key, value]) => !/^\d{4}-\d{2}-\d{2}$/.test(key) ||
          !value || typeof value !== 'object' || Array.isArray(value))) {
      throw new Error('Invalid journal data');
    }
    entries = parsed;
  }
} catch {
  storageAvailable = false;
  warnStorage('La sauvegarde locale est inaccessible ou illisible. Vos modifications ne seront pas enregistrées. Les données existantes ne seront pas écrasées.');
}

const categories = [
  { id: 'food', icon: '☕', title: 'À table', subtitle: 'Repas, boissons & petits plaisirs', fields: [
    { id: 'foodQuick', label: 'Mes habitudes', options: ['Café', 'Eau chaude'] },
    { id: 'foodNotes', label: 'Ce que j’ai mangé et bu', type: 'textarea', placeholder: 'Petit-déjeuner, déjeuner, dîner, en-cas…' },
  ] },
  { id: 'mood', icon: '☀', title: 'Mon humeur', subtitle: 'Toutes les émotions ont leur place', fields: [
    { id: 'moods', label: 'Aujourd’hui, je me suis sentie…', options: ['De bonne humeur', 'Stressée', 'Confiante', 'Énervée', 'Sereine', 'Triste', 'Fatiguée'] },
    { id: 'laughed', label: 'Est-ce que j’ai rigolé ?', options: ['Oui', 'Non'], single: true },
    { id: 'moodNotes', label: 'Un mot sur mon humeur', type: 'textarea', placeholder: 'Ce qui m’a fait sourire, ce qui m’a préoccupée…' },
  ] },
  { id: 'medication', icon: '✚', title: 'Médicaments & compléments', subtitle: 'Mes prises de la journée', fields: [
    { id: 'medications', label: 'Mes habitudes', options: ['Probiotiques flore vaginale', 'Probiotiques système immunitaire', 'Vitamine C'] },
    { id: 'medicationNotes', label: 'Autres prises et détails', type: 'textarea', placeholder: 'Nom, dose, heure de prise…' },
  ] },
  { id: 'skin', icon: '❋', title: 'Mes soins', subtitle: 'Crèmes & routine de peau', fields: [
    { id: 'creams', label: 'Les soins appliqués', options: ['Adapalène', 'Rosex', 'Erythrogel', 'Cutacnyl', 'Hydratante', 'Crème solaire'] },
    { id: 'skinNotes', label: 'Détails de ma routine', type: 'textarea', placeholder: 'Matin, soir, réactions de ma peau…' },
  ] },
  { id: 'activities', icon: '↗', title: 'Mes activités', subtitle: 'Les moments qui remplissent ma journée', fields: [
    { id: 'activities', label: 'Au programme', options: ['Travail', 'Sport', 'Culture', 'Amis'], details: true },
    { id: 'activityNotes', label: 'Autres activités', type: 'textarea', placeholder: 'Une balade, un projet, un moment pour moi…' },
  ] },
  { id: 'sleep', icon: '☾', title: 'Mon sommeil', subtitle: 'Une pause pour recharger les batteries', fields: [
    { id: 'sleepHours', label: 'Nombre d’heures de sommeil', type: 'number', min: 0, max: 24, step: 0.5, placeholder: 'Ex. : 7,5' },
  ] },
  { id: 'cycle', icon: '◌', title: 'Mon cycle', subtitle: 'Règles & pertes blanches', fields: [
    { id: 'period', label: 'Règles · intensité des pertes', options: ['Aucune', 'Légères', 'Modérées', 'Abondantes'], single: true },
    { id: 'discharge', label: 'Pertes blanches · aspect', options: ['Aucune', 'Visqueuses', 'Blanc d’œuf', 'Crémeuses', 'Liquides'], exclusive: 'Aucune' },
    { id: 'cycleNotes', label: 'Autres observations', type: 'textarea', placeholder: 'Douleurs, sensations, changements…' },
  ] },
  { id: 'intimacy', icon: '♡', title: 'Mon intimité', subtitle: 'À l’écoute de mes envies', fields: [
    { id: 'sex', label: 'Rapport sexuel', options: ['Oui', 'Non'], single: true },
    { id: 'libido', label: 'Libido', options: ['Élevée', 'Faible'], single: true },
    { id: 'intimacyNotes', label: 'Mes ressentis', type: 'textarea', placeholder: 'Si j’ai envie d’en dire plus…' },
  ] },
  { id: 'alcohol', icon: '♧', title: 'Alcool', subtitle: 'Quoi & combien', fields: [
    { id: 'alcohol', label: 'J’ai bu de l’alcool', options: ['Oui', 'Non'], single: true },
    { id: 'alcoholNotes', label: 'Boissons et quantités', type: 'textarea', placeholder: 'Ex. : 1 verre de vin au dîner…' },
  ] },
  { id: 'digestion', icon: '≈', title: 'Ma digestion', subtitle: 'Selles & gaz', fields: [
    { id: 'stools', label: 'Selles', options: ['Normales', 'Constipée', 'Diarrhée'] },
    { id: 'stoolCount', label: 'Nombre de selles', type: 'number', min: 0, step: 1, placeholder: 'Ex. : 1' },
    { id: 'gas', label: 'Prouts', options: ['Beaucoup', 'Pas beaucoup'], single: true },
    { id: 'digestionNotes', label: 'Autres observations', type: 'textarea', placeholder: 'Ballonnements, inconfort…' },
  ] },
];

function currentEntry() {
  return entries[dateKey(selectedDate)] || {};
}

function hasContent(entry) {
  return Object.values(entry).some((value) => Array.isArray(value) ? value.length > 0 : typeof value === 'string' && value.trim() !== '');
}

function saveField(id, value) {
  const key = dateKey(selectedDate);
  const entry = { ...currentEntry(), [id]: value };
  if (hasContent(entry)) entries[key] = entry;
  else delete entries[key];
  if (storageAvailable) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      $('storage-warning').hidden = true;
      $('save-status').textContent = '✓ Enregistré sur cet appareil';
    } catch {
      warnStorage('Impossible d’enregistrer sur cet appareil (stockage plein ou bloqué). Gardez cette page ouverte et réessayez après avoir libéré de l’espace.');
    }
  }
  renderCalendar();
}

function renderCalendar() {
  $('month-title').textContent = new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' }).format(displayedMonth);
  $('days').replaceChildren();
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const offset = (displayedMonth.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  for (let index = 0; index < offset; index++) {
    const empty = document.createElement('span');
    empty.setAttribute('aria-hidden', 'true');
    $('days').append(empty);
  }
  for (let day = 1; day <= count; day++) {
    const date = new Date(year, month, day);
    const key = dateKey(date);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = day;
    const saved = hasContent(entries[key] || {});
    const isToday = key === dateKey(today);
    button.classList.toggle('selected', key === dateKey(selectedDate));
    button.classList.toggle('is-today', isToday);
    button.classList.toggle('has-entry', saved);
    button.setAttribute('aria-pressed', String(key === dateKey(selectedDate)));
    button.setAttribute('aria-label', `${new Intl.DateTimeFormat('fr', { dateStyle: 'full' }).format(date)}${saved ? ', journée renseignée' : ''}`);
    if (isToday) button.setAttribute('aria-current', 'date');
    button.addEventListener('click', () => {
      selectedDate = date;
      renderCalendar();
      renderJournal();
    });
    $('days').append(button);
  }
}

function createField(field) {
  const container = document.createElement('div');
  container.className = 'field';
  const label = document.createElement(field.options ? 'div' : 'label');
  label.className = 'field-label';
  label.textContent = field.label;
  label.id = `${field.id}-label`;
  container.append(label);
  const value = currentEntry()[field.id];
  if (field.options) {
    const group = document.createElement('div');
    group.className = 'chips';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-labelledby', label.id);
    const chosen = field.single ? (typeof value === 'string' ? [value] : []) : (Array.isArray(value) ? value : []);
    for (const option of field.options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.textContent = option;
      button.setAttribute('aria-pressed', String(chosen.includes(option)));
      button.addEventListener('click', () => {
        const old = currentEntry()[field.id];
        let next;
        if (field.single) next = old === option ? '' : option;
        else {
          const list = Array.isArray(old) ? old : [];
          next = list.includes(option) ? list.filter((item) => item !== option) : [...list, option];
          if (field.exclusive && !list.includes(option)) {
            next = option === field.exclusive ? [option] : next.filter((item) => item !== field.exclusive);
          }
        }
        saveField(field.id, next);
        for (const chip of group.children) {
          chip.setAttribute('aria-pressed', String(field.single ? next === chip.textContent : next.includes(chip.textContent)));
        }
        if (field.details) {
          for (const detail of container.querySelectorAll('[data-option]')) {
            detail.hidden = !next.includes(detail.dataset.option);
          }
        }
      });
      group.append(button);
    }
    container.append(group);
    if (field.details) {
      for (const option of field.options) {
        const detail = createField({ id: `activity-${option}`, label: `Détails · ${option}`, type: 'textarea', placeholder: `Quelques détails sur : ${option.toLowerCase()}…` });
        detail.dataset.option = option;
        detail.hidden = !chosen.includes(option);
        container.append(detail);
      }
    }
  } else {
    const input = document.createElement(field.type === 'textarea' ? 'textarea' : 'input');
    input.id = field.id;
    input.name = field.id;
    label.htmlFor = field.id;
    input.placeholder = field.placeholder;
    input.value = typeof value === 'string' ? value : '';
    if (field.type === 'textarea') input.rows = 2;
    else {
      input.type = field.type;
      input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      input.step = field.step;
    }
    input.addEventListener('input', () => {
      if (!input.validity.valid) {
        $('save-status').textContent = 'Valeur invalide : non enregistrée';
        return;
      }
      saveField(field.id, input.value);
    });
    container.append(input);
  }
  return container;
}

function renderJournal() {
  $('day-title').textContent = new Intl.DateTimeFormat('fr', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(selectedDate);
  $('day-relative').textContent = dateKey(selectedDate) === dateKey(today) ? 'AUJOURD’HUI' : 'MA JOURNÉE';
  $('save-status').textContent = storageAvailable
    ? (hasContent(currentEntry()) ? '✓ Notes de cette journée' : 'Sauvegarde automatique')
    : 'Non enregistré';
  $('journal-form').replaceChildren();
  for (const category of categories) {
    const section = document.createElement('details');
    section.className = `category category-${category.id}`;
    section.open = ['food', 'mood'].includes(category.id);
    const summary = document.createElement('summary');
    const icon = document.createElement('span');
    icon.className = 'category-icon';
    icon.textContent = category.icon;
    icon.setAttribute('aria-hidden', 'true');
    const heading = document.createElement('span');
    const title = document.createElement('span');
    title.className = 'category-title';
    title.textContent = category.title;
    const subtitle = document.createElement('span');
    subtitle.className = 'category-subtitle';
    subtitle.textContent = category.subtitle;
    heading.append(title, subtitle);
    summary.append(icon, heading);
    const body = document.createElement('div');
    body.className = 'category-body';
    for (const field of category.fields) body.append(createField(field));
    section.append(summary, body);
    $('journal-form').append(section);
  }
}

$('journal-form').addEventListener('submit', (event) => event.preventDefault());
for (const [id, increment] of [['previous-month', -1], ['next-month', 1]]) {
  $(id).addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + increment, 1);
    renderCalendar();
  });
}
$('today').addEventListener('click', () => {
  selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  renderCalendar();
  renderJournal();
});
$('delete-day').addEventListener('click', () => {
  if (!hasContent(currentEntry()) || !confirm('Effacer toutes les notes de cette journée ? Cette action est irréversible.')) return;
  delete entries[dateKey(selectedDate)];
  saveField('foodNotes', '');
  renderJournal();
});

renderCalendar();
renderJournal();

let installPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  $('install').hidden = false;
});
$('install').addEventListener('click', async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  installPrompt = null;
  $('install').hidden = true;
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  $('install').hidden = true;
});
function updateConnection() {
  $('offline-status').textContent = navigator.onLine ? '' : 'Hors ligne · vous pouvez continuer à écrire.';
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    $('offline-status').textContent = 'Le mode hors ligne est indisponible. La sauvegarde locale reste indépendante.';
  });
}
