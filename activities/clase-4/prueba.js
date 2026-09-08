import { supabase } from './supabaseClient'

async function obtenerUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')

  if (error) {
    console.error('Error al conectar o consultar:', error)
    return
  }

  console.log('Datos obtenidos:', data)
}

obtenerUsuarios()