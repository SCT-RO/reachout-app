// ─── Utility: find package matching an Airtable course title ─────────────────
function slugify(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
export function findCoursePackage(courseTitle) {
  const slug = slugify(courseTitle);
  return coursePackages.find(p => p.matchKeywords.some(kw => slug.includes(slugify(kw))));
}

// ─── Utility: flatten all content across modules/submodules ──────────────────
export function getAllContent(pkg) {
  if (!pkg) return [];
  const all = [];
  for (const mod of pkg.modules) {
    if (mod.type === 'content') {
      (mod.content || []).forEach(c => all.push({ ...c, moduleId: mod.id, submoduleId: null }));
    } else {
      for (const sub of mod.submodules || []) {
        (sub.content || []).forEach(c => all.push({ ...c, moduleId: mod.id, submoduleId: sub.id }));
      }
    }
  }
  return all;
}

// ─── Utility: find a single content item by id ───────────────────────────────
export function findContent(pkg, contentId) {
  if (!pkg) return null;
  for (const mod of pkg.modules) {
    if (mod.type === 'content') {
      const item = (mod.content || []).find(c => c.id === contentId);
      if (item) return { item, module: mod, submodule: null };
    } else {
      for (const sub of mod.submodules || []) {
        const item = (sub.content || []).find(c => c.id === contentId);
        if (item) return { item, module: mod, submodule: sub };
      }
    }
  }
  return null;
}

// ─── Utility: count all content items in a package ───────────────────────────
export function getTotalContentCount(pkg) {
  return getAllContent(pkg).length;
}

// ─── Course Packages (full hierarchy) ────────────────────────────────────────
export const coursePackages = [
  // ── COURSE 1: Python for Data Science ──────────────────────────────────────
  {
    id: 'pkg_py',
    matchKeywords: ['python'],
    title: 'Python for Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80',
    instructor: 'Arjun Mehta',
    instructorImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    price: 1499,
    originalPrice: 2499,
    rating: 4.8,
    enrolled: 3420,
    category: 'Technology',
    description: 'Master Python for data analysis, visualization, and machine learning. Covers pandas, NumPy, Matplotlib, and scikit-learn with hands-on projects.',
    featured: true,
    totalDuration: '12h 40m',
    totalLessons: 29,
    modules: [
      {
        id: 'py_m1', title: 'Getting Started', description: 'Set up your environment and write your first Python script.', order: 1, type: 'content',
        content: [
          { id: 'py_m1_c1', title: 'Welcome to the Course', type: 'video', duration: '5:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80', url: 'mock://py_m1_c1', isPreview: true, description: 'Course overview and what you will build.' },
          { id: 'py_m1_c2', title: 'Setting Up Python & Anaconda', type: 'video', duration: '12:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80', url: 'mock://py_m1_c2', isPreview: false, description: 'Install Python, Anaconda, and Jupyter Notebook.' },
          { id: 'py_m1_c3', title: 'Your First Python Script', type: 'video', duration: '8:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://py_m1_c3', isPreview: false, description: 'Write and run your first Python program.' },
          { id: 'py_m1_c4', title: 'Course Resources & Cheatsheet', type: 'pdf', duration: null, size: '1.2 MB', thumbnail: null, url: 'mock://py_m1_c4', isPreview: true, description: 'Downloadable cheatsheet and resource links.' },
        ],
      },
      {
        id: 'py_m2', title: 'Python Fundamentals', description: 'Core Python syntax, data types, and functions.', order: 2, type: 'submodules',
        submodules: [
          {
            id: 'py_m2_s1', title: 'Variables & Data Types', description: 'Learn Python variables, numbers, strings, and booleans.', order: 1,
            content: [
              { id: 'py_m2_s1_c1', title: 'Understanding Variables', type: 'video', duration: '15:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80', url: 'mock://py_m2_s1_c1', isPreview: false, description: 'How variables work in Python.' },
              { id: 'py_m2_s1_c2', title: 'Numbers, Strings & Booleans', type: 'video', duration: '18:25', size: null, thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80', url: 'mock://py_m2_s1_c2', isPreview: false, description: 'Core data types with examples.' },
              { id: 'py_m2_s1_c3', title: 'Practice Exercises', type: 'pdf', duration: null, size: '0.8 MB', thumbnail: null, url: 'mock://py_m2_s1_c3', isPreview: false, description: 'Hands-on exercises for variables and data types.' },
            ],
          },
          {
            id: 'py_m2_s2', title: 'Control Flow', description: 'Conditionals and loops in Python.', order: 2,
            content: [
              { id: 'py_m2_s2_c1', title: 'If Else Statements', type: 'video', duration: '14:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://py_m2_s2_c1', isPreview: false, description: 'Conditional logic in Python.' },
              { id: 'py_m2_s2_c2', title: 'Loops — For and While', type: 'video', duration: '22:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&q=80', url: 'mock://py_m2_s2_c2', isPreview: false, description: 'Iteration using for and while loops.' },
              { id: 'py_m2_s2_c3', title: 'Loop Exercises', type: 'pdf', duration: null, size: '1.1 MB', thumbnail: null, url: 'mock://py_m2_s2_c3', isPreview: false, description: 'Practice problems for loops.' },
            ],
          },
          {
            id: 'py_m2_s3', title: 'Functions', description: 'Define reusable functions in Python.', order: 3,
            content: [
              { id: 'py_m2_s3_c1', title: 'Defining Functions', type: 'video', duration: '16:40', size: null, thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80', url: 'mock://py_m2_s3_c1', isPreview: false, description: 'How to define and call functions.' },
              { id: 'py_m2_s3_c2', title: 'Args, Kwargs & Scope', type: 'video', duration: '19:55', size: null, thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80', url: 'mock://py_m2_s3_c2', isPreview: false, description: 'Advanced function arguments and variable scope.' },
              { id: 'py_m2_s3_c3', title: 'Lambda Functions', type: 'video', duration: '11:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://py_m2_s3_c3', isPreview: false, description: 'One-line anonymous functions in Python.' },
            ],
          },
        ],
      },
      {
        id: 'py_m3', title: 'Data Analysis with Pandas', description: 'Load, clean, and analyse data with the Pandas library.', order: 3, type: 'submodules',
        submodules: [
          {
            id: 'py_m3_s1', title: 'DataFrames', description: 'Create and manipulate Pandas DataFrames.', order: 1,
            content: [
              { id: 'py_m3_s1_c1', title: 'Introduction to Pandas', type: 'video', duration: '20:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80', url: 'mock://py_m3_s1_c1', isPreview: false, description: 'Overview of the Pandas library.' },
              { id: 'py_m3_s1_c2', title: 'Loading CSV Files', type: 'video', duration: '14:25', size: null, thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80', url: 'mock://py_m3_s1_c2', isPreview: false, description: 'Read and explore CSV data.' },
              { id: 'py_m3_s1_c3', title: 'DataFrame Cheatsheet', type: 'pdf', duration: null, size: '2.1 MB', thumbnail: null, url: 'mock://py_m3_s1_c3', isPreview: false, description: 'Reference sheet for Pandas operations.' },
            ],
          },
          {
            id: 'py_m3_s2', title: 'Data Cleaning', description: 'Handle missing values and transform data.', order: 2,
            content: [
              { id: 'py_m3_s2_c1', title: 'Handling Missing Values', type: 'video', duration: '18:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80', url: 'mock://py_m3_s2_c1', isPreview: false, description: 'Strategies for dealing with NaN values.' },
              { id: 'py_m3_s2_c2', title: 'Filtering & Sorting', type: 'video', duration: '16:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80', url: 'mock://py_m3_s2_c2', isPreview: false, description: 'Filter rows and sort DataFrames.' },
              { id: 'py_m3_s2_c3', title: 'Data Cleaning Project', type: 'pdf', duration: null, size: '1.8 MB', thumbnail: null, url: 'mock://py_m3_s2_c3', isPreview: false, description: 'A real-world data cleaning exercise.' },
            ],
          },
        ],
      },
      {
        id: 'py_m4', title: 'Data Visualization', description: 'Create compelling charts with Matplotlib and Seaborn.', order: 4, type: 'content',
        content: [
          { id: 'py_m4_c1', title: 'Matplotlib Basics', type: 'video', duration: '22:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80', url: 'mock://py_m4_c1', isPreview: false, description: 'Line, bar, and scatter charts with Matplotlib.' },
          { id: 'py_m4_c2', title: 'Seaborn for Beautiful Charts', type: 'video', duration: '19:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://py_m4_c2', isPreview: false, description: 'Statistical visualizations using Seaborn.' },
          { id: 'py_m4_c3', title: 'Chart Types Guide', type: 'image', duration: null, size: '3.2 MB', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://py_m4_c3', isPreview: false, description: 'Visual reference for chart selection.' },
          { id: 'py_m4_c4', title: 'Visualization Project', type: 'pdf', duration: null, size: '2.4 MB', thumbnail: null, url: 'mock://py_m4_c4', isPreview: false, description: 'Build a complete data story with charts.' },
        ],
      },
      {
        id: 'py_m5', title: 'Machine Learning Intro', description: 'Train your first ML models with scikit-learn.', order: 5, type: 'submodules',
        submodules: [
          {
            id: 'py_m5_s1', title: 'Scikit-Learn Basics', description: 'Build and train ML models.', order: 1,
            content: [
              { id: 'py_m5_s1_c1', title: 'What is Machine Learning?', type: 'video', duration: '25:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80', url: 'mock://py_m5_s1_c1', isPreview: false, description: 'Overview of supervised and unsupervised ML.' },
              { id: 'py_m5_s1_c2', title: 'Your First ML Model', type: 'video', duration: '31:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&q=80', url: 'mock://py_m5_s1_c2', isPreview: false, description: 'Train a linear regression model end-to-end.' },
              { id: 'py_m5_s1_c3', title: 'ML Concepts Diagram', type: 'image', duration: null, size: '1.9 MB', thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80', url: 'mock://py_m5_s1_c3', isPreview: false, description: 'Visual map of ML concepts and terminology.' },
            ],
          },
          {
            id: 'py_m5_s2', title: 'Model Evaluation', description: 'Measure and improve model performance.', order: 2,
            content: [
              { id: 'py_m5_s2_c1', title: 'Train Test Split', type: 'video', duration: '18:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80', url: 'mock://py_m5_s2_c1', isPreview: false, description: 'Why and how to split your dataset.' },
              { id: 'py_m5_s2_c2', title: 'Accuracy & Confusion Matrix', type: 'video', duration: '22:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://py_m5_s2_c2', isPreview: false, description: 'Evaluate classification models correctly.' },
              { id: 'py_m5_s2_c3', title: 'Final Project Brief', type: 'pdf', duration: null, size: '1.5 MB', thumbnail: null, url: 'mock://py_m5_s2_c3', isPreview: false, description: 'Instructions for the course capstone project.' },
            ],
          },
        ],
      },
    ],
  },

  // ── COURSE 2: UI/UX Design Masterclass ─────────────────────────────────────
  {
    id: 'pkg_uiux',
    matchKeywords: ['uiux', 'uxdesign', 'designmasterclass', 'uiuxdesign'],
    title: 'UI/UX Design Masterclass',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
    instructor: 'Priya Sharma',
    instructorImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    price: 0,
    originalPrice: null,
    rating: 4.7,
    enrolled: 5890,
    category: 'Design',
    description: 'Learn the full design process from research to high-fidelity prototyping using Figma. Build a portfolio-ready case study.',
    featured: false,
    totalDuration: '10h 20m',
    totalLessons: 28,
    modules: [
      {
        id: 'ux_m1', title: 'Design Foundations', description: 'Core principles every designer needs to know.', order: 1, type: 'content',
        content: [
          { id: 'ux_m1_c1', title: 'What is UI vs UX?', type: 'video', duration: '8:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', url: 'mock://ux_m1_c1', isPreview: true, description: 'Understand the difference between UI and UX design.' },
          { id: 'ux_m1_c2', title: 'Design Thinking Process', type: 'video', duration: '14:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80', url: 'mock://ux_m1_c2', isPreview: false, description: 'The 5-stage design thinking framework.' },
          { id: 'ux_m1_c3', title: 'Design Principles PDF', type: 'pdf', duration: null, size: '2.2 MB', thumbnail: null, url: 'mock://ux_m1_c3', isPreview: true, description: 'Key design principles with visual examples.' },
        ],
      },
      {
        id: 'ux_m2', title: 'Research & Discovery', description: 'Understand users before designing for them.', order: 2, type: 'submodules',
        submodules: [
          {
            id: 'ux_m2_s1', title: 'User Research', description: 'Conduct interviews and surveys.', order: 1,
            content: [
              { id: 'ux_m2_s1_c1', title: 'User Interviews', type: 'video', duration: '18:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', url: 'mock://ux_m2_s1_c1', isPreview: false, description: 'Plan and run effective user interviews.' },
              { id: 'ux_m2_s1_c2', title: 'Survey Design', type: 'video', duration: '12:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', url: 'mock://ux_m2_s1_c2', isPreview: false, description: 'Design surveys that yield actionable insights.' },
              { id: 'ux_m2_s1_c3', title: 'Research Templates', type: 'pdf', duration: null, size: '1.8 MB', thumbnail: null, url: 'mock://ux_m2_s1_c3', isPreview: false, description: 'Ready-to-use templates for user research.' },
            ],
          },
          {
            id: 'ux_m2_s2', title: 'Competitive Analysis', description: 'Analyse the market and learn from competitors.', order: 2,
            content: [
              { id: 'ux_m2_s2_c1', title: 'How to Analyse Competitors', type: 'video', duration: '15:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', url: 'mock://ux_m2_s2_c1', isPreview: false, description: 'Framework for competitive UX analysis.' },
              { id: 'ux_m2_s2_c2', title: 'Analysis Framework', type: 'pdf', duration: null, size: '1.2 MB', thumbnail: null, url: 'mock://ux_m2_s2_c2', isPreview: false, description: 'Structured worksheet for competitor review.' },
              { id: 'ux_m2_s2_c3', title: 'Sample Analysis', type: 'image', duration: null, size: '2.1 MB', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', url: 'mock://ux_m2_s2_c3', isPreview: false, description: 'Annotated example of a completed analysis.' },
            ],
          },
        ],
      },
      {
        id: 'ux_m3', title: 'Wireframing & Prototyping', description: 'From rough sketches to clickable prototypes.', order: 3, type: 'submodules',
        submodules: [
          {
            id: 'ux_m3_s1', title: 'Low Fidelity Wireframes', description: 'Sketch and digitise early ideas.', order: 1,
            content: [
              { id: 'ux_m3_s1_c1', title: 'Sketching Basics', type: 'video', duration: '16:40', size: null, thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80', url: 'mock://ux_m3_s1_c1', isPreview: false, description: 'Rapid pen-and-paper wireframing techniques.' },
              { id: 'ux_m3_s1_c2', title: 'Digital Wireframing', type: 'video', duration: '22:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', url: 'mock://ux_m3_s1_c2', isPreview: false, description: 'Create wireframes in Figma.' },
              { id: 'ux_m3_s1_c3', title: 'Wireframe Kit', type: 'pdf', duration: null, size: '3.4 MB', thumbnail: null, url: 'mock://ux_m3_s1_c3', isPreview: false, description: 'Component kit for fast wireframing.' },
            ],
          },
          {
            id: 'ux_m3_s2', title: 'High Fidelity Prototypes', description: 'Build interactive, pixel-perfect prototypes.', order: 2,
            content: [
              { id: 'ux_m3_s2_c1', title: 'Figma Fundamentals', type: 'video', duration: '28:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', url: 'mock://ux_m3_s2_c1', isPreview: false, description: 'Master Figma from scratch.' },
              { id: 'ux_m3_s2_c2', title: 'Interactive Prototyping', type: 'video', duration: '24:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80', url: 'mock://ux_m3_s2_c2', isPreview: false, description: 'Add interactions and transitions to your prototype.' },
              { id: 'ux_m3_s2_c3', title: 'Prototype Checklist', type: 'pdf', duration: null, size: '1.1 MB', thumbnail: null, url: 'mock://ux_m3_s2_c3', isPreview: false, description: 'Quality-check your prototype before testing.' },
            ],
          },
        ],
      },
      {
        id: 'ux_m4', title: 'Visual Design', description: 'Colour, typography, and layout principles.', order: 4, type: 'content',
        content: [
          { id: 'ux_m4_c1', title: 'Color Theory', type: 'video', duration: '20:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80', url: 'mock://ux_m4_c1', isPreview: false, description: 'How to choose and apply color palettes.' },
          { id: 'ux_m4_c2', title: 'Typography in UI', type: 'video', duration: '17:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', url: 'mock://ux_m4_c2', isPreview: false, description: 'Font pairing, hierarchy, and readability.' },
          { id: 'ux_m4_c3', title: 'Spacing & Layout', type: 'video', duration: '15:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&q=80', url: 'mock://ux_m4_c3', isPreview: false, description: 'Grid systems and spacing rules.' },
          { id: 'ux_m4_c4', title: 'Design System Overview', type: 'image', duration: null, size: '4.1 MB', thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80', url: 'mock://ux_m4_c4', isPreview: false, description: 'Example design system components annotated.' },
        ],
      },
      {
        id: 'ux_m5', title: 'Usability Testing', description: 'Validate your designs with real users.', order: 5, type: 'submodules',
        submodules: [
          {
            id: 'ux_m5_s1', title: 'Planning Tests', description: 'Set up successful usability tests.', order: 1,
            content: [
              { id: 'ux_m5_s1_c1', title: 'Test Planning Guide', type: 'video', duration: '14:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', url: 'mock://ux_m5_s1_c1', isPreview: false, description: 'Define goals and tasks for your usability test.' },
              { id: 'ux_m5_s1_c2', title: 'Recruiting Participants', type: 'audio', duration: '18:30', size: null, thumbnail: null, url: 'mock://ux_m5_s1_c2', isPreview: false, description: 'Find and screen the right research participants.' },
              { id: 'ux_m5_s1_c3', title: 'Test Script Template', type: 'pdf', duration: null, size: '0.9 MB', thumbnail: null, url: 'mock://ux_m5_s1_c3', isPreview: false, description: 'Fill-in-the-blank script for moderated testing.' },
            ],
          },
          {
            id: 'ux_m5_s2', title: 'Running & Analysing Tests', description: 'Conduct tests and turn findings into action.', order: 2,
            content: [
              { id: 'ux_m5_s2_c1', title: 'Moderated Testing', type: 'video', duration: '22:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80', url: 'mock://ux_m5_s2_c1', isPreview: false, description: 'Facilitate a session and take useful notes.' },
              { id: 'ux_m5_s2_c2', title: 'Synthesising Results', type: 'video', duration: '19:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', url: 'mock://ux_m5_s2_c2', isPreview: false, description: 'Affinity mapping and finding patterns.' },
              { id: 'ux_m5_s2_c3', title: 'Findings Report Template', type: 'pdf', duration: null, size: '1.6 MB', thumbnail: null, url: 'mock://ux_m5_s2_c3', isPreview: false, description: 'Professional report format for stakeholders.' },
            ],
          },
        ],
      },
    ],
  },

  // ── COURSE 3: Financial Modeling ────────────────────────────────────────────
  {
    id: 'pkg_fin',
    matchKeywords: ['financialmodel', 'financialmodeling', 'financialmodelling'],
    title: 'Financial Modeling Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    instructor: 'Rahul Kapoor',
    instructorImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
    price: 1799,
    originalPrice: 3499,
    rating: 4.6,
    enrolled: 2100,
    category: 'Business',
    description: 'Build professional-grade financial models in Excel. Covers DCF analysis, financial statements, and valuation techniques.',
    featured: false,
    totalDuration: '9h 30m',
    totalLessons: 22,
    modules: [
      {
        id: 'fin_m1', title: 'Excel Foundations', description: 'Master Excel for financial analysis.', order: 1, type: 'content',
        content: [
          { id: 'fin_m1_c1', title: 'Excel for Finance', type: 'video', duration: '16:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', url: 'mock://fin_m1_c1', isPreview: true, description: 'Why Excel is the finance professional\'s tool.' },
          { id: 'fin_m1_c2', title: 'Key Shortcuts & Formulas', type: 'pdf', duration: null, size: '1.8 MB', thumbnail: null, url: 'mock://fin_m1_c2', isPreview: true, description: 'Essential Excel shortcuts and finance formulas.' },
          { id: 'fin_m1_c3', title: 'Excel Setup Guide', type: 'video', duration: '10:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&q=80', url: 'mock://fin_m1_c3', isPreview: false, description: 'Configure Excel for financial modeling.' },
        ],
      },
      {
        id: 'fin_m2', title: 'Financial Statements', description: 'Build the three core financial statements.', order: 2, type: 'submodules',
        submodules: [
          {
            id: 'fin_m2_s1', title: 'Income Statement', description: 'Model revenues, costs, and profit.', order: 1,
            content: [
              { id: 'fin_m2_s1_c1', title: 'Reading an Income Statement', type: 'video', duration: '20:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', url: 'mock://fin_m2_s1_c1', isPreview: false, description: 'Navigate a real income statement line by line.' },
              { id: 'fin_m2_s1_c2', title: 'Building P&L from Scratch', type: 'video', duration: '28:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&q=80', url: 'mock://fin_m2_s1_c2', isPreview: false, description: 'Build a full P&L model in Excel.' },
              { id: 'fin_m2_s1_c3', title: 'P&L Template', type: 'pdf', duration: null, size: '2.1 MB', thumbnail: null, url: 'mock://fin_m2_s1_c3', isPreview: false, description: 'Pre-built P&L Excel template.' },
            ],
          },
          {
            id: 'fin_m2_s2', title: 'Balance Sheet', description: 'Assets, liabilities, and equity explained.', order: 2,
            content: [
              { id: 'fin_m2_s2_c1', title: 'Assets Liabilities & Equity', type: 'video', duration: '22:40', size: null, thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', url: 'mock://fin_m2_s2_c1', isPreview: false, description: 'The accounting equation explained clearly.' },
              { id: 'fin_m2_s2_c2', title: 'Balance Sheet Template', type: 'pdf', duration: null, size: '1.9 MB', thumbnail: null, url: 'mock://fin_m2_s2_c2', isPreview: false, description: 'Pre-built balance sheet model.' },
            ],
          },
          {
            id: 'fin_m2_s3', title: 'Cash Flow Statement', description: 'Track real cash movement in a business.', order: 3,
            content: [
              { id: 'fin_m2_s3_c1', title: 'Direct vs Indirect Method', type: 'video', duration: '18:55', size: null, thumbnail: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&q=80', url: 'mock://fin_m2_s3_c1', isPreview: false, description: 'Two methods for preparing cash flow statements.' },
              { id: 'fin_m2_s3_c2', title: 'Cash Flow Template', type: 'pdf', duration: null, size: '1.7 MB', thumbnail: null, url: 'mock://fin_m2_s3_c2', isPreview: false, description: 'Excel template with formulas pre-built.' },
            ],
          },
        ],
      },
      {
        id: 'fin_m3', title: 'Valuation Methods', description: 'Value a business using DCF and comparable analysis.', order: 3, type: 'submodules',
        submodules: [
          {
            id: 'fin_m3_s1', title: 'DCF Analysis', description: 'Discounted cash flow valuation.', order: 1,
            content: [
              { id: 'fin_m3_s1_c1', title: 'Time Value of Money', type: 'video', duration: '24:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', url: 'mock://fin_m3_s1_c1', isPreview: false, description: 'Why a dollar today is worth more than tomorrow.' },
              { id: 'fin_m3_s1_c2', title: 'Building a DCF Model', type: 'video', duration: '35:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&q=80', url: 'mock://fin_m3_s1_c2', isPreview: false, description: 'Step-by-step DCF model from scratch.' },
              { id: 'fin_m3_s1_c3', title: 'DCF Template', type: 'pdf', duration: null, size: '2.8 MB', thumbnail: null, url: 'mock://fin_m3_s1_c3', isPreview: false, description: 'Complete DCF model template.' },
            ],
          },
          {
            id: 'fin_m3_s2', title: 'Comparable Company Analysis', description: 'Value using market multiples.', order: 2,
            content: [
              { id: 'fin_m3_s2_c1', title: 'Trading Comps Explained', type: 'video', duration: '19:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', url: 'mock://fin_m3_s2_c1', isPreview: false, description: 'How to pick and use comparable companies.' },
              { id: 'fin_m3_s2_c2', title: 'Comps Template', type: 'pdf', duration: null, size: '2.2 MB', thumbnail: null, url: 'mock://fin_m3_s2_c2', isPreview: false, description: 'Formatted comps table with auto-calculations.' },
              { id: 'fin_m3_s2_c3', title: 'Sample Comps Output', type: 'image', duration: null, size: '1.8 MB', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://fin_m3_s2_c3', isPreview: false, description: 'Annotated example of a completed comps table.' },
            ],
          },
        ],
      },
      {
        id: 'fin_m4', title: 'Case Studies', description: 'Apply your skills to real-world scenarios.', order: 4, type: 'content',
        content: [
          { id: 'fin_m4_c1', title: 'Startup Valuation Case', type: 'video', duration: '38:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80', url: 'mock://fin_m4_c1', isPreview: false, description: 'Value a fictional early-stage startup.' },
          { id: 'fin_m4_c2', title: 'Real Estate Model Case', type: 'video', duration: '42:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?w=400&q=80', url: 'mock://fin_m4_c2', isPreview: false, description: 'Build a property investment model.' },
          { id: 'fin_m4_c3', title: 'Case Study Data', type: 'pdf', duration: null, size: '3.1 MB', thumbnail: null, url: 'mock://fin_m4_c3', isPreview: false, description: 'Raw data for both case studies.' },
          { id: 'fin_m4_c4', title: 'Model Answer Files', type: 'pdf', duration: null, size: '2.9 MB', thumbnail: null, url: 'mock://fin_m4_c4', isPreview: false, description: 'Completed models for self-assessment.' },
        ],
      },
    ],
  },

  // ── COURSE 4: Leadership & Team Management ──────────────────────────────────
  {
    id: 'pkg_lead',
    matchKeywords: ['leadership', 'teammanagement'],
    title: 'Leadership & Team Management',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
    instructor: 'Neha Joshi',
    instructorImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    price: 0,
    originalPrice: null,
    rating: 4.9,
    enrolled: 7800,
    category: 'Leadership',
    description: 'Develop the mindset and skills to lead high-performing teams. Covers communication, feedback, and strategic thinking.',
    featured: false,
    totalDuration: '7h 15m',
    totalLessons: 20,
    modules: [
      {
        id: 'lead_m1', title: 'Leadership Fundamentals', description: 'What it means to be a great leader.', order: 1, type: 'content',
        content: [
          { id: 'lead_m1_c1', title: 'What Makes a Great Leader?', type: 'audio', duration: '22:15', size: null, thumbnail: null, url: 'mock://lead_m1_c1', isPreview: true, description: 'Traits and habits shared by great leaders.' },
          { id: 'lead_m1_c2', title: 'Leadership Styles Overview', type: 'video', duration: '16:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', url: 'mock://lead_m1_c2', isPreview: true, description: 'Autocratic, democratic, transformational, and servant leadership.' },
          { id: 'lead_m1_c3', title: 'Self Assessment Tool', type: 'pdf', duration: null, size: '1.1 MB', thumbnail: null, url: 'mock://lead_m1_c3', isPreview: false, description: 'Identify your natural leadership style.' },
        ],
      },
      {
        id: 'lead_m2', title: 'Building Your Team', description: 'Hire, onboard, and build strong team dynamics.', order: 2, type: 'submodules',
        submodules: [
          {
            id: 'lead_m2_s1', title: 'Hiring & Onboarding', description: 'Bring the right people in the right way.', order: 1,
            content: [
              { id: 'lead_m2_s1_c1', title: 'Hiring for Culture Fit', type: 'video', duration: '18:40', size: null, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', url: 'mock://lead_m2_s1_c1', isPreview: false, description: 'How to assess candidates beyond skills.' },
              { id: 'lead_m2_s1_c2', title: 'Onboarding Best Practices', type: 'audio', duration: '24:15', size: null, thumbnail: null, url: 'mock://lead_m2_s1_c2', isPreview: false, description: 'Set new hires up for early success.' },
              { id: 'lead_m2_s1_c3', title: 'Onboarding Checklist', type: 'pdf', duration: null, size: '0.9 MB', thumbnail: null, url: 'mock://lead_m2_s1_c3', isPreview: false, description: '30-60-90 day onboarding plan template.' },
            ],
          },
          {
            id: 'lead_m2_s2', title: 'Team Dynamics', description: 'Understand how teams form and perform.', order: 2,
            content: [
              { id: 'lead_m2_s2_c1', title: 'Tuckman\'s Team Stages', type: 'video', duration: '14:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', url: 'mock://lead_m2_s2_c1', isPreview: false, description: 'Forming, storming, norming, performing.' },
              { id: 'lead_m2_s2_c2', title: 'Building Psychological Safety', type: 'audio', duration: '20:30', size: null, thumbnail: null, url: 'mock://lead_m2_s2_c2', isPreview: false, description: 'Create an environment where people speak up.' },
              { id: 'lead_m2_s2_c3', title: 'Team Health Checklist', type: 'pdf', duration: null, size: '1.2 MB', thumbnail: null, url: 'mock://lead_m2_s2_c3', isPreview: false, description: 'Regular assessment of team health indicators.' },
            ],
          },
        ],
      },
      {
        id: 'lead_m3', title: 'Communication & Feedback', description: 'Communicate clearly and give meaningful feedback.', order: 3, type: 'submodules',
        submodules: [
          {
            id: 'lead_m3_s1', title: 'Giving Feedback', description: 'Deliver feedback that motivates change.', order: 1,
            content: [
              { id: 'lead_m3_s1_c1', title: 'The SBI Feedback Model', type: 'video', duration: '16:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', url: 'mock://lead_m3_s1_c1', isPreview: false, description: 'Situation-Behaviour-Impact framework for feedback.' },
              { id: 'lead_m3_s1_c2', title: 'Difficult Conversations', type: 'audio', duration: '28:10', size: null, thumbnail: null, url: 'mock://lead_m3_s1_c2', isPreview: false, description: 'Navigate tough conversations with confidence.' },
              { id: 'lead_m3_s1_c3', title: 'Feedback Scripts', type: 'pdf', duration: null, size: '1.4 MB', thumbnail: null, url: 'mock://lead_m3_s1_c3', isPreview: false, description: 'Word-for-word scripts for common feedback scenarios.' },
            ],
          },
          {
            id: 'lead_m3_s2', title: 'Running Effective Meetings', description: 'Make every meeting count.', order: 2,
            content: [
              { id: 'lead_m3_s2_c1', title: 'Meeting Design Principles', type: 'video', duration: '12:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', url: 'mock://lead_m3_s2_c1', isPreview: false, description: 'When to meet and how to structure it.' },
              { id: 'lead_m3_s2_c2', title: 'Facilitation Techniques', type: 'audio', duration: '18:45', size: null, thumbnail: null, url: 'mock://lead_m3_s2_c2', isPreview: false, description: 'Keep meetings focused and productive.' },
              { id: 'lead_m3_s2_c3', title: 'Meeting Templates', type: 'pdf', duration: null, size: '0.8 MB', thumbnail: null, url: 'mock://lead_m3_s2_c3', isPreview: false, description: 'Agenda templates for common meeting types.' },
            ],
          },
        ],
      },
      {
        id: 'lead_m4', title: 'Strategic Thinking', description: 'Set direction and make better decisions.', order: 4, type: 'content',
        content: [
          { id: 'lead_m4_c1', title: 'OKRs & Goal Setting', type: 'video', duration: '22:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', url: 'mock://lead_m4_c1', isPreview: false, description: 'Set objectives and key results that align teams.' },
          { id: 'lead_m4_c2', title: 'Decision Making Frameworks', type: 'audio', duration: '26:30', size: null, thumbnail: null, url: 'mock://lead_m4_c2', isPreview: false, description: 'Tools for faster, better decisions under pressure.' },
          { id: 'lead_m4_c3', title: 'Strategy Templates', type: 'pdf', duration: null, size: '2.1 MB', thumbnail: null, url: 'mock://lead_m4_c3', isPreview: false, description: 'SWOT, OKR, and strategy canvas templates.' },
          { id: 'lead_m4_c4', title: 'Case Study — Scaling Teams', type: 'video', duration: '34:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', url: 'mock://lead_m4_c4', isPreview: false, description: 'How a real startup scaled from 10 to 100 people.' },
        ],
      },
    ],
  },

  // ── COURSE 5: React Native Development ─────────────────────────────────────
  {
    id: 'pkg_rn',
    matchKeywords: ['reactnative'],
    title: 'React Native Development',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
    instructor: 'Vikram Singh',
    instructorImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
    price: 2199,
    originalPrice: 3999,
    rating: 4.7,
    enrolled: 1850,
    category: 'Technology',
    description: 'Build cross-platform iOS and Android apps using React Native and Expo. Covers navigation, state management, APIs, and publishing.',
    featured: false,
    totalDuration: '11h 50m',
    totalLessons: 28,
    modules: [
      {
        id: 'rn_m1', title: 'Environment Setup', description: 'Get your dev environment ready for React Native.', order: 1, type: 'content',
        content: [
          { id: 'rn_m1_c1', title: 'Course Overview', type: 'video', duration: '6:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m1_c1', isPreview: true, description: 'What you\'ll build and what you\'ll learn.' },
          { id: 'rn_m1_c2', title: 'Installing Node & Expo', type: 'video', duration: '14:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://rn_m1_c2', isPreview: false, description: 'Set up Node.js and the Expo CLI.' },
          { id: 'rn_m1_c3', title: 'iOS & Android Simulators', type: 'video', duration: '18:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m1_c3', isPreview: false, description: 'Run your app on simulators and real devices.' },
          { id: 'rn_m1_c4', title: 'Setup Troubleshooting Guide', type: 'pdf', duration: null, size: '2.1 MB', thumbnail: null, url: 'mock://rn_m1_c4', isPreview: false, description: 'Fix common setup issues on macOS and Windows.' },
        ],
      },
      {
        id: 'rn_m2', title: 'React Native Basics', description: 'Core components, styling, navigation, and state.', order: 2, type: 'submodules',
        submodules: [
          {
            id: 'rn_m2_s1', title: 'Core Components', description: 'View, Text, Image, and more.', order: 1,
            content: [
              { id: 'rn_m2_s1_c1', title: 'View Text & Image', type: 'video', duration: '20:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m2_s1_c1', isPreview: false, description: 'The building blocks of every React Native app.' },
              { id: 'rn_m2_s1_c2', title: 'StyleSheet API', type: 'video', duration: '16:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://rn_m2_s1_c2', isPreview: false, description: 'Styling with Flexbox in React Native.' },
              { id: 'rn_m2_s1_c3', title: 'Components Cheatsheet', type: 'pdf', duration: null, size: '1.8 MB', thumbnail: null, url: 'mock://rn_m2_s1_c3', isPreview: false, description: 'Quick reference for all core components.' },
            ],
          },
          {
            id: 'rn_m2_s2', title: 'Navigation', description: 'Stack and tab navigation with React Navigation.', order: 2,
            content: [
              { id: 'rn_m2_s2_c1', title: 'React Navigation Setup', type: 'video', duration: '22:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m2_s2_c1', isPreview: false, description: 'Install and configure React Navigation.' },
              { id: 'rn_m2_s2_c2', title: 'Stack vs Tab Navigation', type: 'video', duration: '18:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://rn_m2_s2_c2', isPreview: false, description: 'Choose the right navigator for your app.' },
              { id: 'rn_m2_s2_c3', title: 'Navigation Patterns', type: 'image', duration: null, size: '2.4 MB', thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m2_s2_c3', isPreview: false, description: 'Visual guide to common navigation patterns.' },
            ],
          },
          {
            id: 'rn_m2_s3', title: 'State Management', description: 'Manage data across your app.', order: 3,
            content: [
              { id: 'rn_m2_s3_c1', title: 'useState & useEffect', type: 'video', duration: '24:40', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m2_s3_c1', isPreview: false, description: 'Local state and side effects in React.' },
              { id: 'rn_m2_s3_c2', title: 'Context API', type: 'video', duration: '28:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://rn_m2_s3_c2', isPreview: false, description: 'Share state across components without prop drilling.' },
              { id: 'rn_m2_s3_c3', title: 'Redux Toolkit Intro', type: 'video', duration: '32:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m2_s3_c3', isPreview: false, description: 'Global state management with Redux Toolkit.' },
            ],
          },
        ],
      },
      {
        id: 'rn_m3', title: 'APIs & Data', description: 'Connect to APIs and store data locally.', order: 3, type: 'submodules',
        submodules: [
          {
            id: 'rn_m3_s1', title: 'REST APIs', description: 'Fetch and display remote data.', order: 1,
            content: [
              { id: 'rn_m3_s1_c1', title: 'Fetch & Axios', type: 'video', duration: '18:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m3_s1_c1', isPreview: false, description: 'Make HTTP requests from React Native.' },
              { id: 'rn_m3_s1_c2', title: 'Handling Loading States', type: 'video', duration: '14:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://rn_m3_s1_c2', isPreview: false, description: 'Skeletons, spinners, and error states.' },
              { id: 'rn_m3_s1_c3', title: 'API Integration Guide', type: 'pdf', duration: null, size: '1.9 MB', thumbnail: null, url: 'mock://rn_m3_s1_c3', isPreview: false, description: 'Patterns for clean API integration.' },
            ],
          },
          {
            id: 'rn_m3_s2', title: 'Local Storage', description: 'Persist data on the device.', order: 2,
            content: [
              { id: 'rn_m3_s2_c1', title: 'AsyncStorage', type: 'video', duration: '16:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m3_s2_c1', isPreview: false, description: 'Store key-value pairs locally on device.' },
              { id: 'rn_m3_s2_c2', title: 'SQLite in React Native', type: 'video', duration: '22:10', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://rn_m3_s2_c2', isPreview: false, description: 'Relational local storage with expo-sqlite.' },
            ],
          },
        ],
      },
      {
        id: 'rn_m4', title: 'Publishing Your App', description: 'Ship to the App Store and Play Store.', order: 4, type: 'content',
        content: [
          { id: 'rn_m4_c1', title: 'App Store Submission', type: 'video', duration: '28:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m4_c1', isPreview: false, description: 'Submit your app to Apple\'s App Store.' },
          { id: 'rn_m4_c2', title: 'Play Store Submission', type: 'video', duration: '26:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', url: 'mock://rn_m4_c2', isPreview: false, description: 'Publish to Google Play Store.' },
          { id: 'rn_m4_c3', title: 'Publishing Checklist', type: 'pdf', duration: null, size: '1.6 MB', thumbnail: null, url: 'mock://rn_m4_c3', isPreview: false, description: 'Everything you need before hitting publish.' },
          { id: 'rn_m4_c4', title: 'App Icon & Screenshot Guide', type: 'image', duration: null, size: '3.2 MB', thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80', url: 'mock://rn_m4_c4', isPreview: false, description: 'Spec guide for App Store and Play Store assets.' },
        ],
      },
    ],
  },

  // ── COURSE 6: Digital Marketing Essentials ──────────────────────────────────
  {
    id: 'pkg_dm',
    matchKeywords: ['digitalmarket', 'digitalmarketing'],
    title: 'Digital Marketing Essentials',
    thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80',
    instructor: 'Anjali Verma',
    instructorImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80',
    price: 999,
    originalPrice: 1999,
    rating: 4.5,
    enrolled: 4200,
    category: 'Marketing',
    description: 'Master digital marketing from SEO and content strategy to paid ads, email, and analytics.',
    featured: false,
    totalDuration: '10h 30m',
    totalLessons: 31,
    modules: [
      {
        id: 'dm_m1', title: 'Marketing Foundations', description: 'Understand the digital marketing landscape.', order: 1, type: 'content',
        content: [
          { id: 'dm_m1_c1', title: 'Digital Marketing Overview', type: 'video', duration: '10:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80', url: 'mock://dm_m1_c1', isPreview: true, description: 'The full digital marketing ecosystem at a glance.' },
          { id: 'dm_m1_c2', title: 'The Marketing Funnel', type: 'video', duration: '14:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://dm_m1_c2', isPreview: true, description: 'Awareness, consideration, and conversion explained.' },
          { id: 'dm_m1_c3', title: 'Marketing Plan Template', type: 'pdf', duration: null, size: '1.8 MB', thumbnail: null, url: 'mock://dm_m1_c3', isPreview: false, description: 'Fill-in-the-blank marketing plan worksheet.' },
        ],
      },
      {
        id: 'dm_m2', title: 'SEO & Content', description: 'Drive organic traffic with search and content.', order: 2, type: 'submodules',
        submodules: [
          {
            id: 'dm_m2_s1', title: 'Search Engine Optimisation', description: 'Rank higher on Google.', order: 1,
            content: [
              { id: 'dm_m2_s1_c1', title: 'How Google Works', type: 'video', duration: '16:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80', url: 'mock://dm_m2_s1_c1', isPreview: false, description: 'Crawling, indexing, and ranking explained.' },
              { id: 'dm_m2_s1_c2', title: 'Keyword Research', type: 'video', duration: '22:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://dm_m2_s1_c2', isPreview: false, description: 'Find keywords your audience is searching for.' },
              { id: 'dm_m2_s1_c3', title: 'On-Page SEO Checklist', type: 'pdf', duration: null, size: '1.4 MB', thumbnail: null, url: 'mock://dm_m2_s1_c3', isPreview: false, description: 'Checklist for optimising every page you publish.' },
            ],
          },
          {
            id: 'dm_m2_s2', title: 'Content Marketing', description: 'Create content that attracts and converts.', order: 2,
            content: [
              { id: 'dm_m2_s2_c1', title: 'Content Strategy', type: 'video', duration: '18:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80', url: 'mock://dm_m2_s2_c1', isPreview: false, description: 'Build a content strategy that drives results.' },
              { id: 'dm_m2_s2_c2', title: 'Blog Writing for SEO', type: 'audio', duration: '24:15', size: null, thumbnail: null, url: 'mock://dm_m2_s2_c2', isPreview: false, description: 'Write posts that rank and convert.' },
              { id: 'dm_m2_s2_c3', title: 'Content Calendar Template', type: 'pdf', duration: null, size: '1.1 MB', thumbnail: null, url: 'mock://dm_m2_s2_c3', isPreview: false, description: 'Plan and schedule content for 3 months.' },
            ],
          },
        ],
      },
      {
        id: 'dm_m3', title: 'Social Media Marketing', description: 'Grow your brand on social platforms.', order: 3, type: 'submodules',
        submodules: [
          {
            id: 'dm_m3_s1', title: 'Platform Strategy', description: 'Choose and master the right platforms.', order: 1,
            content: [
              { id: 'dm_m3_s1_c1', title: 'Choosing the Right Platforms', type: 'video', duration: '14:40', size: null, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80', url: 'mock://dm_m3_s1_c1', isPreview: false, description: 'Match platforms to your audience and goals.' },
              { id: 'dm_m3_s1_c2', title: 'Instagram & LinkedIn Strategy', type: 'video', duration: '20:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://dm_m3_s1_c2', isPreview: false, description: 'Grow organically on two key platforms.' },
              { id: 'dm_m3_s1_c3', title: 'Social Media Calendar', type: 'pdf', duration: null, size: '1.3 MB', thumbnail: null, url: 'mock://dm_m3_s1_c3', isPreview: false, description: 'Weekly posting calendar template.' },
            ],
          },
          {
            id: 'dm_m3_s2', title: 'Paid Social Ads', description: 'Run profitable paid campaigns.', order: 2,
            content: [
              { id: 'dm_m3_s2_c1', title: 'Facebook Ads Manager', type: 'video', duration: '26:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80', url: 'mock://dm_m3_s2_c1', isPreview: false, description: 'Set up and launch your first Facebook campaign.' },
              { id: 'dm_m3_s2_c2', title: 'Ad Creative Best Practices', type: 'video', duration: '18:45', size: null, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://dm_m3_s2_c2', isPreview: false, description: 'Design creatives that stop the scroll.' },
              { id: 'dm_m3_s2_c3', title: 'Ad Examples', type: 'image', duration: null, size: '2.8 MB', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://dm_m3_s2_c3', isPreview: false, description: 'Annotated high-performing ad examples.' },
            ],
          },
        ],
      },
      {
        id: 'dm_m4', title: 'Email Marketing', description: 'Build and monetise your email list.', order: 4, type: 'content',
        content: [
          { id: 'dm_m4_c1', title: 'Building Your Email List', type: 'video', duration: '16:20', size: null, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80', url: 'mock://dm_m4_c1', isPreview: false, description: 'Lead magnets, landing pages, and opt-in forms.' },
          { id: 'dm_m4_c2', title: 'Writing Campaigns That Convert', type: 'audio', duration: '22:10', size: null, thumbnail: null, url: 'mock://dm_m4_c2', isPreview: false, description: 'Copywriting principles for email marketing.' },
          { id: 'dm_m4_c3', title: 'Email Templates', type: 'pdf', duration: null, size: '1.9 MB', thumbnail: null, url: 'mock://dm_m4_c3', isPreview: false, description: 'Plug-and-play email templates for 6 scenarios.' },
          { id: 'dm_m4_c4', title: 'A/B Testing Guide', type: 'pdf', duration: null, size: '1.2 MB', thumbnail: null, url: 'mock://dm_m4_c4', isPreview: false, description: 'How to run and read A/B tests on email.' },
        ],
      },
      {
        id: 'dm_m5', title: 'Analytics & Reporting', description: 'Measure what matters and improve continuously.', order: 5, type: 'submodules',
        submodules: [
          {
            id: 'dm_m5_s1', title: 'Google Analytics', description: 'Set up GA4 and read your data.', order: 1,
            content: [
              { id: 'dm_m5_s1_c1', title: 'GA4 Setup & Dashboard', type: 'video', duration: '20:30', size: null, thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80', url: 'mock://dm_m5_s1_c1', isPreview: false, description: 'Install GA4 and configure your first dashboard.' },
              { id: 'dm_m5_s1_c2', title: 'Reading Your Data', type: 'video', duration: '18:15', size: null, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://dm_m5_s1_c2', isPreview: false, description: 'Understand traffic, conversions, and attribution.' },
              { id: 'dm_m5_s1_c3', title: 'Analytics Report Template', type: 'pdf', duration: null, size: '1.6 MB', thumbnail: null, url: 'mock://dm_m5_s1_c3', isPreview: false, description: 'Monthly analytics report template.' },
            ],
          },
          {
            id: 'dm_m5_s2', title: 'Campaign Reporting', description: 'Report on campaign performance clearly.', order: 2,
            content: [
              { id: 'dm_m5_s2_c1', title: 'KPIs That Matter', type: 'audio', duration: '16:40', size: null, thumbnail: null, url: 'mock://dm_m5_s2_c1', isPreview: false, description: 'Focus on the metrics that drive decisions.' },
              { id: 'dm_m5_s2_c2', title: 'Monthly Report Template', type: 'pdf', duration: null, size: '1.4 MB', thumbnail: null, url: 'mock://dm_m5_s2_c2', isPreview: false, description: 'Executive-ready monthly report structure.' },
              { id: 'dm_m5_s2_c3', title: 'Sample Report', type: 'image', duration: null, size: '2.2 MB', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', url: 'mock://dm_m5_s2_c3', isPreview: false, description: 'Annotated example of a completed monthly report.' },
            ],
          },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export const courses = [
  {
    id: 1,
    title: 'Python for Data Science',
    category: 'Technology',
    instructor: 'Arjun Mehta',
    instructorImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    price: 1299,
    originalPrice: 2499,
    ccavenuePrice: 1099,
    rating: 4.8,
    enrolled: 3420,
    duration: '18h',
    lessons: 64,
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80',
    featured: true,
    description:
      'Master Python for data analysis, visualization, and machine learning. Covers pandas, NumPy, Matplotlib, and scikit-learn with hands-on projects.',
    curriculum: [
      { id: 'l1', title: 'Python Basics & Environment Setup', duration: '45m', type: 'video' },
      { id: 'l2', title: 'Data Structures & Control Flow', duration: '1h 10m', type: 'video' },
      { id: 'l3', title: 'NumPy & Pandas Fundamentals', duration: '2h 15m', type: 'pdf', readTime: '~15 min read', pages: 28 },
      { id: 'l4', title: 'Data Visualization with Matplotlib', duration: '1h 30m', type: 'image' },
      { id: 'l5', title: 'Intro to Machine Learning', duration: '2h 45m', type: 'audio' },
      { id: 'l6', title: 'Final Capstone Project', duration: '3h', type: 'video' },
      { id: 'l7', title: 'Advanced Scikit-learn & Model Tuning', duration: '2h', type: 'video' },
      { id: 'l8', title: 'Deep Learning with TensorFlow Basics', duration: '2h 30m', type: 'pdf', readTime: '~20 min read', pages: 36 },
    ],
  },
  {
    id: 2,
    title: 'UI/UX Design Masterclass',
    category: 'Design',
    instructor: 'Priya Sharma',
    instructorImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    price: 0,
    rating: 4.7,
    enrolled: 5890,
    duration: '12h',
    lessons: 48,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
    description:
      'Learn the full design process from research to high-fidelity prototyping using Figma. Build a portfolio-ready case study.',
    curriculum: [
      { id: 'l1', title: 'Design Thinking & Research', duration: '1h 20m', type: 'video' },
      { id: 'l2', title: 'Wireframing & Information Architecture', duration: '1h 45m', type: 'pdf', readTime: '~12 min read', pages: 22 },
      { id: 'l3', title: 'Visual Design Principles', duration: '2h', type: 'image' },
      { id: 'l4', title: 'Prototyping in Figma', duration: '2h 30m', type: 'video' },
      { id: 'l5', title: 'Usability Testing', duration: '1h', type: 'audio' },
      { id: 'l6', title: 'Portfolio Case Study', duration: '3h', type: 'video' },
      { id: 'l7', title: 'Accessibility & Inclusive Design', duration: '1h', type: 'pdf', readTime: '~10 min read', pages: 18 },
      { id: 'l8', title: 'Design System Creation', duration: '2h 30m', type: 'image' },
    ],
  },
  {
    id: 3,
    title: 'Financial Modeling Fundamentals',
    category: 'Business',
    instructor: 'Rahul Kapoor',
    instructorImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80',
    price: 1799,
    originalPrice: 3499,
    ccavenuePrice: 1499,
    rating: 4.6,
    enrolled: 2100,
    duration: '22h',
    lessons: 72,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    description:
      'Build professional-grade financial models in Excel. Covers DCF analysis, LBO modeling, sensitivity analysis, and valuation techniques.',
    curriculum: [
      { id: 'l1', title: 'Excel for Finance', duration: '2h', type: 'video' },
      { id: 'l2', title: 'Income Statement Modeling', duration: '3h', type: 'video' },
      { id: 'l3', title: 'Balance Sheet & Cash Flow', duration: '3h 30m', type: 'pdf', readTime: '~22 min read', pages: 40 },
      { id: 'l4', title: 'DCF Valuation', duration: '4h', type: 'video' },
      { id: 'l5', title: 'LBO Modeling', duration: '4h', type: 'audio' },
      { id: 'l6', title: 'Sensitivity & Scenario Analysis', duration: '2h', type: 'image' },
      { id: 'l7', title: 'Merger Model Basics', duration: '3h', type: 'video' },
      { id: 'l8', title: 'Presenting to Stakeholders', duration: '1h 30m', type: 'pdf', readTime: '~8 min read', pages: 14 },
    ],
  },
  {
    id: 4,
    title: 'Leadership & Team Management',
    category: 'Leadership',
    instructor: 'Neha Joshi',
    instructorImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    price: 0,
    rating: 4.9,
    enrolled: 7800,
    duration: '8h',
    lessons: 32,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
    description:
      'Develop the mindset and skills to lead high-performing teams. Covers communication, conflict resolution, delegation, and building team culture.',
    curriculum: [
      { id: 'l1', title: 'Leadership Styles & Self-Awareness', duration: '1h', type: 'video' },
      { id: 'l2', title: 'Effective Communication', duration: '1h 30m', type: 'audio' },
      { id: 'l3', title: 'Delegation & Accountability', duration: '1h 15m', type: 'video' },
      { id: 'l4', title: 'Conflict Resolution', duration: '1h 30m', type: 'pdf', readTime: '~9 min read', pages: 16 },
      { id: 'l5', title: 'Building Team Culture', duration: '1h', type: 'image' },
      { id: 'l6', title: 'Leading Through Change', duration: '1h', type: 'audio' },
      { id: 'l7', title: 'Coaching & Mentoring', duration: '1h', type: 'video' },
      { id: 'l8', title: 'Capstone: Leadership Action Plan', duration: '45m', type: 'pdf', readTime: '~6 min read', pages: 10 },
    ],
  },
  {
    id: 5,
    title: 'React Native Development',
    category: 'Technology',
    instructor: 'Vikram Singh',
    instructorImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
    price: 2199,
    originalPrice: 3999,
    ccavenuePrice: 1899,
    rating: 4.7,
    enrolled: 1850,
    duration: '28h',
    lessons: 96,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
    description:
      'Build cross-platform iOS and Android apps using React Native and Expo. Covers navigation, state management, APIs, and deploying to app stores.',
    curriculum: [
      { id: 'l1', title: 'React Native & Expo Setup', duration: '1h', type: 'video' },
      { id: 'l2', title: 'Core Components & Styling', duration: '2h 30m', type: 'video' },
      { id: 'l3', title: 'Navigation with React Navigation', duration: '3h', type: 'video' },
      { id: 'l4', title: 'State Management & Context', duration: '3h', type: 'pdf', readTime: '~18 min read', pages: 32 },
      { id: 'l5', title: 'APIs, Async & Networking', duration: '3h 30m', type: 'video' },
      { id: 'l6', title: 'Publishing to App Stores', duration: '2h', type: 'image' },
      { id: 'l7', title: 'Testing & Debugging', duration: '2h', type: 'audio' },
      { id: 'l8', title: 'Performance & Optimization', duration: '2h 30m', type: 'video' },
    ],
  },
  {
    id: 6,
    title: 'Digital Marketing Essentials',
    category: 'Marketing',
    instructor: 'Anjali Verma',
    instructorImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80',
    price: 999,
    originalPrice: 1999,
    ccavenuePrice: 849,
    rating: 4.5,
    enrolled: 4200,
    duration: '15h',
    lessons: 55,
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&q=80',
    description:
      'Master digital marketing from SEO and content marketing to paid ads and analytics. Learn to build campaigns that drive real business results.',
    curriculum: [
      { id: 'l1', title: 'Digital Marketing Overview', duration: '45m', type: 'video' },
      { id: 'l2', title: 'SEO & Content Strategy', duration: '3h', type: 'pdf', readTime: '~20 min read', pages: 38 },
      { id: 'l3', title: 'Social Media Marketing', duration: '2h 30m', type: 'image' },
      { id: 'l4', title: 'Google & Meta Ads', duration: '3h', type: 'video' },
      { id: 'l5', title: 'Email Marketing & Automation', duration: '2h', type: 'audio' },
      { id: 'l6', title: 'Analytics & Reporting', duration: '2h', type: 'video' },
      { id: 'l7', title: 'Influencer & Affiliate Marketing', duration: '1h 30m', type: 'image' },
      { id: 'l8', title: 'Growth Hacking Techniques', duration: '2h', type: 'video' },
    ],
  },
];
