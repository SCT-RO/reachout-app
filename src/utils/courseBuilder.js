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
      .filter(s => s.moduleTitle === mod.title)
      .sort((a, b) => a.order - b.order)
      .map(sub => ({
        ...sub,
        content: contentItems
          .filter(c => c.submoduleTitle === sub.title)
          .sort((a, b) => a.order - b.order),
      }));

    const hasSubmodules = modSubmodules.length > 0;

    const directContent = contentItems
      .filter(c => c.moduleTitle === mod.title && !c.submoduleTitle)
      .sort((a, b) => a.order - b.order);

    return {
      ...mod,
      type: hasSubmodules ? 'submodules' : 'content',
      submodules: hasSubmodules ? modSubmodules : [],
      content: hasSubmodules ? [] : directContent,
    };
  });
}
