// ─── Legacy course-level quizzes (used by QuizScreen) ─────────────────────────
export const quizzes = {
  1: {
    courseId: 1,
    title: 'Python for Data Science Quiz',
    questions: [
      { id: 'q1', question: 'Which Python library is primarily used for numerical computations and array operations?', options: ['Matplotlib', 'NumPy', 'Seaborn', 'Requests'], correctAnswer: 1 },
      { id: 'q2', question: 'In pandas, what does the `.dropna()` method do?', options: ['Drops rows with zero values', 'Removes duplicate rows', 'Removes rows or columns with missing values', 'Converts NaN to 0'], correctAnswer: 2 },
      { id: 'q3', question: 'Which scikit-learn class is used to split a dataset into training and test sets?', options: ['DataSplitter', 'TrainTestSplit', 'train_test_split', 'ModelSelector'], correctAnswer: 2 },
      { id: 'q4', question: 'What does a confusion matrix primarily help evaluate?', options: ['The speed of a model', 'The performance of a classification model', 'The number of features in the dataset', 'Data preprocessing quality'], correctAnswer: 1 },
    ],
  },
  2: {
    courseId: 2,
    title: 'UI/UX Design Quiz',
    questions: [
      { id: 'q1', question: 'What is the primary purpose of a skeleton loader in UI design?', options: ['To make the app size smaller', 'To provide visual feedback while content is loading', 'To add complex animations to the screen', 'To replace error messages'], correctAnswer: 1 },
      { id: 'q2', question: 'Which UX research method involves observing users perform tasks in their natural environment?', options: ['A/B Testing', 'Card Sorting', 'Contextual Inquiry', 'Heuristic Evaluation'], correctAnswer: 2 },
      { id: 'q3', question: 'In Figma, what is an "Auto Layout" frame best used for?', options: ['Animating transitions between screens', 'Creating responsive components that adapt to content size', 'Exporting assets in multiple formats', 'Connecting pages with overlays'], correctAnswer: 1 },
      { id: 'q4', question: "Which of these is NOT one of Nielsen's 10 usability heuristics?", options: ['Error prevention', 'Aesthetic and minimalist design', 'Maximum feature density', 'Flexibility and efficiency of use'], correctAnswer: 2 },
    ],
  },
  3: {
    courseId: 3,
    title: 'Financial Modeling Quiz',
    questions: [
      { id: 'q1', question: 'DCF stands for:', options: ['Direct Cost Financing', 'Discounted Cash Flow', 'Debt Coverage Factor', 'Dynamic Capital Framework'], correctAnswer: 1 },
      { id: 'q2', question: "EBITDA is a measure of a company's:", options: ['Total debt obligations', 'Net profit after tax', 'Operating performance before non-cash and financing items', 'Market capitalization'], correctAnswer: 2 },
      { id: 'q3', question: 'In a sensitivity analysis, what are you testing?', options: ['How fast a model runs', 'How changes in key assumptions affect the output', 'The accuracy of historical data', 'Whether the model uses correct formulas'], correctAnswer: 1 },
      { id: 'q4', question: 'Which Excel function is most commonly used to look up values across a financial model?', options: ['SUMIF', 'COUNTIF', 'VLOOKUP / INDEX-MATCH', 'IF'], correctAnswer: 2 },
    ],
  },
  4: {
    courseId: 4,
    title: 'Leadership & Management Quiz',
    questions: [
      { id: 'q1', question: 'Which leadership style gives team members the most autonomy?', options: ['Autocratic', 'Transactional', 'Laissez-faire', 'Bureaucratic'], correctAnswer: 2 },
      { id: 'q2', question: 'Active listening primarily involves:', options: ['Speaking more than the other person', 'Waiting for your turn to talk', "Fully concentrating and understanding the speaker's message", 'Taking notes during every conversation'], correctAnswer: 2 },
      { id: 'q3', question: 'Psychological safety in a team means:', options: ['Everyone always agrees with the manager', 'Team members feel safe to speak up, take risks, and make mistakes', 'The team never faces challenges', 'Conflicts are avoided at all costs'], correctAnswer: 1 },
      { id: 'q4', question: 'The SMART goal framework stands for:', options: ['Simple, Measurable, Achievable, Relevant, Time-bound', 'Specific, Measurable, Achievable, Relevant, Time-bound', 'Specific, Managed, Actionable, Real, Timed', 'Strong, Meaningful, Ambitious, Realistic, Tracked'], correctAnswer: 1 },
    ],
  },
  5: {
    courseId: 5,
    title: 'React Native Development Quiz',
    questions: [
      { id: 'q1', question: 'Which component in React Native is the equivalent of a <div> in web development?', options: ['<Block>', '<Container>', '<View>', '<Section>'], correctAnswer: 2 },
      { id: 'q2', question: 'What is Expo primarily used for in React Native development?', options: ['State management', 'Simplifying setup and access to native APIs', 'Replacing JavaScript with TypeScript', 'Server-side rendering'], correctAnswer: 1 },
      { id: 'q3', question: "React Navigation's Stack Navigator mimics:", options: ['Tab-based navigation patterns', 'A drawer menu on the side', 'Screen stacking with push/pop behavior like a native app', 'URL-based routing like a browser'], correctAnswer: 2 },
      { id: 'q4', question: 'Which hook is best suited for fetching data when a screen mounts?', options: ['useMemo', 'useCallback', 'useEffect', 'useReducer'], correctAnswer: 2 },
    ],
  },
  6: {
    courseId: 6,
    title: 'Digital Marketing Quiz',
    questions: [
      { id: 'q1', question: 'What does CTR stand for in digital marketing?', options: ['Content Transfer Rate', 'Click-Through Rate', 'Customer Tracking Report', 'Conversion Trend Rate'], correctAnswer: 1 },
      { id: 'q2', question: 'Which type of SEO focuses on factors outside your own website?', options: ['On-page SEO', 'Technical SEO', 'Off-page SEO', 'Local SEO'], correctAnswer: 2 },
      { id: 'q3', question: 'In email marketing, what is a good average open rate benchmark?', options: ['Less than 5%', '10–15%', '20–25%', 'Over 60%'], correctAnswer: 2 },
      { id: 'q4', question: 'A/B testing in digital marketing involves:', options: ['Testing two different products simultaneously', 'Comparing two versions of a campaign element to see which performs better', 'Running ads on two separate platforms', 'Splitting your budget between organic and paid channels'], correctAnswer: 1 },
    ],
  },
};

// ─── Module-level quizzes for the package hierarchy ───────────────────────────

