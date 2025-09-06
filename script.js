// Inicializar Supabase
const supabaseUrl = 'https://zwnggsdnlmicebvkqtra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bmdnc2RubG1pY2VidmtxdHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTA3NjgsImV4cCI6MjA3MjcyNjc2OH0.Hx6hCP073-NlQ5kXYsKGziIdEJEgrhepN32Sn2_rlTo';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Inicializar mapa
const map = L.map('map').setView([19.4326, -99.1332], 5); // México
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Elementos HTML
const noteInput = document.getElementById('note-input');
const notesList = document.getElementById('notes-list');

// Marcadores en el mapa
window.noteMarkers = [];

// Función para mostrar notas
async function renderNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  notesList.innerHTML = '';

  // Limpiar marcadores antiguos
  window.noteMarkers.forEach(m => map.removeLayer(m));
  window.noteMarkers = [];

  data.forEach(note => {
    const li = document.createElement('li');
    li.textContent = note.text;
    notesList.appendChild(li);

    if (note.lat && note.lng) {
      const marker = L.marker([note.lat, note.lng])
        .addTo(map)
        .bindPopup(note.text);
      window.noteMarkers.push(marker);
    }
  });
}

// Función para agregar nota
async function addNote() {
  const text = noteInput.value.trim();
  if (!text) return;

  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    const { data, error } = await supabase
      .from('notes')
      .insert([{ text, lat, lng }])
      .select();

    if (error) {
      console.error(error);
      return;
    }

    noteInput.value = '';
    renderNotes();
  });
}

// Cargar notas al inicio
renderNotes();
