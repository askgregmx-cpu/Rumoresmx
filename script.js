// Conexión con Supabase
const SUPABASE_URL = "https://zwnggsdnlmicebvkqtra.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bmdnc2RubG1pY2VidmtxdHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTA3NjgsImV4cCI6MjA3MjcyNjc2OH0.Hx6hCP073-NlQ5kXYsKGziIdEJEgrhepN32Sn2_rlTo";

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referencias HTML
const noteInput = document.getElementById('note-text');
const addBtn = document.getElementById('btn-add');
const notesList = document.getElementById('notes-list');

// Función para agregar nota
async function addNote() {
  const text = noteInput.value.trim();
  if (!text) return;

  const { data, error } = await supabase
    .from('notes')
    .insert([{ text }])
    .select();

  if (error) {
    console.error(error);
    return;
  }

  noteInput.value = '';
  renderNotes();
}

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
  data.forEach(note => {
    const li = document.createElement('li');
    li.textContent = note.text;
    notesList.appendChild(li);
  });
}

// Eventos
addBtn.addEventListener('click', addNote);

// Inicial
renderNotes();
