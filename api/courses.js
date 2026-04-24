import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.VITE_NOTION_TOKEN });
const DATABASE_ID = process.env.VITE_NOTION_DATABASE_ID;

function prop(page, name, type) {
  const p = page.properties?.[name];
  if (!p) return null;
  switch (type) {
    case 'title': return p.title?.[0]?.plain_text ?? null;
    case 'rich_text': return p.rich_text?.[0]?.plain_text ?? null;
    case 'number': return p.number ?? null;
    case 'select': return p.select?.name ?? null;
    case 'checkbox': return p.checkbox ?? false;
    case 'url': return p.url ?? null;
    case 'files': return p.files?.[0]?.file?.url ?? p.files?.[0]?.external?.url ?? null;
    default: return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ property: 'Featured', direction: 'descending' }],
    });

    const courses = response.results.map((page, index) => ({
      id: index + 1,
      notionId: page.id,
      title: prop(page, 'Title', 'title') || 'Untitled',
      category: prop(page, 'Category', 'select') || 'General',
      instructor: prop(page, 'Instructor', 'rich_text') || 'ReachOut Expert',
      instructorImg: prop(page, 'InstructorImg', 'url') || `https://i.pravatar.cc/150?u=${page.id}`,
      image: prop(page, 'Image', 'url') || `https://picsum.photos/seed/${index + 1}/400/200`,
      price: prop(page, 'Price', 'number') ?? 0,
      originalPrice: prop(page, 'OriginalPrice', 'number') || null,
      rating: prop(page, 'Rating', 'number') ?? 4.5,
      enrolled: prop(page, 'Enrolled', 'number') ?? 0,
      duration: prop(page, 'Duration', 'rich_text') || '—',
      lessons: prop(page, 'Lessons', 'number') ?? 0,
      description: prop(page, 'Description', 'rich_text') || '',
      featured: prop(page, 'Featured', 'checkbox') || false,
      curriculum: [],
    }));

    res.status(200).json({ courses });
  } catch (err) {
    console.error('Notion API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
