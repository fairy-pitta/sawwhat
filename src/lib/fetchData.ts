import { supabase } from './supabaseClient';

export async function fetchSightings() {
  const { data, error } = await supabase.from('sightings').select('*');
  if (error) {
    console.error('Error fetching sightings:', error);
    return [];
  }
  return data;
}