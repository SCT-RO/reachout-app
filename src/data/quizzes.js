// Quiz data: 4 MCQ questions per course, correctAnswer is the 0-based index
export const quizzes = {
  1: {
    courseId: 1,
    title: 'Python for Data Science Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which Python library is primarily used for numerical computations and array operations?',
        options: ['Matplotlib', 'NumPy', 'Seaborn', 'Requests'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'In pandas, what does the `.dropna()` method do?',
        options: [
          'Drops rows with zero values',
          'Removes duplicate rows',
          'Removes rows or columns with missing values',
          'Converts NaN to 0',
        ],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'Which scikit-learn class is used to split a dataset into training and test sets?',
        options: ['DataSplitter', 'TrainTestSplit', 'train_test_split', 'ModelSelector'],
        correctAnswer: 2,
      },
      {
        id: 'q4',
        question: 'What does a confusion matrix primarily help evaluate?',
        options: [
          'The speed of a model',
          'The performance of a classification model',
          'The number of features in the dataset',
          'Data preprocessing quality',
        ],
        correctAnswer: 1,
      },
    ],
  },
  2: {
    courseId: 2,
    title: 'UI/UX Design Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What is the primary purpose of a skeleton loader in UI design?',
        options: [
          'To make the app size smaller',
          'To provide visual feedback while content is loading',
          'To add complex animations to the screen',
          'To replace error messages',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'Which UX research method involves observing users perform tasks in their natural environment?',
        options: ['A/B Testing', 'Card Sorting', 'Contextual Inquiry', 'Heuristic Evaluation'],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'In Figma, what is an "Auto Layout" frame best used for?',
        options: [
          'Animating transitions between screens',
          'Creating responsive components that adapt to content size',
          'Exporting assets in multiple formats',
          'Connecting pages with overlays',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        question: "Which of these is NOT one of Nielsen's 10 usability heuristics?",
        options: [
          'Error prevention',
          'Aesthetic and minimalist design',
          'Maximum feature density',
          'Flexibility and efficiency of use',
        ],
        correctAnswer: 2,
      },
    ],
  },
  3: {
    courseId: 3,
    title: 'Financial Modeling Quiz',
    questions: [
      {
        id: 'q1',
        question: 'DCF stands for:',
        options: [
          'Direct Cost Financing',
          'Discounted Cash Flow',
          'Debt Coverage Factor',
          'Dynamic Capital Framework',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'EBITDA is a measure of a company\'s:',
        options: [
          'Total debt obligations',
          'Net profit after tax',
          'Operating performance before non-cash and financing items',
          'Market capitalization',
        ],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'In a sensitivity analysis, what are you testing?',
        options: [
          'How fast a model runs',
          'How changes in key assumptions affect the output',
          'The accuracy of historical data',
          'Whether the model uses correct formulas',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        question: 'Which Excel function is most commonly used to look up values across a financial model?',
        options: ['SUMIF', 'COUNTIF', 'VLOOKUP / INDEX-MATCH', 'IF'],
        correctAnswer: 2,
      },
    ],
  },
  4: {
    courseId: 4,
    title: 'Leadership & Management Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which leadership style gives team members the most autonomy?',
        options: ['Autocratic', 'Transactional', 'Laissez-faire', 'Bureaucratic'],
        correctAnswer: 2,
      },
      {
        id: 'q2',
        question: 'Active listening primarily involves:',
        options: [
          'Speaking more than the other person',
          'Waiting for your turn to talk',
          'Fully concentrating and understanding the speaker\'s message',
          'Taking notes during every conversation',
        ],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'Psychological safety in a team means:',
        options: [
          'Everyone always agrees with the manager',
          'Team members feel safe to speak up, take risks, and make mistakes',
          'The team never faces challenges',
          'Conflicts are avoided at all costs',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q4',
        question: 'The SMART goal framework stands for:',
        options: [
          'Simple, Measurable, Achievable, Relevant, Time-bound',
          'Specific, Measurable, Achievable, Relevant, Time-bound',
          'Specific, Managed, Actionable, Real, Timed',
          'Strong, Meaningful, Ambitious, Realistic, Tracked',
        ],
        correctAnswer: 1,
      },
    ],
  },
  5: {
    courseId: 5,
    title: 'React Native Development Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which component in React Native is the equivalent of a <div> in web development?',
        options: ['<Block>', '<Container>', '<View>', '<Section>'],
        correctAnswer: 2,
      },
      {
        id: 'q2',
        question: 'What is Expo primarily used for in React Native development?',
        options: [
          'State management',
          'Simplifying setup and access to native APIs',
          'Replacing JavaScript with TypeScript',
          'Server-side rendering',
        ],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        question: 'React Navigation\'s Stack Navigator mimics:',
        options: [
          'Tab-based navigation patterns',
          'A drawer menu on the side',
          'Screen stacking with push/pop behavior like a native app',
          'URL-based routing like a browser',
        ],
        correctAnswer: 2,
      },
      {
        id: 'q4',
        question: 'Which hook is best suited for fetching data when a screen mounts?',
        options: ['useMemo', 'useCallback', 'useEffect', 'useReducer'],
        correctAnswer: 2,
      },
    ],
  },
  6: {
    courseId: 6,
    title: 'Digital Marketing Quiz',
    questions: [
      {
        id: 'q1',
        question: 'What does CTR stand for in digital marketing?',
        options: ['Content Transfer Rate', 'Click-Through Rate', 'Customer Tracking Report', 'Conversion Trend Rate'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'Which type of SEO focuses on factors outside your own website?',
        options: ['On-page SEO', 'Technical SEO', 'Off-page SEO', 'Local SEO'],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'In email marketing, what is a good average open rate benchmark?',
        options: ['Less than 5%', '10–15%', '20–25%', 'Over 60%'],
        correctAnswer: 2,
      },
      {
        id: 'q4',
        question: 'A/B testing in digital marketing involves:',
        options: [
          'Testing two different products simultaneously',
          'Comparing two versions of a campaign element to see which performs better',
          'Running ads on two separate platforms',
          'Splitting your budget between organic and paid channels',
        ],
        correctAnswer: 1,
      },
    ],
  },
};
