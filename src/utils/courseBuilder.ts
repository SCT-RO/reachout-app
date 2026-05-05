import type { CourseModule, QuizQuestion, Quiz, Assignment } from '../types';

const norm = (s: string) => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');

interface RawQuestion {
  id: string;
  question: string;
  moduleTitle: string;
  submoduleTitle?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
}

interface RawAssignment {
  id: string;
  title: string;
  briefDescription: string;
  moduleTitle: string;
  submoduleTitle?: string;
  objective1?: string;
  objective2?: string;
  objective3?: string;
  objective4?: string;
  deliverables: string;
  acceptedFormats?: string;
  estimatedTime: string;
}

interface RawModule {
  id: string;
  title: string;
  description?: string;
  order: number;
}

interface RawSubmodule {
  id: string;
  title: string;
  description?: string;
  order: number;
  moduleTitle: string;
}

interface RawContentItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'pdf' | 'image';
  duration?: string | null;
  size?: string | null;
  thumbnail?: string | null;
  url?: string;
  isPreview?: boolean;
  description?: string | null;
  order: number;
  moduleTitle?: string;
  submoduleTitle?: string;
}

function buildQuiz(questions: RawQuestion[], moduleTitle: string | null, submoduleTitle: string | null): Quiz | null {
  const filtered = questions.filter((q: RawQuestion) =>
    moduleTitle
      ? norm(q.moduleTitle) === norm(moduleTitle)
      : norm(q.submoduleTitle || '') === norm(submoduleTitle || '')
  );
  if (filtered.length === 0) return null;
  return {
    id: `quiz-${moduleTitle || submoduleTitle}`,
    title: `${moduleTitle || submoduleTitle} Quiz`,
    questions: filtered.map((q: RawQuestion): QuizQuestion => ({
      id: q.id,
      question: q.question,
      options: [q.optionA, q.optionB, q.optionC, q.optionD],
      correctAnswer: ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer),
      explanation: q.explanation,
    })),
  };
}

function buildAssignment(assignments: RawAssignment[], moduleTitle: string | null, submoduleTitle: string | null): Assignment | null {
  const found = assignments.find((a: RawAssignment) =>
    moduleTitle
      ? norm(a.moduleTitle) === norm(moduleTitle)
      : norm(a.submoduleTitle || '') === norm(submoduleTitle || '')
  );
  if (!found) return null;
  return {
    id: found.id,
    title: found.title,
    briefDescription: found.briefDescription,
    objectives: [found.objective1, found.objective2, found.objective3, found.objective4].filter(Boolean) as string[],
    deliverables: found.deliverables,
    acceptedFormats: found.acceptedFormats
      ? found.acceptedFormats.split(',').map((f: string) => f.trim()).filter(Boolean)
      : [],
    estimatedTime: found.estimatedTime,
  };
}

export async function buildCourseStructure(courseName: string): Promise<CourseModule[]> {
  const res = await fetch(`/api/courseStructure?courseName=${encodeURIComponent(courseName)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `courseStructure API returned ${res.status}`);
  }

  const { modules, submodules, contentItems, quizzes = [], assignments = [] }: {
    modules: RawModule[];
    submodules: RawSubmodule[];
    contentItems: RawContentItem[];
    quizzes: RawQuestion[];
    assignments: RawAssignment[];
  } = await res.json();
  console.log('[courseBuilder] raw:', modules.length, 'modules,', submodules.length, 'submodules,', contentItems.length, 'content,', quizzes.length, 'quiz questions,', assignments.length, 'assignments');
  console.log('[courseBuilder] module titles from API:', modules.map((m: RawModule) => m.title));
  console.log('[courseBuilder] quiz moduleTitles from API:', [...new Set(quizzes.map((q: RawQuestion) => q.moduleTitle))]);
  console.log('[courseBuilder] quiz submoduleTitles from API:', [...new Set(quizzes.map((q: RawQuestion) => q.submoduleTitle).filter(Boolean))]);

  if (!modules || modules.length === 0) {
    throw new Error('No modules returned from Airtable');
  }

  return modules.map((mod: RawModule) => {
    const modSubmodules = submodules
      .filter((s: RawSubmodule) => norm(s.moduleTitle) === norm(mod.title))
      .sort((a: RawSubmodule, b: RawSubmodule) => a.order - b.order)
      .map((sub: RawSubmodule) => ({
        ...sub,
        content: contentItems
          .filter((c: RawContentItem) => norm(c.submoduleTitle || '') === norm(sub.title))
          .sort((a: RawContentItem, b: RawContentItem) => a.order - b.order),
        quiz: buildQuiz(quizzes, null, sub.title),
        assignment: buildAssignment(assignments, null, sub.title),
      }));

    const hasSubmodules = modSubmodules.length > 0;

    const modContentItems = contentItems.filter((c: RawContentItem) => norm(c.moduleTitle || '') === norm(mod.title));
    const knownSubTitles = new Set(modSubmodules.map((s: RawSubmodule) => norm(s.title)));
    const directContent = modContentItems
      .filter((c: RawContentItem) => !(c.submoduleTitle || '').trim() || !knownSubTitles.has(norm(c.submoduleTitle || '')))
      .sort((a: RawContentItem, b: RawContentItem) => a.order - b.order);

    console.log(`[courseBuilder] "${mod.title}": ${modContentItems.length} total items, ${directContent.length} direct, ${modSubmodules.length} submodules`);

    return {
      ...mod,
      type: hasSubmodules ? 'submodules' : 'content',
      submodules: hasSubmodules ? modSubmodules : [],
      content: hasSubmodules ? [] : directContent,
      // Modules with submodules have no quiz/assignment — those live on the submodules
      quiz: hasSubmodules ? null : buildQuiz(quizzes, mod.title, null),
      assignment: hasSubmodules ? null : buildAssignment(assignments, mod.title, null),
    } as CourseModule;
  });
}