export const moduleQuizzes = [
  // ── pkg_py — Python for Data Science ──────────────────────────────────────
  {
    courseId: 'pkg_py', moduleId: 'py_m1', title: 'Getting Started Quiz',
    questions: [
      { id: 'py_m1_q1', question: 'Which tool is commonly used to run Python interactively in a browser?', options: ['PyCharm', 'Jupyter Notebook', 'VS Code Terminal', 'IDLE'], correctAnswer: 1, explanation: 'Jupyter Notebook lets you run Python code in interactive cells inside a web browser, making it ideal for data science.' },
      { id: 'py_m1_q2', question: 'What does Anaconda provide beyond just Python?', options: ['Only Python 3', 'A suite of pre-installed data science packages and conda package manager', 'A cloud IDE', 'A compiled Python runner'], correctAnswer: 1, explanation: 'Anaconda bundles Python with 250+ pre-installed packages like NumPy and pandas, plus the conda package manager.' },
      { id: 'py_m1_q3', question: 'Which command runs a Python script from the terminal?', options: ['run script.py', 'python script.py', 'execute script.py', 'start script.py'], correctAnswer: 1, explanation: 'The "python script.py" command invokes the Python interpreter on the given file.' },
      { id: 'py_m1_q4', question: 'What file extension do Python source files use?', options: ['.py', '.pt', '.pn', '.pyx'], correctAnswer: 0, explanation: 'Python source files use the .py extension by convention.' },
      { id: 'py_m1_q5', question: 'In Jupyter Notebook, which keyboard shortcut runs the current cell?', options: ['Ctrl+Enter', 'Alt+R', 'Shift+Tab', 'Ctrl+P'], correctAnswer: 0, explanation: 'Ctrl+Enter (or Shift+Enter to advance to next cell) runs the currently selected Jupyter cell.' },
    ],
  },
  {
    courseId: 'pkg_py', moduleId: 'py_m2', title: 'Python Fundamentals Quiz',
    questions: [
      { id: 'py_m2_q1', question: 'Which of the following is the correct way to define a function in Python?', options: ['function greet():', 'def greet():', 'func greet():', 'define greet():'], correctAnswer: 1, explanation: 'Python uses the "def" keyword to define functions.' },
      { id: 'py_m2_q2', question: 'What is the output of: print(type(3.14))?', options: ["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'double'>"], correctAnswer: 2, explanation: '3.14 is a floating point number, so its type is float.' },
      { id: 'py_m2_q3', question: 'Which loop is used when you know exactly how many times to iterate?', options: ['while loop', 'do-while loop', 'for loop', 'repeat loop'], correctAnswer: 2, explanation: 'A for loop iterates over a sequence or a range, making it ideal when the count is known.' },
      { id: 'py_m2_q4', question: 'What does the "break" statement do inside a loop?', options: ['Skips the current iteration', 'Exits the loop entirely', 'Restarts the loop', 'Pauses the loop'], correctAnswer: 1, explanation: '"break" immediately terminates the enclosing loop and resumes execution after it.' },
      { id: 'py_m2_q5', question: 'Which keyword is used to return a value from a function?', options: ['send', 'output', 'return', 'yield'], correctAnswer: 2, explanation: 'The "return" statement exits a function and optionally passes a value back to the caller.' },
    ],
  },
  {
    courseId: 'pkg_py', moduleId: 'py_m3', title: 'Data Analysis with Pandas Quiz',
    questions: [
      { id: 'py_m3_q1', question: 'Which Pandas function reads a CSV file into a DataFrame?', options: ['pd.load_csv()', 'pd.read_csv()', 'pd.open_csv()', 'pd.import_csv()'], correctAnswer: 1, explanation: 'pd.read_csv() is the standard Pandas function to load CSV data into a DataFrame.' },
      { id: 'py_m3_q2', question: 'Which method shows the first 5 rows of a DataFrame?', options: ['.top()', '.first()', '.head()', '.start()'], correctAnswer: 2, explanation: 'DataFrame.head() returns the first 5 rows by default, useful for quick inspection.' },
      { id: 'py_m3_q3', question: 'How do you drop rows with missing values in Pandas?', options: ['df.remove_na()', 'df.dropna()', 'df.fillna()', 'df.strip_na()'], correctAnswer: 1, explanation: 'df.dropna() removes rows (or columns) containing NaN values.' },
      { id: 'py_m3_q4', question: 'Which attribute gives you the column names of a DataFrame?', options: ['df.keys', 'df.index', 'df.columns', 'df.labels'], correctAnswer: 2, explanation: 'df.columns returns an Index object containing all column names.' },
      { id: 'py_m3_q5', question: 'What does df.groupby("category").mean() do?', options: ['Filters rows where category equals "mean"', 'Groups rows by the category column and computes the mean of each group', 'Sorts the DataFrame by category', 'Renames the column to "mean"'], correctAnswer: 1, explanation: 'groupby() splits the DataFrame by unique values in the specified column, and mean() computes the average for each group.' },
    ],
  },
  {
    courseId: 'pkg_py', moduleId: 'py_m4', title: 'Data Visualization Quiz',
    questions: [
      { id: 'py_m4_q1', question: 'Which Matplotlib function creates a line chart?', options: ['plt.bar()', 'plt.scatter()', 'plt.plot()', 'plt.hist()'], correctAnswer: 2, explanation: 'plt.plot() draws a line chart connecting the given data points.' },
      { id: 'py_m4_q2', question: 'What is the purpose of plt.show() in Matplotlib?', options: ['Saves the figure to disk', 'Displays the figure in the output', 'Clears the current figure', 'Sets figure size'], correctAnswer: 1, explanation: 'plt.show() renders and displays all currently open figures.' },
      { id: 'py_m4_q3', question: 'Which Seaborn function creates a heatmap?', options: ['sns.heatmap()', 'sns.map()', 'sns.grid()', 'sns.correlation()'], correctAnswer: 0, explanation: 'sns.heatmap() visualises a matrix of values as a colour-encoded grid.' },
      { id: 'py_m4_q4', question: 'What chart type is best for showing the distribution of a single variable?', options: ['Pie chart', 'Histogram', 'Scatter plot', 'Bar chart'], correctAnswer: 1, explanation: 'A histogram bins continuous data and shows the frequency of each bin, revealing the distribution shape.' },
      { id: 'py_m4_q5', question: 'Which parameter controls the transparency of a Matplotlib plot element?', options: ['transparency', 'opacity', 'alpha', 'blend'], correctAnswer: 2, explanation: 'The "alpha" parameter (0-1) controls opacity of matplotlib elements.' },
    ],
  },
  {
    courseId: 'pkg_py', moduleId: 'py_m5', title: 'Machine Learning Intro Quiz',
    questions: [
      { id: 'py_m5_q1', question: 'In supervised learning, what does the training data include?', options: ['Only input features', 'Input features and corresponding labels', 'Only labels', 'Unlabelled feature vectors'], correctAnswer: 1, explanation: 'Supervised learning trains on labelled examples — each input has a known correct output (label).' },
      { id: 'py_m5_q2', question: 'Which scikit-learn method splits data into training and test sets?', options: ['train_test_split()', 'split_data()', 'model_split()', 'partition()'], correctAnswer: 0, explanation: 'sklearn.model_selection.train_test_split() randomly splits arrays or matrices into train and test subsets.' },
      { id: 'py_m5_q3', question: 'What does the confusion matrix measure?', options: ['Model training speed', 'Count of correct and incorrect predictions by class', 'Feature importance scores', 'Loss curve values'], correctAnswer: 1, explanation: 'A confusion matrix shows TP, FP, TN, FN counts, giving a detailed breakdown of classification errors.' },
      { id: 'py_m5_q4', question: 'Which metric is best for imbalanced classification datasets?', options: ['Accuracy', 'F1-Score', 'Mean Squared Error', 'R-Squared'], correctAnswer: 1, explanation: 'F1-Score balances precision and recall, making it robust when class distribution is skewed.' },
      { id: 'py_m5_q5', question: 'What is overfitting in machine learning?', options: ['Model performs poorly on training data', 'Model memorises training data but generalises poorly to new data', 'Model has too few parameters', 'Model trains too slowly'], correctAnswer: 1, explanation: 'Overfitting occurs when a model learns the noise in training data and fails to generalise to unseen examples.' },
    ],
  },

  // ── pkg_uiux — UI/UX Design Masterclass ───────────────────────────────────
  {
    courseId: 'pkg_uiux', moduleId: 'ux_m1', title: 'Design Foundations Quiz',
    questions: [
      { id: 'ux_m1_q1', question: 'What is the primary focus of UX design?', options: ['Visual aesthetics', 'User emotions and overall experience', 'Code architecture', 'Brand colour palettes'], correctAnswer: 1, explanation: 'UX (User Experience) design focuses on the overall feel, including usability, accessibility, and user emotions.' },
      { id: 'ux_m1_q2', question: 'Which of these is the first stage of the Design Thinking process?', options: ['Prototype', 'Test', 'Empathise', 'Define'], correctAnswer: 2, explanation: 'Design Thinking begins with Empathise — understanding users through research and observation.' },
      { id: 'ux_m1_q3', question: 'UI design primarily deals with:', options: ['Server infrastructure', 'Database schemas', 'Visual elements users interact with', 'SEO optimisation'], correctAnswer: 2, explanation: 'UI (User Interface) design covers the visual layer: buttons, typography, colour, layout.' },
      { id: 'ux_m1_q4', question: 'The Gestalt principle of "proximity" states that:', options: ['Similar colours are grouped', 'Objects close together are perceived as related', 'Symmetrical objects look stable', 'Familiar shapes are recognised faster'], correctAnswer: 1, explanation: 'Proximity: elements placed near each other are perceived as belonging to the same group.' },
      { id: 'ux_m1_q5', question: 'What is a style guide in design?', options: ['A list of bugs to fix', 'A document defining visual standards (colours, fonts, spacing)', 'A user interview script', 'A test plan'], correctAnswer: 1, explanation: 'A style guide documents the visual language — colours, typography, component states — ensuring consistency.' },
    ],
  },
  {
    courseId: 'pkg_uiux', moduleId: 'ux_m2', title: 'Research & Discovery Quiz',
    questions: [
      { id: 'ux_m2_q1', question: 'What is the main goal of user interviews?', options: ['To sell the product', 'To understand user needs, behaviours, and pain points', 'To test prototypes', 'To count page views'], correctAnswer: 1, explanation: 'User interviews are qualitative research sessions aimed at understanding the user\'s world, motivations, and problems.' },
      { id: 'ux_m2_q2', question: 'Which survey question type gives the most qualitative insight?', options: ['Multiple choice', 'Rating scale', 'Open-ended question', 'Yes/No question'], correctAnswer: 2, explanation: 'Open-ended questions allow respondents to express their thoughts freely, yielding richer qualitative data.' },
      { id: 'ux_m2_q3', question: 'Competitive analysis helps designers:', options: ['Write backend code', 'Understand market alternatives and identify UX gaps', 'Choose programming languages', 'Create marketing slogans'], correctAnswer: 1, explanation: 'Competitive analysis benchmarks your product against alternatives to identify opportunities and avoid known pitfalls.' },
      { id: 'ux_m2_q4', question: 'What is an affinity diagram used for?', options: ['Drawing wireframes', 'Organising research insights into themes', 'Tracking project deadlines', 'Storing design assets'], correctAnswer: 1, explanation: 'Affinity diagrams cluster qualitative data (e.g., interview notes) into patterns and themes.' },
      { id: 'ux_m2_q5', question: 'A persona in UX is:', options: ['A real user who tests the product', 'A fictional but research-based representation of a user type', 'A competitor profile', 'A design pattern'], correctAnswer: 1, explanation: 'Personas are fictional characters built from real research data to represent different user types and guide design decisions.' },
    ],
  },
  {
    courseId: 'pkg_uiux', moduleId: 'ux_m3', title: 'Wireframing & Prototyping Quiz',
    questions: [
      { id: 'ux_m3_q1', question: 'What is the purpose of a low-fidelity wireframe?', options: ['To show final visual design', 'To quickly explore layout and structure without detail', 'To present to investors', 'To write functional code'], correctAnswer: 1, explanation: 'Low-fi wireframes are rough sketches that communicate structure and content hierarchy without visual polish.' },
      { id: 'ux_m3_q2', question: 'Figma is primarily used for:', options: ['Database management', 'UI/UX design and prototyping', 'Backend API development', 'Video editing'], correctAnswer: 1, explanation: 'Figma is a cloud-based design tool for creating UI designs, wireframes, and interactive prototypes.' },
      { id: 'ux_m3_q3', question: 'What distinguishes a high-fidelity prototype from a wireframe?', options: ['HiFi prototypes have clickable interactions and realistic visuals', 'Wireframes have more colour', 'HiFi means printed on paper', 'There is no difference'], correctAnswer: 0, explanation: 'High-fidelity prototypes closely mimic the final product with real visual design and interactive flows.' },
      { id: 'ux_m3_q4', question: 'In Figma, what are "components"?', options: ['JavaScript functions', 'Reusable UI elements that can be instanced throughout a design', 'Database tables', 'User test scripts'], correctAnswer: 1, explanation: 'Figma Components are master UI elements; updating the master automatically updates all instances.' },
      { id: 'ux_m3_q5', question: 'Why is iterative prototyping valuable?', options: ['It avoids the need for user research', 'It allows testing and refining ideas before costly development', 'It replaces the need for a style guide', 'It speeds up coding'], correctAnswer: 1, explanation: 'Iterating on prototypes surfaces usability issues early when changes are cheap and fast to implement.' },
    ],
  },
  {
    courseId: 'pkg_uiux', moduleId: 'ux_m4', title: 'Visual Design Quiz',
    questions: [
      { id: 'ux_m4_q1', question: 'What does the "60-30-10" colour rule suggest?', options: ['Use 60% accent, 30% neutral, 10% background', 'Use 60% dominant colour, 30% secondary, 10% accent', 'Only use 3 fonts', 'Apply 60px spacing everywhere'], correctAnswer: 1, explanation: 'The 60-30-10 rule: 60% dominant colour (usually neutral), 30% secondary, 10% accent for visual balance.' },
      { id: 'ux_m4_q2', question: 'What is typographic hierarchy?', options: ['Sorting fonts alphabetically', "Using size, weight, and colour to guide the reader's eye through content", 'Choosing only serif fonts', 'Using a single font size throughout'], correctAnswer: 1, explanation: 'Typographic hierarchy uses contrast in size, weight, and colour to indicate the importance of text elements.' },
      { id: 'ux_m4_q3', question: 'What is the minimum recommended text contrast ratio for WCAG AA accessibility?', options: ['2:1', '3:1', '4.5:1', '7:1'], correctAnswer: 2, explanation: 'WCAG AA requires a 4.5:1 contrast ratio for normal text to ensure readability for low-vision users.' },
      { id: 'ux_m4_q4', question: 'Which spacing unit is scalable and adapts to user font-size settings?', options: ['px', 'em / rem', 'pt', 'cm'], correctAnswer: 1, explanation: 'em and rem are relative units; rem is relative to the root font size, making layouts scale with user preferences.' },
      { id: 'ux_m4_q5', question: 'What is a design system?', options: ['A bug tracking tool', 'A collection of reusable components, tokens, and guidelines for consistent UI', 'A version control system for code', 'A colour picker tool'], correctAnswer: 1, explanation: 'A design system packages components, tokens, patterns, and documentation to ensure product-wide consistency.' },
    ],
  },
  {
    courseId: 'pkg_uiux', moduleId: 'ux_m5', title: 'Usability Testing Quiz',
    questions: [
      { id: 'ux_m5_q1', question: 'What is the ideal number of participants for a moderated usability test to find most issues?', options: ['1-2', '5-8', '20-30', '50+'], correctAnswer: 1, explanation: 'Research by Nielsen Norman Group shows 5 users uncover ~85% of usability problems in a single round of testing.' },
      { id: 'ux_m5_q2', question: 'In a "think-aloud" protocol, participants are asked to:', options: ['Silently complete tasks', 'Verbalise their thoughts as they interact with the product', 'Rate the design on a scale', 'Complete tasks as fast as possible'], correctAnswer: 1, explanation: 'Think-aloud protocols reveal users\' mental models, confusion points, and reasoning in real time.' },
      { id: 'ux_m5_q3', question: 'What is a task scenario in usability testing?', options: ['A bug report', 'A realistic story that gives context for the task a participant should complete', 'A competitor analysis', 'A heuristic evaluation'], correctAnswer: 1, explanation: 'Task scenarios provide realistic context (e.g., "You\'ve just moved — update your address") to make tasks natural.' },
      { id: 'ux_m5_q4', question: 'Affinity mapping after a usability test helps to:', options: ['Write code fixes', 'Cluster and prioritise findings into themes', 'Create brand assets', 'Conduct A/B tests'], correctAnswer: 1, explanation: 'Affinity mapping groups individual observations into patterns, making it easy to identify the most impactful issues.' },
      { id: 'ux_m5_q5', question: 'Which method tests a product without a live facilitator?', options: ['Moderated remote testing', 'Unmoderated remote testing', 'Contextual inquiry', 'Guerrilla testing'], correctAnswer: 1, explanation: 'Unmoderated testing lets participants complete tasks independently, scaling research cheaply.' },
    ],
  },

  // ── pkg_fin — Financial Modeling Fundamentals ──────────────────────────────
  {
    courseId: 'pkg_fin', moduleId: 'fin_m1', title: 'Excel Foundations Quiz',
    questions: [
      { id: 'fin_m1_q1', question: 'Which Excel shortcut applies bold formatting?', options: ['Ctrl+I', 'Ctrl+B', 'Ctrl+U', 'Ctrl+E'], correctAnswer: 1, explanation: 'Ctrl+B toggles bold formatting on selected cells in Excel.' },
      { id: 'fin_m1_q2', question: 'What does the VLOOKUP function do?', options: ['Adds a column', 'Looks up a value in the leftmost column and returns a value in the same row', 'Creates a pivot table', 'Sorts a range'], correctAnswer: 1, explanation: 'VLOOKUP searches for a value in the first column of a range and returns a value in the same row from a specified column.' },
      { id: 'fin_m1_q3', question: 'In Excel, cell reference $A$1 is an example of:', options: ['Relative reference', 'Mixed reference', 'Absolute reference', 'Named range'], correctAnswer: 2, explanation: 'Dollar signs lock both the row and column, creating an absolute reference that does not change when copied.' },
      { id: 'fin_m1_q4', question: 'Which formula calculates the Internal Rate of Return?', options: ['=NPV()', '=IRR()', '=RATE()', '=XIRR()'], correctAnswer: 1, explanation: '=IRR() calculates the discount rate that makes the net present value of cash flows equal to zero.' },
      { id: 'fin_m1_q5', question: 'What is the purpose of a named range in Excel?', options: ['To add colour to cells', 'To give a descriptive name to a cell or range for easier formulas', 'To password-protect a sheet', 'To insert a chart'], correctAnswer: 1, explanation: 'Named ranges replace cell addresses with meaningful names (e.g., Revenue), improving formula readability.' },
    ],
  },
  {
    courseId: 'pkg_fin', moduleId: 'fin_m2', title: 'Financial Statements Quiz',
    questions: [
      { id: 'fin_m2_q1', question: 'Which financial statement shows profitability over a period?', options: ['Balance Sheet', 'Cash Flow Statement', 'Income Statement', 'Statement of Changes in Equity'], correctAnswer: 2, explanation: 'The Income Statement (P&L) reports revenues, expenses, and net profit over an accounting period.' },
      { id: 'fin_m2_q2', question: 'The accounting equation is:', options: ['Revenue - Expenses = Profit', 'Assets = Liabilities + Equity', 'Cash In - Cash Out = Net Cash', 'Revenue = Assets + Liabilities'], correctAnswer: 1, explanation: 'The foundational accounting equation: Assets must always equal Liabilities plus Shareholders\' Equity.' },
      { id: 'fin_m2_q3', question: 'Depreciation is recorded on the income statement because:', options: ['Cash left the business', 'It allocates the cost of a long-term asset over its useful life', 'It increases revenue', 'It is a tax payment'], correctAnswer: 1, explanation: 'Depreciation is a non-cash charge that spreads an asset\'s cost over its useful life, matching expenses to revenue.' },
      { id: 'fin_m2_q4', question: 'Operating cash flow differs from net income because it:', options: ['Includes financing activities', 'Adds back non-cash charges like depreciation and adjusts working capital', 'Only counts cash sales', 'Excludes interest expenses'], correctAnswer: 1, explanation: 'Cash flow from operations starts with net income and adjusts for non-cash items and working capital changes.' },
      { id: 'fin_m2_q5', question: 'Current assets are assets expected to be converted to cash within:', options: ['5 years', '10 years', '1 year', '6 months'], correctAnswer: 2, explanation: 'Current assets (cash, receivables, inventory) are expected to be liquidated within one year or one operating cycle.' },
    ],
  },
  {
    courseId: 'pkg_fin', moduleId: 'fin_m3', title: 'Valuation Methods Quiz',
    questions: [
      { id: 'fin_m3_q1', question: 'DCF stands for:', options: ['Direct Cash Forecast', 'Discounted Cash Flow', 'Debt-to-Capital Formula', 'Dynamic Cost Framework'], correctAnswer: 1, explanation: 'DCF (Discounted Cash Flow) values a business by discounting projected future cash flows to their present value.' },
      { id: 'fin_m3_q2', question: 'The discount rate in a DCF model most often represents:', options: ['The revenue growth rate', 'The Weighted Average Cost of Capital (WACC)', 'The inflation rate', 'The tax rate'], correctAnswer: 1, explanation: 'WACC reflects the blended cost of equity and debt financing, used as the discount rate for enterprise DCF models.' },
      { id: 'fin_m3_q3', question: 'In comparable company analysis, EV/EBITDA is a:', options: ['Profitability ratio', 'Valuation multiple', 'Liquidity ratio', 'Leverage ratio'], correctAnswer: 1, explanation: 'EV/EBITDA is a valuation multiple comparing Enterprise Value to earnings before interest, taxes, depreciation, and amortisation.' },
      { id: 'fin_m3_q4', question: 'Terminal value in a DCF represents:', options: ["The company's debt balance", 'The present value of all cash flows beyond the explicit forecast period', 'The residual value of assets after depreciation', 'Year 1 cash flow'], correctAnswer: 1, explanation: 'Terminal value captures the value of cash flows beyond the forecast horizon, often the largest component of a DCF.' },
      { id: 'fin_m3_q5', question: 'Which valuation approach uses multiples from publicly traded peers?', options: ['DCF analysis', 'Precedent transactions', 'Comparable company analysis', 'Book value method'], correctAnswer: 2, explanation: 'Comparable company (trading comps) analysis derives value multiples from similar public companies to benchmark a target.' },
    ],
  },
  {
    courseId: 'pkg_fin', moduleId: 'fin_m4', title: 'Case Studies Quiz',
    questions: [
      { id: 'fin_m4_q1', question: 'In a startup valuation, which method is most commonly used due to lack of historical financials?', options: ['P/E ratio', 'Book value', 'DCF with scenario analysis', 'Dividend discount model'], correctAnswer: 2, explanation: 'Startups lack history, so DCF with multiple revenue scenarios (bear/base/bull) is widely used alongside VC method.' },
      { id: 'fin_m4_q2', question: 'In real estate financial modelling, NOI stands for:', options: ['Net Operating Income', 'New Owner Investment', 'Non-Operating Interest', 'Net Output Index'], correctAnswer: 0, explanation: 'NOI (Net Operating Income) = rental income minus operating expenses (excluding debt service), key for real estate valuation.' },
      { id: 'fin_m4_q3', question: 'Sensitivity analysis in financial models helps:', options: ['Fix formula errors', 'Understand how output changes when key assumptions vary', 'Calculate WACC automatically', 'Build charts faster'], correctAnswer: 1, explanation: 'Sensitivity analysis shows the impact of changing one or two inputs (e.g., growth rate, discount rate) on the valuation.' },
      { id: 'fin_m4_q4', question: 'Cap rate in real estate is calculated as:', options: ['Debt / Equity', 'NOI / Property Value', 'Revenue / Total Assets', 'Net Income / Sales'], correctAnswer: 1, explanation: 'Capitalisation rate = NOI / Property Value, used to estimate value or compare investment properties.' },
      { id: 'fin_m4_q5', question: 'What is a scenario analysis in financial modelling?', options: ['A chart of historical stock prices', 'Testing multiple sets of assumptions (e.g., base, bull, bear) simultaneously', 'A depreciation schedule', 'A fixed-rate calculation'], correctAnswer: 1, explanation: 'Scenario analysis evaluates the model output under different input combinations representing plausible future states.' },
    ],
  },

  // ── pkg_lead — Leadership & Team Management ────────────────────────────────
  {
    courseId: 'pkg_lead', moduleId: 'lead_m1', title: 'Leadership Fundamentals Quiz',
    questions: [
      { id: 'lead_m1_q1', question: 'Which leadership style involves high leader control with little team input?', options: ['Democratic', 'Laissez-faire', 'Autocratic', 'Transformational'], correctAnswer: 2, explanation: 'Autocratic (authoritarian) leaders make decisions unilaterally with minimal input from team members.' },
      { id: 'lead_m1_q2', question: 'Transformational leadership primarily focuses on:', options: ['Strict rule enforcement', 'Rewarding performance', 'Inspiring and motivating others toward a shared vision', 'Delegating all decisions'], correctAnswer: 2, explanation: 'Transformational leaders inspire change by connecting individuals to a compelling vision and fostering intrinsic motivation.' },
      { id: 'lead_m1_q3', question: 'Emotional intelligence in leadership includes:', options: ['Technical expertise', 'Self-awareness, empathy, and relationship management', 'Financial acumen', 'Project management skills'], correctAnswer: 1, explanation: 'EQ encompasses self-awareness, self-regulation, motivation, empathy, and social skills — key for effective leadership.' },
      { id: 'lead_m1_q4', question: 'A servant leader prioritises:', options: ['Personal recognition', 'Serving the needs of the team above their own', 'Maintaining hierarchy', 'Short-term profit'], correctAnswer: 1, explanation: 'Servant leadership flips the hierarchy: the leader exists to support and empower their team, not vice versa.' },
      { id: 'lead_m1_q5', question: 'Which habit most distinguishes great leaders from average managers?', options: ['Micromanaging tasks', 'Developing and mentoring others', 'Maximising personal workload', 'Avoiding difficult conversations'], correctAnswer: 1, explanation: 'Great leaders invest in growing the people around them, multiplying organisational capability over time.' },
    ],
  },
  {
    courseId: 'pkg_lead', moduleId: 'lead_m2', title: 'Building Your Team Quiz',
    questions: [
      { id: 'lead_m2_q1', question: "Tuckman's model of team development stages are:", options: ['Plan, Do, Check, Act', 'Forming, Storming, Norming, Performing', 'Hire, Train, Deploy, Review', 'Initiate, Execute, Monitor, Close'], correctAnswer: 1, explanation: "Tuckman's four stages describe how teams evolve: Forming, Storming (conflict), Norming (cohesion), Performing (high output)." },
      { id: 'lead_m2_q2', question: 'Psychological safety in a team means:', options: ['Physical workplace safety', 'Team members feel safe to speak up, take risks, and admit mistakes without fear', 'Job security guarantees', 'Mental health benefits'], correctAnswer: 1, explanation: 'Psychological safety is the shared belief that the team is safe for interpersonal risk-taking.' },
      { id: 'lead_m2_q3', question: 'A 30-60-90 day onboarding plan helps new hires by:', options: ['Setting clear milestones and expectations for the first three months', 'Replacing the job description', 'Automating payroll', 'Measuring annual performance'], correctAnswer: 0, explanation: 'A 30-60-90 day plan gives new employees structured ramp-up goals, reducing overwhelm and accelerating productivity.' },
      { id: 'lead_m2_q4', question: "Hiring for culture fit means:", options: ['Only hiring people who look the same', "Prioritising candidates whose values and ways of working align with the team's", 'Ignoring skills entirely', 'Hiring only internal candidates'], correctAnswer: 1, explanation: "Culture fit assesses whether a candidate's values, work style, and behaviours complement the existing team environment." },
      { id: 'lead_m2_q5', question: "Which stage of Tuckman's model involves the most conflict?", options: ['Forming', 'Storming', 'Norming', 'Performing'], correctAnswer: 1, explanation: 'Storming is characterised by interpersonal conflict as team members assert their views and compete for roles.' },
    ],
  },
  {
    courseId: 'pkg_lead', moduleId: 'lead_m3', title: 'Communication & Feedback Quiz',
    questions: [
      { id: 'lead_m3_q1', question: 'The SBI feedback model stands for:', options: ['Strength, Behaviour, Improvement', 'Situation, Behaviour, Impact', 'Stop, Begin, Improve', 'Set, Build, Iterate'], correctAnswer: 1, explanation: 'SBI: describe the Situation, the specific Behaviour observed, and the Impact it had — keeping feedback objective and actionable.' },
      { id: 'lead_m3_q2', question: 'Which type of question encourages the most open discussion in a 1:1?', options: ['Yes/No question', 'Leading question', 'Open-ended question', 'Multiple-choice question'], correctAnswer: 2, explanation: "Open-ended questions (e.g., \"What's on your mind?\") invite reflection and fuller responses than closed questions." },
      { id: 'lead_m3_q3', question: 'The best meeting agenda should be shared:', options: ['During the meeting', '5 minutes before', 'At least a day in advance', 'After the meeting as minutes'], correctAnswer: 2, explanation: 'Sharing agendas in advance lets participants prepare, make the meeting efficient, and reduce surprises.' },
      { id: 'lead_m3_q4', question: 'Active listening involves:', options: ['Interrupting with solutions', 'Checking your phone', 'Fully concentrating, understanding, and responding thoughtfully', 'Waiting for your turn to speak'], correctAnswer: 2, explanation: 'Active listening means giving full attention, withholding judgment, and reflecting back to confirm understanding.' },
      { id: 'lead_m3_q5', question: 'When delivering difficult feedback, you should:', options: ['Email it to avoid awkwardness', 'Be vague to soften the blow', 'Be specific, timely, and focus on behaviour not personality', 'Only give positive feedback'], correctAnswer: 2, explanation: 'Effective difficult feedback is specific (concrete behaviour), timely (soon after the event), and behaviour-focused (not personal attacks).' },
    ],
  },
  {
    courseId: 'pkg_lead', moduleId: 'lead_m4', title: 'Strategic Thinking Quiz',
    questions: [
      { id: 'lead_m4_q1', question: 'OKR stands for:', options: ['Operations, Knowledge, Results', 'Objectives and Key Results', 'Outcomes, KPIs, Reviews', 'Organisational Knowledge Repository'], correctAnswer: 1, explanation: 'OKRs (Objectives and Key Results) align teams around ambitious goals measured by specific, quantifiable outcomes.' },
      { id: 'lead_m4_q2', question: 'A SWOT analysis examines:', options: ['Speed, Weight, Output, Time', 'Strengths, Weaknesses, Opportunities, Threats', 'Strategy, Workflow, Operations, Tactics', 'Sales, Workforce, Overhead, Technology'], correctAnswer: 1, explanation: 'SWOT analysis maps internal Strengths and Weaknesses against external Opportunities and Threats.' },
      { id: 'lead_m4_q3', question: 'Which decision-making framework helps when facing uncertainty?', options: ['Gut feeling alone', 'Pros and cons list', 'Pre-mortem analysis', 'Delaying indefinitely'], correctAnswer: 2, explanation: 'A pre-mortem imagines the project has already failed and works backward to identify potential failure points proactively.' },
      { id: 'lead_m4_q4', question: 'Strategic thinking differs from operational thinking because it focuses on:', options: ['Day-to-day task completion', 'Long-term direction, priorities, and trade-offs', 'Fixing bugs', 'Writing procedures'], correctAnswer: 1, explanation: 'Strategic thinking zooms out to set direction and make trade-offs, while operational thinking executes within that direction.' },
      { id: 'lead_m4_q5', question: 'Key Results in an OKR should be:', options: ['Vague and aspirational', 'Measurable and time-bound', 'Set by HR not the team', 'Confidential'], correctAnswer: 1, explanation: 'Good Key Results are specific, measurable outcomes (not activities) that indicate whether the Objective was achieved.' },
    ],
  },

  // ── pkg_rn — React Native Development ─────────────────────────────────────
  {
    courseId: 'pkg_rn', moduleId: 'rn_m1', title: 'Environment Setup Quiz',
    questions: [
      { id: 'rn_m1_q1', question: 'Expo is a framework that:', options: ['Replaces React Native entirely', 'Simplifies React Native development with pre-built tooling', 'Is only for Android development', 'Requires macOS'], correctAnswer: 1, explanation: 'Expo provides a managed workflow with tooling, native modules, and OTA updates, making RN development easier.' },
      { id: 'rn_m1_q2', question: 'Which command creates a new Expo project?', options: ['expo init myApp', 'npx create-expo-app myApp', 'npm new expo myApp', 'react-native init myApp'], correctAnswer: 1, explanation: 'npx create-expo-app is the current recommended way to scaffold a new Expo project.' },
      { id: 'rn_m1_q3', question: 'The Expo Go app allows you to:', options: ['Publish to the App Store', 'Test your app on a physical device by scanning a QR code', 'Write native Objective-C code', 'Replace a simulator'], correctAnswer: 1, explanation: 'Expo Go lets you run your dev server on a real device instantly by scanning the QR code, no build required.' },
      { id: 'rn_m1_q4', question: "Metro is React Native's:", options: ['Navigation library', 'JavaScript bundler', 'State management tool', 'Testing framework'], correctAnswer: 1, explanation: 'Metro is the JavaScript bundler used by React Native to transform and bundle JS code for the device.' },
      { id: 'rn_m1_q5', question: 'Which runtime environment does React Native use for JavaScript on iOS?', options: ['V8', 'Node.js', 'JavaScriptCore (JSC)', 'SpiderMonkey'], correctAnswer: 2, explanation: 'React Native uses JavaScriptCore (JSC) on iOS to execute JavaScript; Hermes is an alternative cross-platform engine.' },
    ],
  },
  {
    courseId: 'pkg_rn', moduleId: 'rn_m2', title: 'React Native Basics Quiz',
    questions: [
      { id: 'rn_m2_q1', question: 'In React Native, the equivalent of a <div> is:', options: ['<Section>', '<Box>', '<View>', '<Container>'], correctAnswer: 2, explanation: '<View> is the fundamental layout component in React Native, analogous to <div> in web.' },
      { id: 'rn_m2_q2', question: 'React Native uses Flexbox with which default flex direction?', options: ['row', 'column', 'row-reverse', 'column-reverse'], correctAnswer: 1, explanation: 'React Native Flexbox defaults to flexDirection: "column", unlike the web which defaults to "row".' },
      { id: 'rn_m2_q3', question: 'Which hook is used to manage local component state?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], correctAnswer: 2, explanation: 'useState returns a state variable and a setter, enabling local state management in functional components.' },
      { id: 'rn_m2_q4', question: "React Navigation's Stack Navigator provides which user experience pattern?", options: ['Tab bar at the bottom', 'Drawer from the side', 'Push/pop screen with back navigation', 'Infinite scroll'], correctAnswer: 2, explanation: 'Stack Navigator maintains a stack of screens; navigating pushes a screen, and going back pops it.' },
      { id: 'rn_m2_q5', question: "Redux Toolkit's createSlice does NOT automatically:", options: ['Generate action creators', 'Use Immer for immutable updates', 'Fetch data from an API', 'Create a reducer'], correctAnswer: 2, explanation: 'createSlice generates the reducer and action creators; data fetching requires createAsyncThunk or RTK Query separately.' },
    ],
  },
  {
    courseId: 'pkg_rn', moduleId: 'rn_m3', title: 'APIs & Data Quiz',
    questions: [
      { id: 'rn_m3_q1', question: 'Which built-in API fetches data from a URL in React Native?', options: ['axios', 'http.get', 'fetch', 'XMLHttpRequest'], correctAnswer: 2, explanation: 'The Fetch API is available in React Native and works similarly to the browser Fetch API.' },
      { id: 'rn_m3_q2', question: 'AsyncStorage stores data as:', options: ['SQL tables', 'Binary blobs', 'Key-value pairs (strings)', 'JSON documents with schema'], correctAnswer: 2, explanation: 'AsyncStorage is a simple, unencrypted, asynchronous key-value store for React Native, persisting string values.' },
      { id: 'rn_m3_q3', question: 'A loading skeleton UI is used to:', options: ['Show errors', 'Block user interaction', 'Indicate content is being fetched without a jarring spinner', 'Cache API responses'], correctAnswer: 2, explanation: 'Skeleton screens show placeholder shapes matching expected content, reducing perceived load time.' },
      { id: 'rn_m3_q4', question: 'expo-sqlite allows React Native apps to use:', options: ['Remote cloud databases', 'A local SQLite relational database on-device', 'MongoDB', 'Firebase Firestore'], correctAnswer: 1, explanation: 'expo-sqlite provides access to a SQLite database stored locally on the device for structured data persistence.' },
      { id: 'rn_m3_q5', question: 'Which HTTP method is typically used to create a new resource on an API?', options: ['GET', 'DELETE', 'PUT', 'POST'], correctAnswer: 3, explanation: 'POST sends data to the server to create a new resource; it is not idempotent.' },
    ],
  },
  {
    courseId: 'pkg_rn', moduleId: 'rn_m4', title: 'Publishing Your App Quiz',
    questions: [
      { id: 'rn_m4_q1', question: 'Before submitting to the App Store, you must enrol in:', options: ['Google Play Console', 'Apple Developer Program', 'Expo Org account', 'TestFlight only'], correctAnswer: 1, explanation: "Publishing to Apple's App Store requires an Apple Developer Program membership ($99/year)." },
      { id: 'rn_m4_q2', question: 'What file defines app metadata like name, icon, and permissions in Expo?', options: ['package.json', 'index.js', 'app.json / app.config.js', 'metro.config.js'], correctAnswer: 2, explanation: "app.json (or app.config.js) is Expo's configuration file for app name, icon, splash screen, permissions, and SDK version." },
      { id: 'rn_m4_q3', question: 'EAS Build stands for:', options: ['Expo App Store Build', 'Expo Application Services Build', 'External App Submission', 'Expo Android Studio'], correctAnswer: 1, explanation: "EAS Build is Expo Application Services' cloud build service that creates production binaries for iOS and Android." },
      { id: 'rn_m4_q4', question: 'The App Store review process typically takes:', options: ['A few minutes', '1-3 business days', '2-4 weeks', '6 months'], correctAnswer: 1, explanation: "Apple's App Store review typically completes within 1-3 business days for standard app submissions." },
      { id: 'rn_m4_q5', question: 'App icons for the App Store must be:', options: ['Any size JPG', '1024x1024 px PNG without transparency', '512x512 px with rounded corners', 'SVG format'], correctAnswer: 1, explanation: 'Apple requires a 1024x1024 px PNG icon without an alpha channel for App Store submission.' },
    ],
  },

  // ── pkg_dm — Digital Marketing Essentials ─────────────────────────────────
  {
    courseId: 'pkg_dm', moduleId: 'dm_m1', title: 'Marketing Foundations Quiz',
    questions: [
      { id: 'dm_m1_q1', question: "The marketing funnel's three main stages are:", options: ['Research, Design, Launch', 'Awareness, Consideration, Conversion', 'Plan, Do, Review', 'Attract, Engage, Retain'], correctAnswer: 1, explanation: 'The classic funnel: Awareness (brand discovery) > Consideration (evaluation) > Conversion (purchase/action).' },
      { id: 'dm_m1_q2', question: 'A "lead magnet" is:', options: ['A paid ad format', 'A free valuable resource offered in exchange for contact information', 'A social media algorithm', 'An email subject line'], correctAnswer: 1, explanation: 'Lead magnets (e-books, checklists, free tools) attract potential customers by offering upfront value in exchange for an email.' },
      { id: 'dm_m1_q3', question: 'Which metric measures the cost of acquiring a new customer?', options: ['CPM', 'CTR', 'CAC', 'CPC'], correctAnswer: 2, explanation: 'CAC (Customer Acquisition Cost) = total marketing and sales spend / number of new customers acquired.' },
      { id: 'dm_m1_q4', question: 'Organic reach refers to:', options: ['Paid advertising impressions', 'Audience reached without paid promotion', 'Influencer partnerships', 'Email open rates'], correctAnswer: 1, explanation: 'Organic reach is the number of people who see content without paid promotion — earned through SEO or social algorithms.' },
      { id: 'dm_m1_q5', question: 'A buyer persona helps marketers:', options: ['Write code', 'Understand and target ideal customer segments', 'Design app icons', 'Manage server costs'], correctAnswer: 1, explanation: 'Buyer personas are research-based profiles of ideal customers, guiding messaging, channel selection, and content strategy.' },
    ],
  },
  {
    courseId: 'pkg_dm', moduleId: 'dm_m2', title: 'SEO & Content Quiz',
    questions: [
      { id: 'dm_m2_q1', question: 'SEO stands for:', options: ['Social Engagement Optimisation', 'Search Engine Optimisation', 'Site Editing Operations', 'Structured Engagement Outcomes'], correctAnswer: 1, explanation: "SEO (Search Engine Optimisation) improves a website's visibility in organic (unpaid) search results." },
      { id: 'dm_m2_q2', question: "Which factor most influences a page's Google ranking?", options: ['Page background colour', 'Keyword density over 10%', 'High-quality backlinks from authoritative sites', 'Using Flash animation'], correctAnswer: 2, explanation: "Backlinks from reputable sites remain one of Google's strongest ranking signals, indicating trust and authority." },
      { id: 'dm_m2_q3', question: 'Long-tail keywords are:', options: ['Short 1-2 word phrases with high volume', 'Longer, more specific phrases with lower volume but higher intent', 'Keywords used only in meta tags', 'Paid keyword bids'], correctAnswer: 1, explanation: 'Long-tail keywords (3+ words) are more specific, less competitive, and often signal higher purchase intent.' },
      { id: 'dm_m2_q4', question: 'What is a content calendar?', options: ['A tool for scheduling content publication dates and topics', 'An analytics dashboard', 'A list of paid ad placements', 'A site map'], correctAnswer: 0, explanation: 'A content calendar plans what content to publish, on which platform, and when — ensuring consistency and strategy.' },
      { id: 'dm_m2_q5', question: 'Meta descriptions in SEO are:', options: ['Ranking factors that Google directly reads', 'Short page summaries shown in search results that influence click-through rate', 'Hidden keywords in page code', 'Alt text for images'], correctAnswer: 1, explanation: 'Meta descriptions summarise a page for search engine results; while not a direct ranking factor, they boost CTR.' },
    ],
  },
  {
    courseId: 'pkg_dm', moduleId: 'dm_m3', title: 'Social Media Marketing Quiz',
    questions: [
      { id: 'dm_m3_q1', question: 'Which platform is best for B2B (business-to-business) marketing?', options: ['TikTok', 'Snapchat', 'LinkedIn', 'Pinterest'], correctAnswer: 2, explanation: 'LinkedIn is the primary professional network, making it the most effective platform for B2B lead generation.' },
      { id: 'dm_m3_q2', question: 'In Facebook Ads, a "lookalike audience" is:', options: ['An audience of existing customers', 'A new audience that resembles your existing best customers', 'A retargeting audience', 'A keyword-based audience'], correctAnswer: 1, explanation: 'Lookalike audiences find new users who share traits with your existing customers, expanding reach efficiently.' },
      { id: 'dm_m3_q3', question: 'Which metric measures how often people engage relative to impressions?', options: ['Reach', 'Engagement rate', 'Conversion rate', 'Bounce rate'], correctAnswer: 1, explanation: 'Engagement rate = total engagements (likes, comments, shares) / impressions or reach, showing content resonance.' },
      { id: 'dm_m3_q4', question: 'The best time to post on social media is generally:', options: ['Same time every week regardless of audience', 'When your specific audience is most active, based on analytics', '3am to avoid algorithm slowdown', 'Only on weekdays'], correctAnswer: 1, explanation: 'Optimal posting times vary by platform and audience; analytics tools show when your followers are most active.' },
      { id: 'dm_m3_q5', question: 'A/B testing in social ads means:', options: ['Testing two versions of an ad to see which performs better', 'Running ads on Android and iOS', 'Using two ad agencies simultaneously', 'Testing ads in two countries'], correctAnswer: 0, explanation: 'A/B testing runs two ad variants (changing one element like headline or image) to identify which drives better results.' },
    ],
  },
  {
    courseId: 'pkg_dm', moduleId: 'dm_m4', title: 'Email Marketing Quiz',
    questions: [
      { id: 'dm_m4_q1', question: 'Email open rate measures:', options: ['Number of emails sent', 'Percentage of recipients who opened the email', 'Number of unsubscribes', 'Click-through rate'], correctAnswer: 1, explanation: 'Open rate = (unique opens / delivered emails) x 100, indicating how compelling the subject line is.' },
      { id: 'dm_m4_q2', question: 'A double opt-in process requires subscribers to:', options: ['Pay a subscription fee', 'Confirm their email address by clicking a verification link', 'Fill out a long survey', 'Call customer support'], correctAnswer: 1, explanation: 'Double opt-in sends a confirmation email after sign-up; clicking the link verifies the address, improving list quality.' },
      { id: 'dm_m4_q3', question: 'Email segmentation means:', options: ['Sending all subscribers the same email', 'Dividing your list into groups based on behaviour or attributes for targeted messages', 'Deleting inactive subscribers', 'Formatting emails for mobile'], correctAnswer: 1, explanation: 'Segmentation splits your list to send more relevant, personalised emails.' },
      { id: 'dm_m4_q4', question: 'Which element most affects email open rates?', options: ['The font size used in the email body', 'The subject line', 'The unsubscribe link', 'The email footer design'], correctAnswer: 1, explanation: 'The subject line (and preview text) determines whether the email gets opened; it is the most critical element for open rates.' },
      { id: 'dm_m4_q5', question: 'An email automation sequence triggered by a user action is called:', options: ['Broadcast email', 'Newsletter', 'Drip campaign / triggered email', 'A/B test'], correctAnswer: 2, explanation: 'Drip campaigns automatically send relevant emails based on user actions like sign-up or purchase.' },
    ],
  },
  {
    courseId: 'pkg_dm', moduleId: 'dm_m5', title: 'Analytics & Reporting Quiz',
    questions: [
      { id: 'dm_m5_q1', question: 'GA4 stands for:', options: ['Global Analytics 4', 'Google Analytics 4', 'Gross Acquisition 4', 'Growth Automation 4'], correctAnswer: 1, explanation: "GA4 is Google's latest analytics platform, replacing Universal Analytics with an event-based data model." },
      { id: 'dm_m5_q2', question: 'Bounce rate in Google Analytics measures:', options: ['Emails that did not deliver', 'Percentage of sessions where users left after viewing only one page', 'Ad click failures', 'Server downtime incidents'], correctAnswer: 1, explanation: 'Bounce rate = single-page sessions / total sessions; a high bounce rate may indicate poor relevance or UX.' },
      { id: 'dm_m5_q3', question: 'ROAS stands for:', options: ['Return on Ad Spend', 'Revenue of Active Subscribers', 'Rate of Audience Size', 'Reach of Advertising System'], correctAnswer: 0, explanation: 'ROAS = revenue generated by ads / ad spend. A ROAS of 4 means $4 revenue for every $1 spent on ads.' },
      { id: 'dm_m5_q4', question: 'A UTM parameter in a URL is used to:', options: ['Speed up page loading', 'Track the source, medium, and campaign of traffic in analytics', 'Secure the website with HTTPS', 'Compress images'], correctAnswer: 1, explanation: 'UTM parameters tag URLs so GA can attribute traffic to specific campaigns.' },
      { id: 'dm_m5_q5', question: "Which KPI best measures the efficiency of a marketing campaign's cost?", options: ['Total impressions', 'Cost Per Acquisition (CPA)', 'Follower count', 'Page views'], correctAnswer: 1, explanation: 'CPA (Cost Per Acquisition) measures how much it costs to acquire one customer or conversion, directly indicating efficiency.' },
    ],
  },
];

export function getModuleQuiz(courseId, moduleId) {
  return moduleQuizzes.find(q => q.courseId === courseId && q.moduleId === moduleId) || null;
}

// Lookup by module order (1-based) — used when moduleId is an Airtable record ID
export function getModuleQuizByOrder(pkgId, moduleOrder) {
  const pkgQuizzes = moduleQuizzes.filter(q => q.courseId === pkgId);
  return pkgQuizzes[moduleOrder - 1] || null;
}
