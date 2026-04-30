// Normalize for comparison: lowercase + collapse whitespace
const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');

export async function buildCourseStructure(courseName) {
  const res = await fetch(`/api/courseStructure?courseName=${encodeURIComponent(courseName)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `courseStructure API returned ${res.status}`);
  }

  const { modules, submodules, contentItems } = await res.json();
  console.log('[courseBuilder] raw:', modules.length, 'modules,', submodules.length, 'submodules,', contentItems.length, 'content items');

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

    // All content matching this module title
    const modContentItems = contentItems.filter(c => norm(c.moduleTitle) === norm(mod.title));

    // Direct content: items with no submodule title, OR items whose submodule title
    // doesn't match any of this module's submodules (defensive fallback)
    const knownSubTitles = new Set(modSubmodules.map(s => norm(s.title)));
    const directContent = modContentItems
      .filter(c => !c.submoduleTitle.trim() || !knownSubTitles.has(norm(c.submoduleTitle)))
      .sort((a, b) => a.order - b.order);

    console.log(`[courseBuilder] "${mod.title}": ${modContentItems.length} total items, ${directContent.length} direct, ${modSubmodules.length} submodules`);

    return {
      ...mod,
      type: hasSubmodules ? 'submodules' : 'content',
      submodules: hasSubmodules ? modSubmodules : [],
      content: hasSubmodules ? [] : directContent,
    };
  });
}
