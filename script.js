// Configuración de Supabase
const SUPABASE_URL = 'https://zwnggsdnlmicebvkqtra.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bmdnc2RubG1pY2VidmtxdHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTA3NjgsImV4cCI6MjA3MjcyNjc2OH0.Hx6hCP073-NlQ5kXYsKGziIdEJEgrhepN32Sn2_rlTo';
const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Inicializar mapa
const map = L.map('map').setView([19.4326, -99.1332], 13); // CDMX

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Función para cargar notas desde Supabase
async function cargarNotas() {
  const { data, error } = await supabase.from('notas').select('*');
  if (error) {
    console.error('Error al cargar notas:', error);
    return;
  }

  data.forEach(nota => {
    if(nota.lat && nota.lng) {
      L.marker([nota.lat, nota.lng])
        .addTo(map)
        .bindPopup(`<b>${nota.titulo}</b><br>${nota.descripcion}`);
    }
  });
}

// Llamamos a la función
cargarNotas();
