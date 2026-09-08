import { supabase } from './supabaseClient.js';
import 'dotenv/config';

async function chequearBaseDeDatos() {
  // Usamos la tabla 'requests' que requiere la consigna
  const { data, error } = await supabase
    .from('requests')
    .select('*');

  if (error) {
    console.error('Error al conectar o consultar:', error);
    return;
  }

  console.log('Éxito');
  console.log('Datos en la tabla requests:', data);
}

chequearBaseDeDatos();