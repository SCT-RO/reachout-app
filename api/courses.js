const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

// Airtable exports tables with a BOM-prefixed first column name
const COURSE_NAME_KEY = '﻿Course Name';

function mapRecord(record, index) {
  const f = record.fields;
  const name = (f[COURSE_NAME_KEY] || f['Course Name'] || 'Untitled').trim();
  return {
    id: record.id,
    title: name,
    category: f['Category'] || 'General',
    instructor: f['Instructor'] || 'ReachOut Expert',
    instructorImg: f['InstructorImg'] || `https://i.pravatar.cc/150?u=${record.id}`,
    image: (Array.isArray(f['Course Thumbnail']) ? f['Course Thumbnail'][0]?.url : f['Course Thumbnail']) || `https://picsum.photos/seed/${index + 1}/400/200`,
    price: f['Price'] ?? 0,
    originalPrice: f['OriginalPrice'] ?? null,
    ccavenuePrice: f['CC Avenue Price'] ?? null,
    inAppPrice: f['In-App Purchase Price'] ?? null,
    rating: f['Rating'] ?? 4.5,
    enrolled: f['Enrolled'] ?? 0,
    duration: f['Duration'] || '—',
    lessons: f['Lessons'] ?? 0,
    description: f['Description'] || '',
    featured: f['Featured'] || false,
    curriculum: [],
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!AIRTABLE_API_KEY || !BASE_ID || !TABLE_ID) {
    return res.status(500).json({ error: 'Airtable env vars not configured' });
  }

  try {
    const records = [];
    let offset = null;

    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
      url.searchParams.set('sort[0][field]', 'Featured');
      url.searchParams.set('sort[0][direction]', 'desc');
      if (offset) url.searchParams.set('offset', offset);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Airtable ${response.status}: ${body}`);
      }

      const data = await response.json();
      records.push(...data.records);
      offset = data.offset ?? null;
    } while (offset);

    const courses = records.map(mapRecord);
    res.status(200).json({ courses });
  } catch (err) {
    console.error('Airtable API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
