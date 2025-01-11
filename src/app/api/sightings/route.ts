import { NextResponse } from 'next/server';
import { fetchSightings } from '@/lib/fetchData';

export async function GET() {
  const data = await fetchSightings();
  return NextResponse.json(data);
}