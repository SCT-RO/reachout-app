const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const MODULES_TABLE = process.env.AIRTABLE_MODULES_TABLE;
const SUBMODULES_TABLE = process.env.AIRTABLE_SUBMODULES_TABLE;
const CONTENT_TABLE = process.env.AIRTABLE_CONTENT_TABLE;
const QUIZZES_TABLE = process.env.AIRTABLE_QUIZZES_TABLE;
const ASSIGNMENTS_TABLE = process.env.AIRTABLE_ASSIGNMENTS_TABLE;

async function fetchAll(tableId, filterFormula) {
  const records = [];
  let offset = null;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableId)}`);
    if (filterFormula) url.searchParams.set('filterByFormula', filterFormula);
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Airtable ${res.status}: ${body}`);
    }
    const data = await res.json();
    records.push(...data.records);
    offset = data.offset ?? null;
  } while (offset);
  return records;
}

function escapeStr(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildOrFormula(field, values) {
  if (!values.length) return 'FALSE()';
  const clauses = values.map(v => `{${field}} = "${escapeStr(v)}"`);
  return clauses.length === 1 ? clauses[0] : `OR(${clauses.join(',')})`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { courseName } = req.query;
  if (!courseName) return res.status(400).json({ error: 'courseName is required' });

  if (!AIRTABLE_API_KEY || !BASE_ID || !MODULES_TABLE || !SUBMODULES_TABLE || !CONTENT_TABLE) {
    return res.status(500).json({
      error: 'Missing env vars: AIRTABLE_MODULES_TABLE, AIRTABLE_SUBMODULES_TABLE, AIRTABLE_CONTENT_TABLE',
    });
  }

  try {
    // 1. Fetch modules for this course
    const modulesFilter = `{Course Name} = "${escapeStr(courseName)}"`;
    const moduleRecords = await fetchAll(MODULES_TABLE, modulesFilter);

    const modules = moduleRecords.map(r => ({
      id: r.id,
      title: (r.fields['Module Title'] || r.fields['Title'] || '').trim(),
      order: r.fields['Order'] ?? 0,
      description: r.fields['Description'] || '',
      type: r.fields['Type'] || 'content',
    })).sort((a, b) => a.order - b.order);

    const moduleTitles = modules.map(m => m.title).filter(Boolean);

    // 2. Fetch submodules filtered by module titles
    let submodules = [];
    if (moduleTitles.length > 0) {
      const subsFilter = buildOrFormula('Module Title', moduleTitles);
      const subRecords = await fetchAll(SUBMODULES_TABLE, subsFilter);
      submodules = subRecords.map(r => ({
        id: r.id,
        title: (r.fields['Submodule Title'] || r.fields['Title'] || '').trim(),
        moduleTitle: (r.fields['Module Title'] || '').trim(),
        order: r.fields['Order'] ?? 0,
        description: r.fields['Description'] || '',
      })).sort((a, b) => a.order - b.order);
    }

    const submoduleTitles = submodules.map(s => s.title).filter(Boolean);

    // 3. Fetch content, quizzes, and assignments in parallel
    let contentItems = [], quizzes = [], assignments = [];

    if (moduleTitles.length > 0) {
      const modFilter = buildOrFormula('Module Title', moduleTitles);
      const subFilter = submoduleTitles.length > 0
        ? buildOrFormula('Submodule Title', submoduleTitles)
        : null;
      const combinedFilter = subFilter ? `OR(${modFilter},${subFilter})` : modFilter;

      const [contentRecords, quizRecords, assignmentRecords] = await Promise.all([
        fetchAll(CONTENT_TABLE, combinedFilter),
        QUIZZES_TABLE ? fetchAll(QUIZZES_TABLE, combinedFilter) : Promise.resolve([]),
        ASSIGNMENTS_TABLE ? fetchAll(ASSIGNMENTS_TABLE, combinedFilter) : Promise.resolve([]),
      ]);

      contentItems = contentRecords.map(r => ({
        id: r.id,
        title: (r.fields['Content Title'] || r.fields['Title'] || '').trim(),
        moduleTitle: (r.fields['Module Title'] || '').trim(),
        submoduleTitle: (r.fields['Submodule Title'] || '').trim(),
        type: (r.fields['Type'] || 'video').toLowerCase(),
        url: r.fields['URL'] || r.fields['Content URL'] || '',
        duration: r.fields['Duration'] || '',
        size: r.fields['File Size'] || '',
        order: r.fields['Order'] ?? 0,
        description: r.fields['Description'] || '',
        thumbnail: Array.isArray(r.fields['Thumbnail']) ? r.fields['Thumbnail'][0]?.url : (r.fields['Thumbnail'] || ''),
      })).sort((a, b) => a.order - b.order);

      quizzes = quizRecords.map(r => ({
        id: r.id,
        question: r.fields['Question'] || '',
        optionA: r.fields['Option A'] || '',
        optionB: r.fields['Option B'] || '',
        optionC: r.fields['Option C'] || '',
        optionD: r.fields['Option D'] || '',
        correctAnswer: r.fields['Correct Answer'] || 'A',
        explanation: r.fields['Explanation'] || '',
        order: r.fields['Order Number'] ?? 0,
        moduleTitle: (r.fields['Module Title'] || '').trim(),
        submoduleTitle: (r.fields['Submodule Title'] || '').trim(),
      })).sort((a, b) => a.order - b.order);

      assignments = assignmentRecords.map(r => ({
        id: r.id,
        title: r.fields['Assignment Title'] || '',
        briefDescription: r.fields['Brief Description'] || '',
        objective1: r.fields['Objective 1'] || '',
        objective2: r.fields['Objective 2'] || '',
        objective3: r.fields['Objective 3'] || '',
        objective4: r.fields['Objective 4'] || '',
        deliverables: r.fields['Deliverables'] || '',
        acceptedFormats: r.fields['Accepted Formats'] || '',
        estimatedTime: r.fields['Estimated Time'] || '',
        moduleTitle: (r.fields['Module Title'] || '').trim(),
        submoduleTitle: (r.fields['Submodule Title'] || '').trim(),
      }));
    }

    res.status(200).json({ modules, submodules, contentItems, quizzes, assignments });
  } catch (err) {
    console.error('courseStructure API error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
