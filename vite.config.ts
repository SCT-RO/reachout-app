import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const COURSE_NAME_KEY = '﻿Course Name';

function mapAirtableRecord(record, index) {
  const f = record.fields;
  return {
    id: record.id,
    title: (f[COURSE_NAME_KEY] || f['Course Name'] || 'Untitled').trim(),
    category: f['Category'] || 'General',
    instructor: f['Instructor'] || 'ReachOut Expert',
    instructorImg: f['InstructorImg'] || `https://i.pravatar.cc/150?u=${record.id}`,
    image: f['Course Thumbnail'] || `https://picsum.photos/seed/${index + 1}/400/200`,
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

async function fetchFromAirtable(apiKey, baseId, tableId) {
  const records = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    url.searchParams.set('sort[0][field]', 'Featured');
    url.searchParams.set('sort[0][direction]', 'desc');
    if (offset) url.searchParams.set('offset', offset);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) throw new Error(`Airtable ${response.status}`);
    const data = await response.json();
    records.push(...data.records);
    offset = data.offset ?? null;
  } while (offset);

  return records.map(mapAirtableRecord);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'airtable-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/courses', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(200);
              res.end();
              return;
            }

            try {
              const courses = await fetchFromAirtable(
                env.AIRTABLE_API_KEY,
                env.AIRTABLE_BASE_ID,
                env.AIRTABLE_TABLE_ID,
              );
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ courses }));
            } catch (err) {
              console.error('[Airtable dev]', err.message);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        },
      },
    ],
  };
});
