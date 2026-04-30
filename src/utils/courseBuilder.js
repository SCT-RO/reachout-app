// Normalize for comparison: lowercase + collapse whitespace
const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');

export async function buildCourseStructure(courseName) {
  const res = await fetch(`/api/courseStructure?courseName=${encodeURIComponent(courseName)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `courseStructure API returned ${res.status}`);
  }

  const { modules, submodules, contentItems } = await res.json();

  if (!modules || modules.length === 0) {
    throw new Error('No modules returned from Airtable');
  }

  return modules.map(mod => {
    const modSubmodules = submodules
      .filter(s => norm(s.moduleTitle) === norm(mod.title))
      .sort((a, b) => a.order - b.order)
      .map(sub => ({
        ...sub,
        content: contentItems
          .filter(c => norm(c.submoduleTitle) === norm(sub.title))
          .sort((a, b) => a.order - b.order),
      }));

    const hasSubmodules = modSubmodules.length > 0;

    const directContent = contentItems
      .filter(c => norm(c.moduleTitle) === norm(mod.title) && !c.submoduleTitle.trim())
      .sort((a, b) => a.order - b.order);

    return {
      ...mod,
      type: hasSubmodules ? 'submodules' : 'content',
      submodules: hasSubmodules ? modSubmodules : [],
      content: hasSubmodules ? [] : directContent,
    };
  });
}
