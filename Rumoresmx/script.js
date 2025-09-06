// ----------------------------
// 1️⃣ Conectar con Supabase
// ----------------------------
const supabaseUrl = 'https://xltlkdkgzegkrvfltqzg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdGxrZGtnemVna3J2Zmx0cXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTA5ODEsImV4cCI6MjA3MjcyNjk4MX0.faQaRRGQBj_9tZaxRKElLtIp6eWLWv29BRpN2Xk1MiU';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ----------------------------
// 2️⃣ Inicializar Leaflet
// ----------------------------
const map = L.map('map').setView([19.4326, -99.1332], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ----------------------------
// 3️⃣ Cargar notas desde Supabase
// ----------------------------
async function loadNotes() {
  const { data: notes, error } = await supabase.from('notes').select('*');
  if (error) { console.error(error); return; }

  notes.forEach(note => addNote(note));
}

// ----------------------------
// 4️⃣ Agregar nota en mapa con popup de comentarios
// ----------------------------
function addNote(note) {
  const myIcon = L.divIcon({
    className: 'note-label-divicon',
    html: `<div class="note-label">🏠 ${note.text}</div>`,
    iconSize: null,
    iconAnchor: [0, 0]
  });

  const marker = L.marker([note.lat, note.lng], { icon: myIcon }).addTo(map);

  marker.bindPopup(`
    <div class="comment-popup">
      <p>${note.text}</p>
      <textarea class="comment-text" placeholder="Escribe un comentario"></textarea>
      <button class="save-comment">Guardar comentario</button>
      <div class="comment-list"></div>
    </div>
  `);

  async function loadComments() {
    const { data: comments } = await supabase.from('comments')
      .select('*')
      .eq('note_id', note.id)
      .order('created_at', { ascending: true });
    const popupEl = marker.getPopup().getElement();
    if (!popupEl) return;
    const commentList = popupEl.querySelector('.comment-list');
    commentList.innerHTML = '';
    comments.forEach(c => {
      const p = document.createElement('p');
      p.textContent = c.text;
      commentList.appendChild(p);
    });
  }

  marker.on("popupopen", function() {
    loadComments();
    const popupEl = marker.getPopup().getElement();
    const saveBtn = popupEl.querySelector(".save-comment");
    const textarea = popupEl.querySelector(".comment-text");

    saveBtn.onclick = async function() {
      const text = textarea.value.trim();
      if (!text) return alert("Escribe un comentario!");
      await supabase.from('comments').insert([{ note_id: note.id, text }]);
      textarea.value = '';
      loadComments();
    };
  });

  map.on('zoomend', () => {
    if (map.getZoom() >= 10) {
      marker.addTo(map);
    } else {
      map.removeLayer(marker);
    }
  });

  if (map.getZoom() >= 10) {
    marker.addTo(map);
  } else {
    map.removeLayer(marker);
  }
}

// ----------------------------
// 5️⃣ Agregar nueva nota
// ----------------------------
let currentMarker = null;
map.on('click', function(e) {
  currentMarker = e.latlng;
  document.getElementById('note-popup').classList.remove('hidden');
});

document.getElementById('save-note').onclick = async function() {
  const text = document.getElementById('note-text').value.trim();
  if (!text) return alert('Escribe algo!');
  
  const { data, error } = await supabase.from('notes').insert([
    { lat: currentMarker.lat, lng: currentMarker.lng, text }
  ]).select();

  if (error) { console.error(error); return; }
  addNote(data[0]);
  document.getElementById('note-text').value = '';
  document.getElementById('note-popup').classList.add('hidden');
};

document.getElementById('cancel-note').onclick = function() {
  document.getElementById('note-popup').classList.add('hidden');
};

// ----------------------------
// 6️⃣ Cargar todas las notas al inicio
// ----------------------------
loadNotes();
