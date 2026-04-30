const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');

function buildQuiz(questions, moduleTitle, submoduleTitle) {
  const filtered = questions.filter(q =>
    moduleTitle
      ? norm(q.moduleTitle) === norm(moduleTitle)
      : norm(q.submoduleTitle) === norm(submoduleTitle)
  );
  if (filtered.length === 0) return null;
  return {
    id: `quiz-${moduleTitle || submoduleTitle}`,
    title: `${moduleTitle || submoduleTitle} Quiz`,
    questions: filtered.map(q => ({
      id: q.id,
      question: q.question,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer),
      explanation: q.explanation,
    })),
  };
}

function buildAssignment(assignments, moduleTitle, submoduleTitle) {
  const found = assignments.find(a =>
    moduleTitle
      ? norm(a.moduleTitle) === norm(moduleTitle)
      : norm(a.submoduleTitle) === norm(submoduleTitle)
  );
  if (!found) return null;
  return {
    id: found.id,
    title: found.title,
    briefDescription: found.briefDescription,
    objectives: [found.objective1, found.objective2, found.objective3, found.objective4].filter(Boolean),
    deliverables: found.deliverables,
    acceptedFormats: found.acceptedFormats
      ? found.acceptedFormats.split(',').map(f => f.trim()).filter(Boolean)
      : [],
    estimatedTime: found.estimatedTime,
  };
}

export async function buildCourseStructure(courseName) {
  const res = await fetch(`/api/courseStructure?courseName=${encodeURIComponent(courseName)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `courseStructure API returned ${res.status}`);
  }

  const { modules, submodules, contentItems, quizzes = [], assignments = [] } = await res.json();
  console.log('[courseBuilder] raw:', modules.length, 'modules,', submodules.length, 'submodules,', contentItems.length, 'content,', quizzes.length, 'quiz questions,', assignments.length, 'assignments');

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
        quiz: buildQuiz(quizzes, null, sub.title),
        assignment: buildAssignment(assignments, null, sub.title),
      }));

    const hasSubmodules = modSubmodules.length > 0;

    const modContentItems = contentItems.filter(c => norm(c.moduleTitle) === norm(mod.title));
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
      quiz: buildQuiz(quizzes, mod.title, null),
      assignment: buildAssignment(assignments, mod.title, null),
    };
  });
}
