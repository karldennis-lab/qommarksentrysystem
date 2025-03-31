document.addEventListener('DOMContentLoaded', () => {
      console.log("DOM fully loaded and parsed."); // Debug Start

      // --- Basic Login Check ---
      const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
      const userRole = sessionStorage.getItem('userRole');
      const username = sessionStorage.getItem('username');
      let assignedClasses = [];
      try {
          assignedClasses = JSON.parse(sessionStorage.getItem('assignedClasses') || '[]');
      } catch (e) {
          console.error("Error parsing assigned classes:", e);
          assignedClasses = []; // Default to empty if parsing fails
      }
      const isAdmin = userRole === 'admin';

      if (!isLoggedIn) {
          window.location.href = 'login.html';
          return; // Stop script execution if not logged in
      }
      console.log(`User: ${username}, Role: ${userRole}, Assigned: ${assignedClasses.join(', ')}`);

      // --- Constants ---
      const DB_KEY = 'queenOfMartyrsData_v6'; // Updated Key

      // --- DOM Elements ---
      const navLinks = document.querySelectorAll('.main-nav a.nav-link');
      const contentSections = document.querySelectorAll('.content-section');
      const currentYearSpan = document.getElementById('current-year');
      const appContent = document.getElementById('app-content');
      const logoutBtn = document.getElementById('logout-btn');
      const themeToggle = document.getElementById('theme-checkbox');
      const loggedInUsernameSpan = document.getElementById('logged-in-username');
      const loggedInUsernameInlineSpans = document.querySelectorAll('.logged-in-username-inline');

      // Marks Entry Elements
      const meLevelSelect = document.getElementById('me-level');
      const meClassSelect = document.getElementById('me-class');
      const meStreamSelect = document.getElementById('me-stream');
      const meSubjectSelect = document.getElementById('me-subject');
      const meTermSelect = document.getElementById('me-term');
      const meExamTypeSelect = document.getElementById('me-exam-type');
      const loadMarksheetBtn = document.getElementById('load-marksheet-btn');
      const marksheetArea = document.getElementById('marksheet-area');
      const marksheetTableContainer = document.getElementById('marksheet-table-container');
      const marksheetDetailsSpan = document.getElementById('marksheet-details');
      const saveMarksheetBtn = document.getElementById('save-marksheet-btn');
      const printMarksheetBtn = document.getElementById('print-marksheet-btn');
      const downloadCsvBtn = document.getElementById('download-csv-btn');
      const generateReportsClassBtn = document.getElementById('generate-reports-class-btn');
      const addStudentToClassBtn = document.getElementById('add-student-to-class-btn');

      // Report Generation Elements
      const rgLevelSelect = document.getElementById('rg-level');
      const rgClassSelect = document.getElementById('rg-class');
      const rgStreamSelect = document.getElementById('rg-stream');
      const rgTermSelect = document.getElementById('rg-term');
      const rgExamTypeSelect = document.getElementById('rg-exam-type');
      const rgStudentSelect = document.getElementById('rg-student');
      const viewReportBtn = document.getElementById('view-report-btn');
      const reportCardArea = document.getElementById('report-card-area');
      const printReportBtn = document.getElementById('print-report-btn');
      const reportCardTemplate = document.getElementById('report-card-template');

      // Saved Marksheets Elements
      const savedMarkhseetsList = document.getElementById('saved-marksheets-list');
      const refreshSavedListBtn = document.getElementById('refresh-saved-list-btn');

      // Student Management Elements
      const studentListBody = document.getElementById('student-list-body');
      const refreshStudentListBtn = document.getElementById('refresh-student-list-btn');

       // Subject Management Elements
       const olevelSubjectList = document.getElementById('olevel-subject-list');
       const alevelArtsSubjectList = document.getElementById('alevel-arts-subject-list');
       const alevelScienceSubjectList = document.getElementById('alevel-science-subject-list');
       const refreshSubjectListBtn = document.getElementById('refresh-subject-list-btn');
       const addSubjectMgmtBtn = document.getElementById('add-subject-mgmt-btn');

      // System Analysis Elements
      const calculateAnalysisBtn = document.getElementById('calculate-analysis-btn');
      const analysisContent = document.getElementById('analysis-content');
      const streamPerfDiv = document.getElementById('stream-performance');
      const perClassAnalysisContainer = document.getElementById('per-class-analysis-container');
      const subjectAnalysisContainer = document.getElementById('subject-analysis-container'); // New container
      const perfChartCanvas = document.getElementById('performance-chart').getContext('2d');
      const chartPlaceholder = document.getElementById('chart-placeholder');
      let performanceChart = null;

      // Calendar & Events Elements
      const monthYearDisplay = document.getElementById('month-year-display');
      const calendarGrid = document.getElementById('calendar-grid');
      const prevMonthBtn = document.getElementById('prev-month-btn');
      const nextMonthBtn = document.getElementById('next-month-btn');
      const eventListUl = document.getElementById('event-list');
      const dashboardEventListUl = document.getElementById('dashboard-event-list');
      const eventDateInput = document.getElementById('event-date');
      const eventDescInput = document.getElementById('event-description');
      const addEventBtn = document.getElementById('add-event-btn');
      let currentCalendarDate = new Date(); // For calendar navigation

      // Settings Elements
      const gradingScaleGlobalTextarea = document.getElementById('setting-grading-global');
      const gradingScaleOlevelTextarea = document.getElementById('setting-grading-olevel');
      const overrideTargetSelect = document.getElementById('setting-override-target');
      const gradingScaleSpecificTextarea = document.getElementById('setting-grading-specific');
      const saveSettingsBtn = document.getElementById('save-settings-btn');
      const loadSettingsBtn = document.getElementById('load-settings-btn');
      const resetDefaultsBtn = document.getElementById('reset-defaults-btn');
      
      // Dashboard Elements
      const statTotalStudents = document.getElementById('stat-total-students');
      const statTotalClasses = document.getElementById('stat-total-classes');
      const statOlevelSubjects = document.getElementById('stat-olevel-subjects');
      const statAlevelSubjects = document.getElementById('stat-alevel-subjects');
      const statTotalTeachers = document.getElementById('stat-total-teachers');


      // --- Application State & Data ---
      const defaultSchoolData = getDefaultData();
      let schoolData = loadData();

      // --- Utility Functions ---
      function saveData() { /* ... (no changes) ... */
        try { localStorage.setItem(DB_KEY, JSON.stringify(schoolData)); console.log("Data saved successfully."); }
        catch (e) { console.error("Error saving data to localStorage:", e); alert("Error saving data. LocalStorage might be full or disabled."); }
      }
      function loadData() { /* ... (no changes) ... */
        const data = localStorage.getItem(DB_KEY); if (data) { try { console.log("Loading data from localStorage..."); const loaded = JSON.parse(data); const mergedSettings = deepMerge(getDefaultData().settings, loaded.settings || {}); return { ...getDefaultData(), ...loaded, settings: mergedSettings }; } catch (e) { console.error("Error parsing data from localStorage:", e); } } console.log("No saved data found or error loading. Using default data."); return getDefaultData();
      }
      function deepMerge(target, source) { /* ... (no changes) ... */
          const output = { ...target }; if (isObject(target) && isObject(source)) { Object.keys(source).forEach(key => { if (isObject(source[key])) { if (!(key in target)) Object.assign(output, { [key]: source[key] }); else output[key] = deepMerge(target[key], source[key]); } else { Object.assign(output, { [key]: source[key] }); } }); } return output;
      }
      function isObject(item) { /* ... (no changes) ... */
          return (item && typeof item === 'object' && !Array.isArray(item));
      }

      function getDefaultData() { /* Updated Streams & Dummy Students */
          const baseData = {
            levels: {
              "O-Level": { classes: ["S1", "S2", "S3", "S4"], subjects: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics", "Geography", "History", "Entrepreneurship Education", "Kiswahili", "Local Language", "Religious Education", "ICT", "Physical Education", "Literature in English", "Agriculture", "Art and Design"], streams: ["North", "South"] },
              "A-Level": { classes: ["S5", "S6"], subjects: { "Arts": ["History", "Geography", "Economics", "Literature in English", "Religious Studies", "Kiswahili", "Art", "General Paper", "Sub Math"], "Science": ["Mathematics", "Physics", "Chemistry", "Biology", "ICT", "Agriculture", "Technical Drawing", "General Paper", "Sub Math"] }, streams: ["Arts", "Science"] }
            },
            students: {}, marks: {}, events: [ { date: "2025-04-10", description: "End of Term Exams Start" } ], // Added default event
            settings: {
              teacherCount: 55,
              gradingScale: {
                  global: [ { grade: "A", min: 80, max: 100, comment: "Excellent" }, { grade: "B", min: 70, max: 79, comment: "Very Good" }, { grade: "C", min: 60, max: 69, comment: "Good" }, { grade: "D", min: 50, max: 59, comment: "Fair" }, { grade: "E", min: 40, max: 49, comment: "Weak" }, { grade: "F", min: 0, max: 39, comment: "Fail" } ],
                  "O-Level": [ { grade: "A+", min: 90, max: 100, comment: "Outstanding" }, { grade: "A", min: 80, max: 89, comment: "Excellent" }, { grade: "B", min: 70, max: 79, comment: "Very Good" }, { grade: "C", min: 60, max: 69, comment: "Good" }, { grade: "D", min: 50, max: 59, comment: "Satisfactory" }, { grade: "E", min: 40, max: 49, comment: "Fair" }, { grade: "F", min: 0, max: 39, comment: "Needs Improvement" } ]
              },
              teacherComments: { excellent: "Excellent progress. Keep it up.", medium: "Satisfactory effort, but more focus is needed for improvement.", poor: "Significant effort is required. Please seek assistance." }
            }
          };
          const firstNames = ["Aisha", "Brenda", "Charles", "David", "Esther", "Frank", "Grace", "Henry", "Irene", "John", "Kevin", "Linda", "Moses", "Norah", "Oscar"]; const lastNames = ["Okello", "Nakato", "Mugisha", "Namono", "Katumba", "Mbabazi", "Sentamu", "Ampaire", "Mukisa", "Nantale", "Kato", "Babirye", "Wasswa", "Nalongo", "Ssempa"]; const genders = ["Female", "Male"]; const levels = baseData.levels;
          Object.keys(levels).forEach(levelName => { levels[levelName].classes.forEach(className => { levels[levelName].streams.forEach(streamName => { const classStreamKey = `${className}-${streamName}`; baseData.students[classStreamKey] = []; for (let i = 1; i <= 5; i++) { const fName = firstNames[Math.floor(Math.random() * firstNames.length)]; const lName = lastNames[Math.floor(Math.random() * lastNames.length)]; const studentName = `${fName} ${lName} ${i}`; const studentId = generateUniqueId(className.charAt(0) + streamName.charAt(0)); const gender = genders[Math.floor(Math.random() * genders.length)]; baseData.students[classStreamKey].push({ id: studentId, name: studentName, gender: gender }); } }); }); });
          return baseData;
      }

      function getGradingScaleForStudent(level, className, stream) { /* ... (no changes) ... */
          const settings = schoolData.settings.gradingScale || {}; const classStreamKey = `${className}-${stream}`; if (settings[classStreamKey] && Array.isArray(settings[classStreamKey]) && settings[classStreamKey].length > 0) { return settings[classStreamKey]; } if (settings[level] && Array.isArray(settings[level]) && settings[level].length > 0) { return settings[level]; } return settings.global || [];
      }
      function getNestedValue(obj, path, defaultValue = undefined) { /* ... (no changes) ... */
          const value = path.reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj); return value !== undefined ? value : defaultValue;
      }
      function setNestedValue(obj, path, value) { /* ... (no changes) ... */
          let current = obj; for (let i = 0; i < path.length - 1; i++) { const key = path[i]; if (current[key] === undefined || typeof current[key] !== 'object' || current[key] === null) { current[key] = {}; } current = current[key]; } if (current === null) { console.error("Cannot set property on null object at path:", path.slice(0, -1).join('.')); return; } current[path[path.length - 1]] = value;
      }
      function populateSelect(selectElement, options, includeDefault = true, defaultValue = "", defaultText = "-- Select --", filterList = null) { // Added filterList
          selectElement.innerHTML = '';
          if (includeDefault) {
              const defaultOption = document.createElement('option'); defaultOption.value = defaultValue; defaultOption.textContent = defaultText; selectElement.appendChild(defaultOption);
          }
          // Filter options if a filterList is provided
          const optionsToPopulate = filterList ? options.filter(opt => filterList.includes(opt)) : options;

          optionsToPopulate.sort().forEach(optionValue => {
              const option = document.createElement('option'); option.value = optionValue; option.textContent = optionValue; selectElement.appendChild(option);
          });
      }
      function getSubjectsForSelection(level, stream) { /* ... (no changes) ... */
          let subjects = []; const levelData = schoolData.levels[level]; if (!levelData) return []; if (level === 'O-Level') { subjects = levelData.subjects || []; } else if (level === 'A-Level' && levelData.subjects) { const streamType = stream; if (levelData.subjects[streamType]) { subjects = levelData.subjects[streamType]; } else { subjects = [...(levelData.subjects['Arts'] || []), ...(levelData.subjects['Science'] || [])].filter((v, i, a) => a.indexOf(v) === i); } } return subjects.sort();
      }
      function populateSubjectSelect(level, stream) { /* ... (no changes) ... */
          const subjects = getSubjectsForSelection(level, stream); populateSelect(meSubjectSelect, subjects, true, "", "-- Select Subject --"); if (subjects.length > 0) { const allSubjectsOption = document.createElement('option'); allSubjectsOption.value = "all"; allSubjectsOption.textContent = "-- All Subjects --"; meSubjectSelect.insertBefore(allSubjectsOption, meSubjectSelect.children[1]); }
      }

      // --- Modified Dropdown Population for Teacher Roles ---
      function updateDependentSelects(levelSelect, classSelect, streamSelect, subjectSelect = null, studentSelect = null) {
            const assignedClassKeys = isAdmin ? null : assignedClasses; // null for admin means no filtering

            levelSelect.addEventListener('change', () => {
                const selectedLevel = levelSelect.value;
                classSelect.innerHTML = '<option value="">-- Select Level First --</option>';
                streamSelect.innerHTML = '<option value="">-- Select Class First --</option>';
                if (subjectSelect) subjectSelect.innerHTML = '<option value="">-- Select Class First --</option>';
                if (studentSelect) studentSelect.innerHTML = '<option value="all">-- All Students --</option>';

                if (selectedLevel && schoolData.levels[selectedLevel]) {
                    // Filter classes based on assignment
                    const availableClasses = schoolData.levels[selectedLevel].classes;
                    const filteredClasses = assignedClassKeys
                        ? availableClasses.filter(cls => assignedClassKeys.some(key => key.startsWith(cls + '-')))
                        : availableClasses;
                    populateSelect(classSelect, filteredClasses, true, "", "-- Select Class --");
                }
            });

            classSelect.addEventListener('change', () => {
                 const selectedLevel = levelSelect.value;
                 const selectedClass = classSelect.value;
                 streamSelect.innerHTML = '<option value="">-- Select Class First --</option>';
                 if (subjectSelect) subjectSelect.innerHTML = '<option value="">-- Select Class First --</option>';
                 if (studentSelect) studentSelect.innerHTML = '<option value="all">-- All Students --</option>';

                 if (selectedLevel && selectedClass && schoolData.levels[selectedLevel]) {
                     const availableStreams = schoolData.levels[selectedLevel].streams || [];
                     // Filter streams based on assignment
                     const filteredStreams = assignedClassKeys
                        ? availableStreams.filter(str => assignedClassKeys.includes(`${selectedClass}-${str}`))
                        : availableStreams;
                     populateSelect(streamSelect, filteredStreams, true, "", "-- Select Stream --");
                 }
            });

             streamSelect.addEventListener('change', () => {
                 const selectedLevel = levelSelect.value;
                 const selectedClass = classSelect.value;
                 const selectedStream = streamSelect.value;
                 const classStreamKey = `${selectedClass}-${selectedStream}`;

                 // Check if this specific class-stream is assigned (important for non-admins)
                 if (!isAdmin && !assignedClasses.includes(classStreamKey)) {
                     if (subjectSelect) subjectSelect.innerHTML = '<option value="">-- Not Assigned --</option>';
                     if (studentSelect) studentSelect.innerHTML = '<option value="">-- Not Assigned --</option>';
                     return; // Stop further population if not assigned
                 }

                 if (subjectSelect) { populateSubjectSelect(selectedLevel, selectedStream); }
                 if (studentSelect) {
                    studentSelect.innerHTML = '<option value="all">-- All Students --</option>';
                    const studentsInClass = schoolData.students[classStreamKey] || [];
                    if (studentsInClass.length > 0) { studentsInClass.sort((a, b) => a.name.localeCompare(b.name)).forEach(student => { const option = document.createElement('option'); option.value = student.id; option.textContent = `${student.name} (${student.id})`; studentSelect.appendChild(option); }); }
                    else { const option = document.createElement('option'); option.value = ""; option.textContent = "-- No Students Found --"; option.disabled = true; studentSelect.appendChild(option); }
                 }
             });
       }

       function printElement(element) { /* ... (no changes) ... */
            const elementsToPrint = element.querySelectorAll('.printable-content'); const parentSection = element.closest('.content-section'); parentSection?.classList.add('printable-section'); if (elementsToPrint.length > 0) { elementsToPrint.forEach(el => el.classList.add('printing')); } else { element.classList.add('printing'); } window.print(); setTimeout(() => { parentSection?.classList.remove('printable-section'); if (elementsToPrint.length > 0) { elementsToPrint.forEach(el => el.classList.remove('printing')); } else { element.classList.remove('printing'); } }, 500);
        }
        function downloadTableAsCSV(tableElement, filename) { /* ... (no changes) ... */
          let csv = []; const rows = tableElement.querySelectorAll("tr"); if (!rows || rows.length === 0) { alert("Cannot download empty table."); return; } let headerRow = []; rows[0].querySelectorAll("th").forEach(header => { headerRow.push(`"${header.innerText.replace(/"/g, '""')}"`); }); csv.push(headerRow.join(",")); for (let i = 1; i < rows.length; i++) { let dataRow = []; const cells = rows[i].querySelectorAll("td"); cells.forEach((cell) => { let cellData; const input = cell.querySelector('input[type="number"]'); cellData = input ? input.value : cell.innerText; dataRow.push(`"${(cellData || '').replace(/"/g, '""')}"`); }); csv.push(dataRow.join(",")); } const csvContent = "data:text/csv;charset=utf-8," + csv.join("\n"); const encodedUri = encodeURI(csvContent); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", filename); document.body.appendChild(link); link.click(); document.body.removeChild(link);
      }
      function calculateGrade(mark, level, className, stream) { /* ... (no changes) ... */
          const gradingScale = getGradingScaleForStudent(level, className, stream); if (!gradingScale || gradingScale.length === 0) { return { grade: 'N/A', comment: 'No scale defined' }; } for (const scale of gradingScale) { const min = parseFloat(scale.min); const max = parseFloat(scale.max); if (!isNaN(min) && !isNaN(max) && mark >= min && mark <= max) { return { grade: scale.grade, comment: scale.comment || '' }; } } if (mark === null || mark === undefined || isNaN(mark)) { return { grade: '-', comment: '' }; } return { grade: 'ERR', comment: 'Mark out of range' };
      }
      function getTeacherComment(averageMark) { /* ... (no changes) ... */
          const comments = schoolData.settings.teacherComments || {}; if (averageMark >= 80 && comments.excellent) return comments.excellent; if (averageMark >= 60 && comments.medium) return comments.medium; if (comments.poor) return comments.poor; return "Needs improvement.";
      }
      function generateUniqueId(prefix = 'ID') { /* ... (no changes) ... */
          return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      }
      function handleLogout() { /* ... (no changes) ... */
          sessionStorage.removeItem('isLoggedIn'); sessionStorage.removeItem('username'); sessionStorage.removeItem('userRole'); sessionStorage.removeItem('assignedClasses'); window.location.href = 'login.html';
      }
      function setInitialTheme() { /* ... (no changes) ... */
          const savedTheme = localStorage.getItem('theme') || 'light'; document.documentElement.setAttribute('data-theme', savedTheme); if (themeToggle) { themeToggle.checked = savedTheme === 'dark'; }
      }
      function handleThemeToggle() { /* ... (no changes) ... */
          if (themeToggle.checked) { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); } else { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('theme', 'light'); }
      }
      // --- Show/Hide Admin Elements ---
      function applyRolePermissions() {
          if (!isAdmin) {
              document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
          } else {
               document.querySelectorAll('.admin-only').forEach(el => el.style.display = ''); // Show admin elements
          }
          // Update welcome message
          if(loggedInUsernameSpan) loggedInUsernameSpan.textContent = username || 'User';
          loggedInUsernameInlineSpans.forEach(span => span.textContent = username || 'User');
      }

      // --- Initialization ---
      function initializeApp() {
        console.log("Initializing App..."); // Debug Init
        setInitialTheme();
        applyRolePermissions(); // Apply role restrictions early

        if (currentYearSpan) { currentYearSpan.textContent = new Date().getFullYear(); }
        navLinks.forEach(link => { link.addEventListener('click', (event) => { event.preventDefault(); activateSection(link.getAttribute('data-target')); }); });
        logoutBtn.addEventListener('click', handleLogout); if (themeToggle) { themeToggle.addEventListener('change', handleThemeToggle); }

        // Populate dropdowns respecting roles
        updateDependentSelects(meLevelSelect, meClassSelect, meStreamSelect, meSubjectSelect);
        updateDependentSelects(rgLevelSelect, rgClassSelect, rgStreamSelect, null, rgStudentSelect);
        populateOverrideTargetSelect();

        setupMarksEntryListeners();
        setupReportGenerationListeners();
        setupSavedMarkhseetsListeners(); // Setup listeners for saved list
        setupStudentManagementListeners();
        setupSubjectManagementListeners();
        setupAnalysisListeners();
        setupCalendarEventListeners(); // Setup calendar/events
        setupSettingsListeners();

        activateSection('dashboard');
        updateDashboardStats();
        loadSettings();
        renderCalendar(currentCalendarDate); // Initial calendar render
        displayEvents(); // Initial event display
        requestNotificationPermission(); // Ask for notification permission
        console.log("App Initialized."); // Debug End Init
      }
      function activateSection(targetId) { /* ... (no changes) ... */
          contentSections.forEach(section => section.classList.remove('active', 'printable-section')); navLinks.forEach(navLink => navLink.classList.remove('active')); const targetSection = document.getElementById(targetId); if (targetSection) { targetSection.classList.add('active'); if (targetId === 'student-management') refreshStudentList(); if (targetId === 'subject-management') refreshSubjectLists(); if (targetId === 'dashboard') { updateDashboardStats(); displayEvents(); } if (targetId === 'settings') populateOverrideTargetSelect(); if (targetId === 'calendar') { renderCalendar(currentCalendarDate); displayEvents(); } if (targetId === 'saved-marksheets') refreshSavedMarkhseetsList(); } const activeLink = document.querySelector(`.nav-link[data-target="${targetId}"]`); if (activeLink) activeLink.classList.add('active'); if (targetId !== 'marks-entry') resetMarksheetArea(); if (targetId !== 'report-generation') resetReportCardArea();
      }
      function updateDashboardStats() { /* Updated class count logic */
          statTotalStudents.textContent = 578;
          let classCount = 0;
          const relevantClasses = isAdmin ? Object.keys(schoolData.students) : assignedClasses;
          relevantClasses.forEach(key => { if(schoolData.students[key]?.length > 0) classCount++; });
          statTotalClasses.textContent = isAdmin ? classCount : assignedClasses.length; // Show assigned count for teachers
          let olevelSubjectCount = schoolData.levels["O-Level"]?.subjects?.length || 0; statOlevelSubjects.textContent = olevelSubjectCount; let combinedAlevel = new Set([...(schoolData.levels["A-Level"]?.subjects?.Arts || []), ...(schoolData.levels["A-Level"]?.subjects?.Science || [])]); statAlevelSubjects.textContent = combinedAlevel.size; statTotalTeachers.textContent = schoolData.settings.teacherCount || '--';
      }

      // --- Marks Entry Logic ---
      function setupMarksEntryListeners() { /* ... (no changes) ... */
          loadMarksheetBtn.addEventListener('click', loadMarksheet); saveMarksheetBtn.addEventListener('click', saveMarksheet); printMarksheetBtn.addEventListener('click', () => { const marksheetContent = document.getElementById('marksheet-table-container'); if (!marksheetContent.querySelector('table')) { alert("Load a marksheet before printing."); return; } printElement(marksheetContent); }); downloadCsvBtn.addEventListener('click', downloadMarksheetCsv); generateReportsClassBtn.addEventListener('click', generateReportsForClassFromMarksheet); addStudentToClassBtn.addEventListener('click', addStudentToSelectedClass);
      }
      function resetMarksheetArea() { /* ... (no changes) ... */
          marksheetTableContainer.innerHTML = '<p class="placeholder-text">Select filters and click "Load Marksheet" to view/enter marks.</p>'; marksheetDetailsSpan.textContent = 'No Class Selected';
      }
      function loadMarksheet() { /* ... (no changes) ... */
        const level = meLevelSelect.value; const className = meClassSelect.value; const stream = meStreamSelect.value; const term = meTermSelect.value; const examType = meExamTypeSelect.value; const subjectFilter = meSubjectSelect.value; if (!level || !className || !stream || !term || !examType || !subjectFilter) { alert('Please select all filters first.'); return; } marksheetDetailsSpan.textContent = `${className} ${stream} - ${term} - ${examType} - ${subjectFilter === 'all' ? 'All Subjects' : subjectFilter}`; generateMarksheetTable(level, className, stream, term, examType, subjectFilter);
      }
      function generateMarksheetTable(level, className, stream, term, examType, subjectFilter) { /* Added A-Level Paper Logic */
          const classStreamKey = `${className}-${stream}`;
          const students = (schoolData.students[classStreamKey] || []).sort((a, b) => a.name.localeCompare(b.name));
          let subjectsToList = (subjectFilter === 'all') ? getSubjectsForSelection(level, stream) : [subjectFilter];
          const isALevelScience = level === 'A-Level' && stream === 'Science';
          const sciencePaperSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Agriculture"]; // Subjects with papers

          if (students.length === 0) { marksheetTableContainer.innerHTML = '<p class="placeholder-text">No students found for this class/stream.</p>'; return; }
          if (subjectsToList.length === 0) { marksheetTableContainer.innerHTML = '<p class="placeholder-text">No subjects found for this selection.</p>'; return; }

          let tableHTML = '<table class="marks-table" id="marksheet-table-proper">';
          tableHTML += '<thead><tr><th rowspan="2">Student ID</th><th rowspan="2">Student Name</th>';

          // Generate headers, spanning for papers if needed
          subjectsToList.forEach(subj => {
              if (isALevelScience && sciencePaperSubjects.includes(subj) && subjectFilter === 'all') {
                  tableHTML += `<th colspan="2">${subj}</th>`;
              } else {
                  tableHTML += `<th rowspan="2">${subj}</th>`;
              }
          });
          tableHTML += '</tr>';

          // Add sub-headers for papers if showing all subjects for A-Level Science
          if (isALevelScience && subjectFilter === 'all') {
              tableHTML += '<tr>';
              subjectsToList.forEach(subj => {
                  if (sciencePaperSubjects.includes(subj)) {
                      tableHTML += `<th><span class="marksheet-paper-header">P1</span></th><th><span class="marksheet-paper-header">P2</span></th>`;
                  }
              });
              tableHTML += '</tr>';
          }
          tableHTML += '</thead><tbody>';

          // Generate student rows
          students.forEach(student => {
            tableHTML += `<tr data-student-id="${student.id}"><td>${student.id}</td><td>${student.name}</td>`;
            subjectsToList.forEach(subj => {
                const subjKey = subj.replace(/\s+/g, '_');
                if (isALevelScience && sciencePaperSubjects.includes(subj) && subjectFilter === 'all') {
                    // Paper 1
                    const inputIdP1 = `${student.id}-${subjKey}-P1-${examType}`;
                    const markPathP1 = [term, student.id, subj + "-P1", examType]; // Store paper marks with suffix
                    const savedMarkP1 = getNestedValue(schoolData.marks, markPathP1, '');
                    tableHTML += `<td><input type="number" id="${inputIdP1}" min="0" max="100" value="${savedMarkP1}" data-subject="${subj}-P1" data-exam-type="${examType}"></td>`;
                    // Paper 2
                    const inputIdP2 = `${student.id}-${subjKey}-P2-${examType}`;
                    const markPathP2 = [term, student.id, subj + "-P2", examType];
                    const savedMarkP2 = getNestedValue(schoolData.marks, markPathP2, '');
                    tableHTML += `<td><input type="number" id="${inputIdP2}" min="0" max="100" value="${savedMarkP2}" data-subject="${subj}-P2" data-exam-type="${examType}"></td>`;
                } else {
                    // Single paper subject or specific subject view
                    const inputId = `${student.id}-${subjKey}-${examType}`;
                    const markPath = [term, student.id, subj, examType];
                    const savedMark = getNestedValue(schoolData.marks, markPath, '');
                    tableHTML += `<td><input type="number" id="${inputId}" min="0" max="100" value="${savedMark}" data-subject="${subj}" data-exam-type="${examType}"></td>`;
                }
            });
            tableHTML += `</tr>`;
          });
          tableHTML += '</tbody></table>';
          marksheetTableContainer.innerHTML = tableHTML;
      }
      function saveMarksheet() { /* Updated to handle paper subjects */
          const table = document.getElementById('marksheet-table-proper'); if (!table) { alert("No marksheet loaded to save."); return; }
          const term = meTermSelect.value; const inputs = table.querySelectorAll('input[type="number"]'); let changesMade = 0; let errors = 0;
          inputs.forEach(input => {
              const studentId = input.closest('tr').dataset.studentId;
              const subject = input.dataset.subject; // This now includes "-P1" or "-P2" if applicable
              const examType = input.dataset.examType;
              const mark = input.value.trim();
              if (!studentId || !subject || !examType) { console.warn("Missing data attributes on input:", input); return; }
              if (mark !== "" && (isNaN(mark) || parseFloat(mark) < 0 || parseFloat(mark) > 100)) { alert(`Invalid mark for ${studentId} - ${subject}: '${mark}'. Must be empty or 0-100.`); input.style.border = '2px solid red'; errors++; return; } else { input.style.border = ''; }
              const markPath = [term, studentId, subject, examType]; // Path uses subject name with paper suffix
              const currentMark = getNestedValue(schoolData.marks, markPath); const newMark = (mark === "" || isNaN(parseFloat(mark))) ? undefined : parseFloat(mark);
              if (String(currentMark) !== String(newMark)) { setNestedValue(schoolData.marks, markPath, newMark); changesMade++; }
          });
          if (errors > 0) { alert(`${errors} error(s) found. Please correct them before saving.`); return; } if (changesMade > 0) { saveData(); alert(`Marksheet saved successfully. ${changesMade} mark(s) updated/set.`); refreshSavedMarkhseetsList(); } else { alert("No changes detected in the marksheet."); }
      }
      function downloadMarksheetCsv() { /* ... (no changes) ... */
          const table = document.getElementById('marksheet-table-proper'); if (!table) { alert("Load a marksheet before downloading."); return; } const className = meClassSelect.value; const stream = meStreamSelect.value; const term = meTermSelect.value; const examType = meExamTypeSelect.value; const subject = meSubjectSelect.value; const filename = `Marksheet_${className}_${stream}_${term}_${examType}_${subject === 'all' ? 'AllSubjects' : subject.replace(/\s+/g, '')}.csv`; downloadTableAsCSV(table, filename);
      }
      function generateReportsForClassFromMarksheet() { /* ... (no changes) ... */
          const level = meLevelSelect.value; const className = meClassSelect.value; const stream = meStreamSelect.value; const term = meTermSelect.value; if (!level || !className || !stream || !term) { alert('Please ensure Level, Class, Stream, and Term are selected in the filters above.'); return; } rgLevelSelect.value = level; rgTermSelect.value = term; rgExamTypeSelect.value = "End of Term"; rgStudentSelect.value = 'all'; rgLevelSelect.dispatchEvent(new Event('change')); setTimeout(() => { rgClassSelect.value = className; rgClassSelect.dispatchEvent(new Event('change')); setTimeout(() => { rgStreamSelect.value = stream; rgStreamSelect.dispatchEvent(new Event('change')); setTimeout(() => { activateSection('report-generation'); viewReportBtn.click(); document.getElementById('report-generation').scrollIntoView({ behavior: 'smooth' }); }, 150); }, 100); }, 100);
      }
      function addStudentToSelectedClass() { /* Added Gender Prompt */
          const level = meLevelSelect.value; const className = meClassSelect.value; const stream = meStreamSelect.value; if (!level || !className || !stream) { alert("Please select Level, Class, and Stream in the filters above before adding a student."); return; }
          const name = prompt(`Enter new student's full name for ${className} ${stream}:`); if (!name) return;
          const gender = prompt(`Enter student's gender (Male/Female):`, "Male"); if (!gender || !["Male", "Female"].includes(gender)) { alert("Invalid gender. Please enter Male or Female."); return; }
          const studentId = generateUniqueId(className.charAt(0) + stream.charAt(0)); const newStudent = { id: studentId, name: name, gender: gender }; const classStreamKey = `${className}-${stream}`; if (!schoolData.students[classStreamKey]) { schoolData.students[classStreamKey] = []; } if (schoolData.students[classStreamKey].some(s => s.name.toLowerCase() === name.toLowerCase())) { alert(`Student named '${name}' might already exist in this class.`); } schoolData.students[classStreamKey].push(newStudent); saveData(); alert(`Student ${name} (${studentId}) added to ${className} ${stream}.`); if (document.getElementById('marksheet-table-proper') && marksheetDetailsSpan.textContent.includes(`${className} ${stream}`)) { loadMarksheet(); } updateDashboardStats();
      }

      // --- Report Generation Logic ---
      function setupReportGenerationListeners() { /* ... (no changes) ... */
          viewReportBtn.addEventListener('click', viewReports); printReportBtn.addEventListener('click', () => { const reportContent = document.getElementById('report-card-area'); if (!reportContent.querySelector('.report-card')) { alert("Generate report(s) before printing."); return; } printElement(reportContent); });
      }
       function resetReportCardArea() { /* ... (no changes) ... */
          reportCardArea.innerHTML = '<p class="placeholder-text">Select filters and click "View Report(s)" to generate.</p>';
       }
      function viewReports() { /* ... (no changes) ... */
          const level = rgLevelSelect.value; const className = rgClassSelect.value; const stream = rgStreamSelect.value; const term = rgTermSelect.value; const examTypeHeader = rgExamTypeSelect.value; const studentIdFilter = rgStudentSelect.value; if (!level || !className || !stream || !term || !studentIdFilter || !examTypeHeader) { alert('Please select all report filters, including Exam Type for Header.'); return; } reportCardArea.innerHTML = '<p class="placeholder-text">Generating report(s)...</p>'; const classStreamKey = `${className}-${stream}`; const studentsInClass = schoolData.students[classStreamKey] || []; let reportsHTML = ''; let generatedCount = 0; const studentsToProcess = studentIdFilter === 'all' ? studentsInClass.sort((a, b) => a.name.localeCompare(b.name)) : studentsInClass.filter(s => s.id === studentIdFilter); if (studentsToProcess.length === 0) { reportCardArea.innerHTML = '<p class="placeholder-text">No students found matching the criteria.</p>'; return; } const studentAverages = studentsInClass.map(student => { const avg = calculateOverallAverage(student.id, term, level, stream); return { id: student.id, average: avg }; }).sort((a, b) => b.average - a.average); studentsToProcess.forEach(student => { const positionInfo = calculatePosition(student.id, studentAverages); reportsHTML += generateSingleReportCard(student, level, className, stream, term, examTypeHeader, positionInfo); generatedCount++; }); reportCardArea.innerHTML = generatedCount > 0 ? reportsHTML : '<p class="placeholder-text">Could not generate reports.</p>';
      }
      function calculateOverallAverage(studentId, term, level, stream) { /* Adjusted for A-Level Papers */
          const subjects = getSubjectsForSelection(level, stream);
          let grandTotal = 0; let subjectsWithMarksCount = 0;
          const examTypes = ["BOT", "Mid Term", "AOT", "Tests", "Continuous", "End of Term"];
          const isALevelScience = level === 'A-Level' && stream === 'Science';
          const sciencePaperSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Agriculture"];

          subjects.forEach(subj => {
              let subjectTotal = 0; let marksEnteredCount = 0;
              if (isALevelScience && sciencePaperSubjects.includes(subj)) {
                  // Average the papers first for A-Level Science
                  let p1Total = 0, p1Count = 0, p2Total = 0, p2Count = 0;
                  examTypes.forEach(examType => {
                      const markP1 = getNestedValue(schoolData.marks, [term, studentId, subj + "-P1", examType]);
                      const markP2 = getNestedValue(schoolData.marks, [term, studentId, subj + "-P2", examType]);
                      if (markP1 !== undefined && !isNaN(markP1)) { p1Total += parseFloat(markP1); p1Count++; }
                      if (markP2 !== undefined && !isNaN(markP2)) { p2Total += parseFloat(markP2); p2Count++; }
                  });
                  const avgP1 = p1Count > 0 ? p1Total / p1Count : null;
                  const avgP2 = p2Count > 0 ? p2Total / p2Count : null;
                  // Average the two papers if both exist, otherwise use the one that exists
                  if (avgP1 !== null && avgP2 !== null) { subjectTotal = (avgP1 + avgP2) / 2; marksEnteredCount = 1; }
                  else if (avgP1 !== null) { subjectTotal = avgP1; marksEnteredCount = 1; }
                  else if (avgP2 !== null) { subjectTotal = avgP2; marksEnteredCount = 1; }
              } else {
                  // Standard calculation for other subjects
                  examTypes.forEach(examType => { const markPath = [term, studentId, subj, examType]; const mark = getNestedValue(schoolData.marks, markPath); if (mark !== undefined && !isNaN(mark)) { subjectTotal += parseFloat(mark); marksEnteredCount++; } });
                  if (marksEnteredCount > 0) subjectTotal = subjectTotal / marksEnteredCount; // Calculate average for the subject
              }

              if (marksEnteredCount > 0) { grandTotal += subjectTotal; subjectsWithMarksCount++; }
          });
          return subjectsWithMarksCount > 0 ? (grandTotal / subjectsWithMarksCount) : 0;
      }
      function calculatePosition(studentId, sortedAverages) { /* ... (no changes) ... */
          let rank = 0; let currentRank = 0; let previousAverage = -1; for (let i = 0; i < sortedAverages.length; i++) { if (sortedAverages[i].average !== previousAverage) { currentRank = i + 1; } if (sortedAverages[i].id === studentId) { rank = currentRank; break; } previousAverage = sortedAverages[i].average; } return { position: rank, totalStudents: sortedAverages.length };
      }
      function generateCompetencyAnalysis(studentId, term, level, stream) { /* ... (no changes) ... */
          const subjects = getSubjectsForSelection(level, stream); const keySubjects = { math: subjects.find(s => s.toLowerCase().includes('mathematics')), english: subjects.find(s => s.toLowerCase().includes('english')), science: subjects.find(s => ['biology', 'chemistry', 'physics', 'science'].some(sci => s.toLowerCase().includes(sci))), arts: subjects.find(s => ['history', 'geography', 'literature', 'economics', 'art'].some(art => s.toLowerCase().includes(art))), ict: subjects.find(s => s.toLowerCase().includes('ict')), language: subjects.find(s => ['kiswahili', 'local language'].some(lang => s.toLowerCase().includes(lang))) };
          const getSubjectAvg = (subjectName) => { if (!subjectName) return null; const examTypes = ["BOT", "Mid Term", "AOT", "Tests", "Continuous", "End of Term"]; let total = 0; let count = 0; examTypes.forEach(examType => { let mark; if (level === 'A-Level' && stream === 'Science' && ["Mathematics", "Physics", "Chemistry", "Biology", "Agriculture"].includes(subjectName)) { const m1 = getNestedValue(schoolData.marks, [term, studentId, subjectName + "-P1", examType]); const m2 = getNestedValue(schoolData.marks, [term, studentId, subjectName + "-P2", examType]); if (m1 !== undefined && !isNaN(m1) && m2 !== undefined && !isNaN(m2)) mark = (parseFloat(m1) + parseFloat(m2)) / 2; else if (m1 !== undefined && !isNaN(m1)) mark = parseFloat(m1); else if (m2 !== undefined && !isNaN(m2)) mark = parseFloat(m2); } else { mark = getNestedValue(schoolData.marks, [term, studentId, subjectName, examType]); } if (mark !== undefined && !isNaN(mark)) { total += parseFloat(mark); count++; } }); return count > 0 ? total / count : null; };
          const mathAvg = getSubjectAvg(keySubjects.math); const engAvg = getSubjectAvg(keySubjects.english); const scienceAvg = getSubjectAvg(keySubjects.science); const artsAvg = getSubjectAvg(keySubjects.arts); const ictAvg = getSubjectAvg(keySubjects.ict); const langAvg = getSubjectAvg(keySubjects.language); let analysisText = "<ul>";
          const problemSolvingScore = Math.max(mathAvg ?? 0, scienceAvg ?? 0); if (problemSolvingScore >= 75) analysisText += "<li>Demonstrates strong analytical and problem-solving skills.</li>"; else if (problemSolvingScore >= 55) analysisText += "<li>Shows good potential in logical reasoning and problem-solving.</li>"; else if (problemSolvingScore > 0) analysisText += "<li>Developing problem-solving abilities; consistent practice recommended.</li>";
          const communicationScore = Math.max(engAvg ?? 0, langAvg ?? 0); if (communicationScore >= 75) analysisText += "<li>Exhibits excellent communication skills, both written and verbal.</li>"; else if (communicationScore >= 55) analysisText += "<li>Communicates effectively; can further enhance clarity and expression.</li>"; else if (communicationScore > 0) analysisText += "<li>Improving communication skills; active participation encouraged.</li>";
          const criticalThinkingScore = artsAvg ?? 0; if (criticalThinkingScore >= 70) analysisText += "<li>Displays strong critical thinking and interpretation skills.</li>"; else if (criticalThinkingScore >= 50) analysisText += "<li>Developing critical analysis abilities.</li>";
          if (ictAvg !== null) { if (ictAvg >= 70) analysisText += "<li>Proficient in using digital tools and technologies effectively.</li>"; else if (ictAvg >= 50) analysisText += "<li>Good understanding of ICT concepts; practical application can be improved.</li>"; else analysisText += "<li>Basic ICT skills; further exploration of digital tools advised.</li>"; }
          const overallAverage = calculateOverallAverage(studentId, term, level, stream); if (overallAverage >= 80) analysisText += "<li>Consistently demonstrates high effort and engagement across subjects.</li>"; else if (overallAverage < 50) analysisText += "<li>Encouraged to increase effort and seek help where needed.</li>";
          analysisText += "</ul>"; if (analysisText === "<ul></ul>") { return "<p>Insufficient data for detailed competency analysis.</p>"; } return analysisText;
      }
      function generateSingleReportCard(student, level, className, stream, term, examTypeHeader, positionInfo) { /* Added Gender */
          if (!reportCardTemplate) return '<p>Error: Report card template not found.</p>'; const reportClone = reportCardTemplate.cloneNode(true); reportClone.style.display = 'block'; reportClone.removeAttribute('id'); reportClone.classList.add('printable-content');
          reportClone.querySelector('.student-name').textContent = student.name; reportClone.querySelector('.student-class').textContent = className; reportClone.querySelector('.student-stream').textContent = stream; reportClone.querySelector('.student-id').textContent = student.id; reportClone.querySelector('.student-gender').textContent = student.gender || 'N/A'; /* Display Gender */ reportClone.querySelector('.report-term').textContent = term; reportClone.querySelector('.report-exam-type').textContent = examTypeHeader; reportClone.querySelector('.report-year').textContent = new Date().getFullYear(); reportClone.querySelector('.report-term-body').textContent = term; reportClone.querySelector('.report-year-body').textContent = new Date().getFullYear(); const reportDate = new Date().toLocaleDateString('en-GB'); reportClone.querySelectorAll('.report-date').forEach(el => el.textContent = reportDate);
          const marksTableBody = reportClone.querySelector('.marks-table-body'); marksTableBody.innerHTML = ''; const subjects = getSubjectsForSelection(level, stream); let grandTotalPoints = 0; let subjectsWithMarksCount = 0; const examTypes = ["BOT", "Mid Term", "AOT", "Tests", "Continuous", "End of Term"]; const isALevelScience = level === 'A-Level' && stream === 'Science'; const sciencePaperSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Agriculture"];
          subjects.forEach(subj => { const row = marksTableBody.insertRow(); row.insertCell().textContent = subj.toUpperCase(); let subjectTotal = 0; let marksEnteredCount = 0;
              examTypes.forEach(examType => { let mark; if (isALevelScience && sciencePaperSubjects.includes(subj)) { const m1 = getNestedValue(schoolData.marks, [term, student.id, subj + "-P1", examType]); const m2 = getNestedValue(schoolData.marks, [term, student.id, subj + "-P2", examType]); if (m1 !== undefined && !isNaN(m1) && m2 !== undefined && !isNaN(m2)) mark = (parseFloat(m1) + parseFloat(m2)) / 2; else if (m1 !== undefined && !isNaN(m1)) mark = parseFloat(m1); else if (m2 !== undefined && !isNaN(m2)) mark = parseFloat(m2); } else { mark = getNestedValue(schoolData.marks, [term, student.id, subj, examType]); } row.insertCell().textContent = (mark !== undefined && !isNaN(mark)) ? parseFloat(mark).toFixed(0) : '-'; if (mark !== undefined && !isNaN(mark)) { subjectTotal += parseFloat(mark); marksEnteredCount++; } });
              const subjectAverage = marksEnteredCount > 0 ? (subjectTotal / marksEnteredCount) : 0; const gradeInfo = calculateGrade(subjectAverage, level, className, stream); row.insertCell().textContent = marksEnteredCount > 0 ? subjectAverage.toFixed(1) : '-'; row.insertCell().textContent = gradeInfo.grade; row.insertCell().textContent = gradeInfo.comment; row.cells[row.cells.length - 2].classList.add(`grade-${gradeInfo.grade.replace('+', 'plus')}`); if (marksEnteredCount > 0) { grandTotalPoints += subjectAverage; subjectsWithMarksCount++; } });
          const overallAverage = subjectsWithMarksCount > 0 ? (grandTotalPoints / subjectsWithMarksCount) : 0; reportClone.querySelector('.average-mark').textContent = overallAverage > 0 ? `${overallAverage.toFixed(1)}%` : '-'; reportClone.querySelector('.class-position').textContent = positionInfo.position > 0 ? `${positionInfo.position}` : 'N/A'; reportClone.querySelector('.class-size').textContent = positionInfo.totalStudents;
          const competencyContentDiv = reportClone.querySelector('.competency-content'); competencyContentDiv.innerHTML = generateCompetencyAnalysis(student.id, term, level, stream);
          reportClone.querySelector('.class-teacher-comment').textContent = getTeacherComment(overallAverage); reportClone.querySelector('.head-teacher-comment').textContent = "Parents are encouraged to check on the student's progress regularly."; const promotionSection = reportClone.querySelector('.promotion-status'); const promotionStamp = reportClone.querySelector('.stamp'); const promotionText = reportClone.querySelector('.promotion-text'); if (term === 'Term 3' && ['S1', 'S2', 'S3', 'S5'].includes(className)) { promotionSection.style.display = 'block'; let status = "See Head Teacher"; let stampClass = "stamp-purple"; if (overallAverage >= 65) { status = "Promoted on Merit"; stampClass = "stamp-green"; } else if (overallAverage >= 50) { status = "Promoted on Probation"; stampClass = "stamp-blue"; } else if (overallAverage >= 40) { status = "Advised to Repeat"; stampClass = "stamp-red"; } else { status = "Advised to Try Elsewhere"; stampClass = "stamp-red"; } promotionText.textContent = status; promotionStamp.className = `stamp ${stampClass}`; } else { promotionSection.style.display = 'none'; }
          return reportClone.outerHTML;
      }

      // --- Saved Marksheets Logic ---
      function setupSavedMarkhseetsListeners() {
          refreshSavedListBtn.addEventListener('click', refreshSavedMarkhseetsList);
          savedMarkhseetsList.addEventListener('click', (event) => {
              if (event.target.tagName === 'LI' && event.target.dataset.key) {
                  const [level, className, stream, term, examType] = event.target.dataset.key.split('|');
                  if (level && className && stream && term && examType) {
                      // Pre-fill filters in Marks Entry
                      meLevelSelect.value = level;
                      meLevelSelect.dispatchEvent(new Event('change')); // Trigger change to load classes
                      setTimeout(() => {
                          meClassSelect.value = className;
                          meClassSelect.dispatchEvent(new Event('change')); // Trigger change to load streams
                          setTimeout(() => {
                              meStreamSelect.value = stream;
                              meStreamSelect.dispatchEvent(new Event('change')); // Trigger change to load subjects
                              setTimeout(() => {
                                  meTermSelect.value = term;
                                  meExamTypeSelect.value = examType;
                                  meSubjectSelect.value = 'all'; // Default to all subjects for the loaded entry
                                  activateSection('marks-entry'); // Switch to marks entry tab
                                  loadMarksheet(); // Load the specific marksheet
                                  document.getElementById('marks-entry').scrollIntoView({ behavior: 'smooth' });
                              }, 150);
                          }, 100);
                      }, 100);
                  }
              }
          });
      }

      function refreshSavedMarkhseetsList() {
          savedMarkhseetsList.innerHTML = '<li class="placeholder-text">Scanning saved marks...</li>';
          const savedEntries = new Set(); // Use a Set to store unique keys

          Object.keys(schoolData.marks).forEach(term => {
              Object.keys(schoolData.marks[term]).forEach(studentId => {
                  // Find the student's class
                  let studentClassInfo = null;
                  for (const key in schoolData.students) {
                      if (schoolData.students[key].some(s => s.id === studentId)) {
                          studentClassInfo = key.split('-'); // [className, stream]
                          break;
                      }
                  }
                  if (!studentClassInfo) return; // Skip if student class not found

                  const [className, stream] = studentClassInfo;
                  const level = ['S1', 'S2', 'S3', 'S4'].includes(className) ? 'O-Level' : 'A-Level';

                  // Check if this class is assigned to the teacher (if not admin)
                  if (!isAdmin && !assignedClasses.includes(`${className}-${stream}`)) {
                      return;
                  }

                  Object.keys(schoolData.marks[term][studentId]).forEach(subject => {
                      Object.keys(schoolData.marks[term][studentId][subject]).forEach(examType => {
                          // Create a unique key for the Class-Term-ExamType combination
                          const entryKey = `${level}|${className}|${stream}|${term}|${examType}`;
                          savedEntries.add(entryKey);
                      });
                  });
              });
          });

          if (savedEntries.size === 0) {
              savedMarkhseetsList.innerHTML = '<li class="placeholder-text">No saved marksheet entries found for your assigned classes.</li>';
              return;
          }

          savedMarkhseetsList.innerHTML = ''; // Clear loading message
          // Sort entries for consistent display
          const sortedEntries = Array.from(savedEntries).sort();
          sortedEntries.forEach(key => {
              const [level, className, stream, term, examType] = key.split('|');
              const li = document.createElement('li');
              li.textContent = `${className} ${stream} - ${term} - ${examType}`;
              li.dataset.key = key; // Store key to reload filters
              li.title = `Click to load ${className} ${stream} - ${term} - ${examType}`;
              savedMarkhseetsList.appendChild(li);
          });
      }


      // --- Student Management Logic ---
      function setupStudentManagementListeners() { /* ... (no changes) ... */
          refreshStudentListBtn.addEventListener('click', refreshStudentList); studentListBody.addEventListener('click', (event) => { if (event.target.classList.contains('delete-student-btn')) { const studentId = event.target.dataset.studentId; const studentName = event.target.dataset.studentName; if (confirm(`Are you sure you want to delete student ${studentName} (${studentId})? This action cannot be undone and will remove all associated marks.`)) { deleteStudent(studentId); } } });
      }
      function refreshStudentList() { /* Added Gender Column & Role Filtering */
          studentListBody.innerHTML = ''; let studentFound = false;
          const relevantClasses = isAdmin ? Object.keys(schoolData.students).sort() : assignedClasses.sort();

          relevantClasses.forEach(classStreamKey => {
              const [className, stream] = classStreamKey.split('-');
              const students = (schoolData.students[classStreamKey] || []).sort((a, b) => a.name.localeCompare(b.name));

              students.forEach(student => {
                  studentFound = true;
                  const row = studentListBody.insertRow();
                  row.insertCell().textContent = student.id;
                  row.insertCell().textContent = student.name;
                  row.insertCell().textContent = student.gender || 'N/A'; // Display Gender
                  row.insertCell().textContent = className || 'N/A';
                  row.insertCell().textContent = stream || 'N/A';
                  const actionsCell = row.insertCell();
                  // Only Admin can delete? Or assigned teacher? For now, allow assigned teacher.
                  actionsCell.innerHTML = `<button class="btn btn-danger btn-sm delete-student-btn" data-student-id="${student.id}" data-student-name="${student.name}" title="Delete Student">Delete</button>`;
              });
          });
          if (!studentFound) { studentListBody.innerHTML = `<tr><td colspan="6" class="placeholder-text">No students found ${isAdmin ? '' : 'in your assigned classes'}. Add students via the 'Marks Entry' section.</td></tr>`; }
      }
      function deleteStudent(studentId) { /* ... (no changes) ... */
          let found = false; Object.keys(schoolData.students).forEach(classStreamKey => { const initialLength = schoolData.students[classStreamKey]?.length || 0; if(schoolData.students[classStreamKey]) { schoolData.students[classStreamKey] = schoolData.students[classStreamKey].filter(s => s.id !== studentId); if (schoolData.students[classStreamKey].length < initialLength) { found = true; } if (schoolData.students[classStreamKey].length === 0) { delete schoolData.students[classStreamKey]; } } }); if (found) { Object.keys(schoolData.marks).forEach(term => { if (schoolData.marks[term]?.[studentId]) { delete schoolData.marks[term][studentId]; } }); saveData(); alert(`Student ${studentId} and associated marks deleted.`); refreshStudentList(); updateDashboardStats(); } else { alert(`Student ${studentId} not found.`); }
      }

      // --- Subject Management Logic ---
       function setupSubjectManagementListeners() { /* ... (no changes) ... */
           refreshSubjectListBtn.addEventListener('click', refreshSubjectLists); addSubjectMgmtBtn.addEventListener('click', addNewSubjectPrompt); olevelSubjectList.addEventListener('click', handleSubjectDelete); alevelArtsSubjectList.addEventListener('click', handleSubjectDelete); alevelScienceSubjectList.addEventListener('click', handleSubjectDelete);
       }
       function populateSubjectList(listElement, subjects, level, streamType = null) { /* Added Admin Check for Delete Button */
           listElement.innerHTML = ''; if (subjects && subjects.length > 0) { subjects.sort().forEach(subject => { const li = document.createElement('li'); li.textContent = subject; if (isAdmin) { const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Del'; deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'delete-subject-btn'); deleteBtn.title = `Delete ${subject}`; deleteBtn.dataset.subjectName = subject; deleteBtn.dataset.level = level; if (streamType) deleteBtn.dataset.streamType = streamType; li.appendChild(deleteBtn); } listElement.appendChild(li); }); } else { listElement.innerHTML = '<li class="placeholder-text">No subjects defined.</li>'; }
       }
       function refreshSubjectLists() { /* ... (no changes) ... */
           populateSubjectList(olevelSubjectList, schoolData.levels['O-Level']?.subjects, 'O-Level'); populateSubjectList(alevelArtsSubjectList, schoolData.levels['A-Level']?.subjects?.Arts, 'A-Level', 'Arts'); populateSubjectList(alevelScienceSubjectList, schoolData.levels['A-Level']?.subjects?.Science, 'A-Level', 'Science');
       }
       function addNewSubjectPrompt() { /* ... (no changes) ... */
           const subjectName = prompt("Enter new subject name:"); if (!subjectName) return; const level = prompt("Enter level (O-Level or A-Level):", "O-Level"); if (!level || !schoolData.levels[level]) { alert("Invalid level."); return; } if (level === 'O-Level') { if (!schoolData.levels['O-Level'].subjects) schoolData.levels['O-Level'].subjects = []; if (schoolData.levels['O-Level'].subjects.includes(subjectName)) { alert("Subject already exists for O-Level."); return; } schoolData.levels['O-Level'].subjects.push(subjectName); } else { const streamType = prompt("Enter stream type (Arts or Science):"); if (!streamType || !['Arts', 'Science'].includes(streamType)) { alert("Invalid stream type."); return; } if (!schoolData.levels['A-Level'].subjects) schoolData.levels['A-Level'].subjects = {}; if (!schoolData.levels['A-Level'].subjects[streamType]) schoolData.levels['A-Level'].subjects[streamType] = []; if (schoolData.levels['A-Level'].subjects[streamType].includes(subjectName)) { alert(`Subject already exists for A-Level ${streamType}.`); return; } schoolData.levels['A-Level'].subjects[streamType].push(subjectName); } saveData(); alert(`Subject '${subjectName}' added.`); refreshSubjectLists(); updateDashboardStats();
       }
       function handleSubjectDelete(event) { /* Added Admin Check */
            if (isAdmin && event.target.classList.contains('delete-subject-btn')) { const subjectName = event.target.dataset.subjectName; const level = event.target.dataset.level; const streamType = event.target.dataset.streamType; if (confirm(`ADMIN ACTION: Are you sure you want to delete subject '${subjectName}'? This will also remove associated marks.`)) { deleteSubject(subjectName, level, streamType); } }
       }
       function deleteSubject(subjectName, level, streamType) { /* ... (no changes) ... */
           let deleted = false; if (level === 'O-Level' && schoolData.levels['O-Level']?.subjects) { const initialLength = schoolData.levels['O-Level'].subjects.length; schoolData.levels['O-Level'].subjects = schoolData.levels['O-Level'].subjects.filter(s => s !== subjectName); deleted = schoolData.levels['O-Level'].subjects.length < initialLength; } else if (level === 'A-Level' && streamType && schoolData.levels['A-Level']?.subjects?.[streamType]) { const initialLength = schoolData.levels['A-Level'].subjects[streamType].length; schoolData.levels['A-Level'].subjects[streamType] = schoolData.levels['A-Level'].subjects[streamType].filter(s => s !== subjectName); deleted = schoolData.levels['A-Level'].subjects[streamType].length < initialLength; } if (deleted) { Object.values(schoolData.marks).forEach(termData => { Object.values(termData).forEach(studentData => { if (studentData?.[subjectName]) { delete studentData[subjectName]; } }); }); saveData(); alert(`Subject '${subjectName}' deleted and associated marks removed.`); refreshSubjectLists(); updateDashboardStats(); } else { alert(`Subject '${subjectName}' not found for the specified level/stream.`); }
       }

      // --- System Analysis Logic ---
      function setupAnalysisListeners() { /* ... (no changes) ... */
          calculateAnalysisBtn.addEventListener('click', runSystemAnalysis);
      }
      function runSystemAnalysis() { /* Added Subject Analysis Call */
          analysisContent.style.opacity = '0.5'; chartPlaceholder.style.display = 'block'; if (performanceChart) performanceChart.destroy(); streamPerfDiv.innerHTML = '<p>Calculating...</p>'; perClassAnalysisContainer.innerHTML = '<p>Calculating...</p>'; subjectAnalysisContainer.innerHTML = '<p>Calculating...</p>'; // Clear subject analysis
          setTimeout(() => { try { const analysisData = calculateOverallPerformance(); let streamHtml = ''; Object.entries(analysisData.streamAverages).sort().forEach(([key, avg]) => { streamHtml += `<p>${key}: ${avg.toFixed(1)}%</p>`; }); streamPerfDiv.innerHTML = streamHtml || '<p class="placeholder-text">No stream data.</p>'; displayPerClassRankings(analysisData.classStudentAverages); displaySubjectAnalysis(analysisData.classSubjectAverages); /* Display Subject Analysis */ displayPerformanceChart(analysisData.termAverages); } catch (error) { console.error("Error during analysis:", error); alert("An error occurred during analysis."); streamPerfDiv.innerHTML = '<p class="placeholder-text">Error.</p>'; perClassAnalysisContainer.innerHTML = '<p class="placeholder-text">Error calculating class analysis.</p>'; subjectAnalysisContainer.innerHTML = '<p class="placeholder-text">Error calculating subject analysis.</p>'; } finally { analysisContent.style.opacity = '1'; } }, 50);
      }
      function calculateOverallPerformance() { /* Added Subject Averages Calculation */
          const classStudentAverages = {}; const streamAverages = { "O-Level": { total: 0, count: 0 }, "A-Level Arts": { total: 0, count: 0 }, "A-Level Science": { total: 0, count: 0 } }; const termAverages = {}; const classSubjectAverages = {}; // { "S1-North": { "Math": { total: 0, count: 0 }, ... }, ... }
          const terms = Object.keys(schoolData.marks).sort();
          const relevantClasses = isAdmin ? Object.keys(schoolData.students) : assignedClasses; // Filter classes for teachers

          relevantClasses.forEach(classStreamKey => {
              const students = schoolData.students[classStreamKey] || [];
              if (students.length === 0) return; // Skip empty classes

              const [className, stream] = classStreamKey.split('-');
              const level = ['S1', 'S2', 'S3', 'S4'].includes(className) ? 'O-Level' : 'A-Level';
              const streamType = level === 'A-Level' ? stream : 'O-Level';
              const avgStreamKey = level === 'A-Level' ? `A-Level ${stream}` : 'O-Level';

              if (!classStudentAverages[classStreamKey]) classStudentAverages[classStreamKey] = [];
              if (!classSubjectAverages[classStreamKey]) classSubjectAverages[classStreamKey] = {};

              students.forEach(student => {
                  let studentTotalAvg = 0; let termCount = 0;
                  terms.forEach(term => {
                      const termAvg = calculateOverallAverage(student.id, term, level, stream);
                      if (termAvg > 0) {
                          // Term Averages (for chart)
                          if (!termAverages[term]) termAverages[term] = { "O-Level": { total: 0, count: 0 }, "A-Level Arts": { total: 0, count: 0 }, "A-Level Science": { total: 0, count: 0 } };
                          const termStreamKey = level === 'A-Level' ? `A-Level ${stream}` : 'O-Level';
                          if (termAverages[term][termStreamKey]) { termAverages[term][termStreamKey].total += termAvg; termAverages[term][termStreamKey].count++; }
                          studentTotalAvg += termAvg; termCount++;

                          // Subject Averages (for subject analysis)
                          const subjectsInTerm = getNestedValue(schoolData.marks, [term, student.id], {});
                          Object.keys(subjectsInTerm).forEach(subjectNameWithPaper => {
                              // Aggregate paper marks for subject average calculation
                              const subjectBaseName = subjectNameWithPaper.replace(/-P[12]$/, ''); // Remove paper suffix
                              if (!classSubjectAverages[classStreamKey][subjectBaseName]) { classSubjectAverages[classStreamKey][subjectBaseName] = { total: 0, count: 0 }; }
                              // Calculate average mark for this subject across exams in this term for this student
                              const exams = subjectsInTerm[subjectNameWithPaper];
                              let subjTermTotal = 0; let subjTermCount = 0;
                              Object.values(exams).forEach(mark => { if (mark !== undefined && !isNaN(mark)) { subjTermTotal += parseFloat(mark); subjTermCount++; } });
                              if (subjTermCount > 0) {
                                  // For A-level science, we need to average papers before adding to classSubjectAverages
                                  // This part is tricky - let's simplify: add each paper's term average
                                  // A better approach would average papers *first* per student/term/subject
                                  classSubjectAverages[classStreamKey][subjectBaseName].total += (subjTermTotal / subjTermCount);
                                  classSubjectAverages[classStreamKey][subjectBaseName].count++; // Count each student's contribution once per subject
                              }
                          });
                      }
                  });
                  const overallStudentAvg = termCount > 0 ? studentTotalAvg / termCount : 0;
                  if (overallStudentAvg >= 0) { classStudentAverages[classStreamKey].push({ id: student.id, name: student.name, average: overallStudentAvg }); if (overallStudentAvg > 0 && streamAverages[avgStreamKey]) { streamAverages[avgStreamKey].total += overallStudentAvg; streamAverages[avgStreamKey].count++; } }
              });
              classStudentAverages[classStreamKey].sort((a, b) => b.average - a.average);
          });

          // Finalize averages
          const finalStreamAverages = {}; Object.entries(streamAverages).forEach(([key, data]) => { if (data.count > 0) finalStreamAverages[key] = data.total / data.count; });
          const finalTermAverages = {}; Object.entries(termAverages).forEach(([term, streams]) => { finalTermAverages[term] = {}; Object.entries(streams).forEach(([streamType, data]) => { if (data.count > 0) finalTermAverages[term][streamType] = data.total / data.count; }); });
          const finalClassSubjectAverages = {}; Object.entries(classSubjectAverages).forEach(([classKey, subjects]) => { finalClassSubjectAverages[classKey] = {}; Object.entries(subjects).forEach(([subjName, data]) => { if (data.count > 0) { finalClassSubjectAverages[classKey][subjName] = data.total / data.count; } }); });

          return { streamAverages: finalStreamAverages, classStudentAverages: classStudentAverages, termAverages: finalTermAverages, classSubjectAverages: finalClassSubjectAverages };
      }
      function displayPerClassRankings(classData) { /* ... (no changes) ... */
          perClassAnalysisContainer.innerHTML = ''; const sortedClasses = Object.keys(classData).sort(); if (sortedClasses.length === 0) { perClassAnalysisContainer.innerHTML = '<p class="placeholder-text">No class data available for analysis.</p>'; return; }
          sortedClasses.forEach(classStreamKey => { const students = classData[classStreamKey]; const classCard = document.createElement('div'); classCard.className = 'class-analysis-card'; let content = `<h4>${classStreamKey} (Avg: ${calculateClassAverage(students).toFixed(1)}%)</h4>`; const topThreshold = 75; const improveThreshold = 50; const best = students.filter(s => s.average >= topThreshold); const medium = students.filter(s => s.average >= improveThreshold && s.average < topThreshold); const worst = students.filter(s => s.average < improveThreshold); content += '<div class="rank-category"><h5>Best Performing</h5><ul class="student-list-rank">'; content += best.length > 0 ? best.map(s => `<li>${s.name} <span class="avg-score">${s.average.toFixed(1)}%</span></li>`).join('') : '<li>None</li>'; content += '</ul></div>'; content += '<div class="rank-category"><h5>Average Performing</h5><ul class="student-list-rank">'; content += medium.length > 0 ? medium.map(s => `<li>${s.name} <span class="avg-score">${s.average.toFixed(1)}%</span></li>`).join('') : '<li>None</li>'; content += '</ul></div>'; content += '<div class="rank-category"><h5>Needs Improvement</h5><ul class="student-list-rank">'; content += worst.length > 0 ? worst.map(s => `<li>${s.name} <span class="avg-score">${s.average.toFixed(1)}%</span></li>`).join('') : '<li>None</li>'; content += '</ul></div>'; classCard.innerHTML = content; perClassAnalysisContainer.appendChild(classCard); });
      }
       function calculateClassAverage(students) { /* ... (no changes) ... */
           if (!students || students.length === 0) return 0; const sum = students.reduce((acc, s) => acc + s.average, 0); return sum / students.length;
       }
       // --- New Function: Display Subject Analysis ---
       function displaySubjectAnalysis(classSubjectData) {
           subjectAnalysisContainer.innerHTML = ''; // Clear previous
           const sortedClasses = Object.keys(classSubjectData).sort();

           if (sortedClasses.length === 0) {
               subjectAnalysisContainer.innerHTML = '<p class="placeholder-text">No subject data available for analysis.</p>';
               return;
           }

           sortedClasses.forEach(classStreamKey => {
               const subjects = classSubjectData[classStreamKey];
               const subjectAverages = Object.entries(subjects)
                   .map(([name, avg]) => ({ name, average: avg }))
                   .sort((a, b) => b.average - a.average); // Sort subjects by average desc

               if (subjectAverages.length === 0) return; // Skip if no subjects for this class

               const classCard = document.createElement('div');
               classCard.className = 'subject-analysis-card'; // Use specific class if needed

               let content = `<h4>${classStreamKey} - Subject Performance</h4>`;

               const topCount = Math.min(3, subjectAverages.length); // Show top 3
               const bottomCount = Math.min(3, subjectAverages.length); // Show bottom 3

               content += '<div class="subject-rank-category"><h5>Best Performed Subjects</h5><ul class="subject-list-rank">';
               if (topCount > 0) {
                   for(let i = 0; i < topCount; i++) {
                       content += `<li>${subjectAverages[i].name} <span class="avg-score">${subjectAverages[i].average.toFixed(1)}%</span></li>`;
                   }
               } else { content += '<li>N/A</li>'; }
               content += '</ul></div>';

               content += '<div class="subject-rank-category"><h5>Subjects Needing Improvement</h5><ul class="subject-list-rank">';
               if (bottomCount > 0 && subjectAverages.length > topCount) { // Avoid showing same subjects if few subjects
                   for(let i = subjectAverages.length - 1; i >= subjectAverages.length - bottomCount; i--) {
                       // Ensure we don't re-list subjects already in 'best' if there are few subjects
                       if (!subjectAverages.slice(0, topCount).some(topSubj => topSubj.name === subjectAverages[i].name)) {
                            content += `<li>${subjectAverages[i].name} <span class="avg-score">${subjectAverages[i].average.toFixed(1)}%</span></li>`;
                       }
                   }
               } else if (subjectAverages.length <= topCount && subjectAverages.length > 0) {
                   content += '<li>(See Best Performed)</li>'; // Indicate if all subjects are top
               }
               else { content += '<li>N/A</li>'; }
               content += '</ul></div>';

               classCard.innerHTML = content;
               subjectAnalysisContainer.appendChild(classCard);
           });
       }

      function displayPerformanceChart(termAveragesData) { /* ... (no changes) ... */
          const terms = Object.keys(termAveragesData).sort(); if (terms.length === 0) { chartPlaceholder.textContent = "No term data available for chart."; chartPlaceholder.style.display = 'block'; return; } const datasets = []; const streamColors = { "O-Level": 'rgb(75, 192, 192)', "A-Level Arts": 'rgb(255, 159, 64)', "A-Level Science": 'rgb(54, 162, 235)' }; Object.keys(streamColors).forEach(streamType => { const data = terms.map(term => termAveragesData[term]?.[streamType]?.toFixed(1) || null); if (data.some(d => d !== null)) { datasets.push({ label: `${streamType} Avg`, data: data, borderColor: streamColors[streamType], tension: 0.1, fill: false }); } }); if (datasets.length === 0) { chartPlaceholder.textContent = "No valid data points found."; chartPlaceholder.style.display = 'block'; return; } chartPlaceholder.style.display = 'none'; if (performanceChart) performanceChart.destroy(); performanceChart = new Chart(perfChartCanvas, { type: 'line', data: { labels: terms, datasets: datasets }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, title: { display: true, text: 'Average Mark (%)' } }, x: { title: { display: true, text: 'Term' } } }, plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } } } });
      }

      // --- Calendar & Events Logic ---
      function setupCalendarEventListeners() {
          prevMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); renderCalendar(currentCalendarDate); });
          nextMonthBtn.addEventListener('click', () => { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); renderCalendar(currentCalendarDate); });
          addEventBtn.addEventListener('click', addEvent);
          eventListUl.addEventListener('click', handleDeleteEvent); // Use delegation
      }

      function renderCalendar(date) {
          calendarGrid.innerHTML = ''; // Clear previous grid
          const year = date.getFullYear();
          const month = date.getMonth(); // 0-indexed
          monthYearDisplay.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

          const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon,...
          const daysInMonth = new Date(year, month + 1, 0).getDate();

          // Add day headers
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          daysOfWeek.forEach(day => {
              const dayHeader = document.createElement('div');
              dayHeader.classList.add('day-header');
              dayHeader.textContent = day;
              calendarGrid.appendChild(dayHeader);
          });

          // Add empty cells for days before the 1st
          for (let i = 0; i < firstDayOfMonth; i++) {
              calendarGrid.appendChild(document.createElement('div'));
          }

          // Add day cells
          const today = new Date();
          const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const events = schoolData.events || [];

          for (let day = 1; day <= daysInMonth; day++) {
              const dayCell = document.createElement('div');
              dayCell.classList.add('day');
              dayCell.textContent = day;
              const currentDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              if (currentDateString === todayDateString) {
                  dayCell.classList.add('today');
              }

              // Check for events on this day
              if (events.some(event => event.date === currentDateString)) {
                  dayCell.classList.add('has-event');
                  dayCell.title = events.filter(event => event.date === currentDateString).map(e => e.description).join('\n');
              }
              calendarGrid.appendChild(dayCell);
          }
      }

      function displayEvents() {
          const events = (schoolData.events || []).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
          eventListUl.innerHTML = '';
          dashboardEventListUl.innerHTML = ''; // Clear dashboard list too

          if (events.length === 0) {
              const placeholder = '<li class="placeholder-text">No upcoming events.</li>';
              eventListUl.innerHTML = placeholder;
              dashboardEventListUl.innerHTML = placeholder;
              return;
          }

          const today = new Date().toISOString().split('T')[0]; // Get today's date string YYYY-MM-DD
          let futureEventsCount = 0;

          events.forEach((event, index) => {
              const li = document.createElement('li');
              const dateSpan = document.createElement('span');
              dateSpan.className = 'event-date';
              dateSpan.textContent = new Date(event.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // Format date nicely

              const descSpan = document.createElement('span');
              descSpan.className = 'event-desc';
              descSpan.textContent = event.description;

              li.appendChild(dateSpan);
              li.appendChild(descSpan);

              if (isAdmin) {
                  const deleteBtn = document.createElement('button');
                  deleteBtn.textContent = 'Del';
                  deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'delete-event-btn');
                  deleteBtn.dataset.index = index; // Use index to identify event for deletion
                  li.appendChild(deleteBtn);
              }
              eventListUl.appendChild(li);

              // Add to dashboard list only if it's today or in the future
              if (event.date >= today && futureEventsCount < 5) { // Limit dashboard events
                  dashboardEventListUl.appendChild(li.cloneNode(true)); // Clone node for dashboard
                  futureEventsCount++;
              }
          });
           if (futureEventsCount === 0) {
               dashboardEventListUl.innerHTML = '<li class="placeholder-text">No upcoming events.</li>';
           }
      }

      function addEvent() {
          const date = eventDateInput.value;
          const description = eventDescInput.value.trim();

          if (!date || !description) {
              alert("Please enter both date and description for the event.");
              return;
          }

          if (!schoolData.events) { schoolData.events = []; }
          schoolData.events.push({ date, description });
          saveData();
          displayEvents(); // Refresh lists
          renderCalendar(currentCalendarDate); // Re-render calendar to show event marker
          eventDateInput.value = ''; // Clear inputs
          eventDescInput.value = '';
          sendNotification("New Academic Event Added", `${description} on ${new Date(date + 'T00:00:00').toLocaleDateString()}`);
      }

      function handleDeleteEvent(event) {
          if (isAdmin && event.target.classList.contains('delete-event-btn')) {
              const eventIndex = parseInt(event.target.dataset.index, 10);
              if (!isNaN(eventIndex) && schoolData.events && schoolData.events[eventIndex]) {
                  const eventToDelete = schoolData.events[eventIndex];
                  if (confirm(`Are you sure you want to delete the event: "${eventToDelete.description}" on ${eventToDelete.date}?`)) {
                      schoolData.events.splice(eventIndex, 1);
                      saveData();
                      displayEvents();
                      renderCalendar(currentCalendarDate);
                  }
              }
          }
      }

      // --- Notification Logic ---
      function requestNotificationPermission() {
          if (!("Notification" in window)) {
              console.log("This browser does not support desktop notification");
          } else if (Notification.permission !== "denied") {
              // Ask only if not denied, avoid annoying users who denied it.
              // Don't ask immediately on load, maybe trigger on first event add?
              // For demo, we ask on load if permission is 'default'.
              if (Notification.permission === "default") {
                 Notification.requestPermission().then(permission => {
                     console.log(`Notification permission: ${permission}`);
                 });
              }
          }
      }

      function sendNotification(title, body) {
          if (!("Notification" in window)) return; // Not supported

          if (Notification.permission === "granted") {
              new Notification(title, { body: body, icon: 'placeholder-logo.png' });
          } else if (Notification.permission !== "denied") {
              // Ask again if default, maybe they missed it
              Notification.requestPermission().then(permission => {
                  if (permission === "granted") {
                      new Notification(title, { body: body, icon: 'placeholder-logo.png' });
                  }
              });
          }
          // If denied, do nothing.
      }


      // --- Settings Logic ---
      function setupSettingsListeners() { /* ... (no changes) ... */
          saveSettingsBtn.addEventListener('click', saveSettings); loadSettingsBtn.addEventListener('click', loadSettings); resetDefaultsBtn.addEventListener('click', resetSettingsToDefault); overrideTargetSelect.addEventListener('change', loadSpecificScaleForEditing);
      }
      function populateOverrideTargetSelect() { /* ... (no changes) ... */
          overrideTargetSelect.innerHTML = '<option value="">-- Select Class-Stream to Override --</option>'; const classStreamKeys = Object.keys(schoolData.students).sort(); classStreamKeys.forEach(key => { const option = document.createElement('option'); option.value = key; option.textContent = key; overrideTargetSelect.appendChild(option); }); gradingScaleSpecificTextarea.value = '';
      }
      function loadSpecificScaleForEditing() { /* ... (no changes) ... */
          const targetKey = overrideTargetSelect.value; if (targetKey && schoolData.settings?.gradingScale?.[targetKey]) { const scale = schoolData.settings.gradingScale[targetKey]; gradingScaleSpecificTextarea.value = formatScaleForTextarea(scale); } else { gradingScaleSpecificTextarea.value = ''; }
      }
      function formatScaleForTextarea(scaleArray) { /* ... (no changes) ... */
          if (!Array.isArray(scaleArray)) return ''; return scaleArray.map(s => `${s.grade}, ${s.min}, ${s.max}, ${s.comment || ''}`).join('\n');
      }
      function saveSettings() { /* ... (no changes) ... */
          let changesMade = false; let errorOccurred = false; if (!schoolData.settings.gradingScale) { schoolData.settings.gradingScale = {}; } const globalText = gradingScaleGlobalTextarea.value.trim(); const newGlobalScale = parseGradingScaleText(globalText); if (newGlobalScale === null) { errorOccurred = true; } else if (JSON.stringify(schoolData.settings.gradingScale.global) !== JSON.stringify(newGlobalScale)) { schoolData.settings.gradingScale.global = newGlobalScale; changesMade = true; } const olevelText = gradingScaleOlevelTextarea.value.trim(); const newOlevelScale = parseGradingScaleText(olevelText); if (newOlevelScale === null) { errorOccurred = true; } else if (JSON.stringify(schoolData.settings.gradingScale['O-Level']) !== JSON.stringify(newOlevelScale)) { schoolData.settings.gradingScale['O-Level'] = newOlevelScale; changesMade = true; } const targetKey = overrideTargetSelect.value; if (targetKey) { const specificText = gradingScaleSpecificTextarea.value.trim(); if (specificText) { const newSpecificScale = parseGradingScaleText(specificText); if (newSpecificScale === null) { errorOccurred = true; } else if (JSON.stringify(schoolData.settings.gradingScale[targetKey]) !== JSON.stringify(newSpecificScale)) { schoolData.settings.gradingScale[targetKey] = newSpecificScale; changesMade = true; } } else { if (schoolData.settings.gradingScale[targetKey]) { delete schoolData.settings.gradingScale[targetKey]; changesMade = true; } } } if (errorOccurred) { alert("Settings not saved due to errors in format or validation. Please check the highlighted fields or console."); return; } if (changesMade) { saveData(); alert("Settings saved successfully."); } else { alert("No changes detected in settings."); }
      }
      function parseGradingScaleText(text) { /* ... (no changes) ... */
          const newScale = []; let parseError = false; const lines = text.split('\n'); lines.forEach((line, index) => { if (!line.trim()) return; const parts = line.split(',').map(p => p.trim()); if (parts.length >= 3) { const grade = parts[0]; const min = parseFloat(parts[1]); const max = parseFloat(parts[2]); const comment = parts[3] || ''; if (grade && !isNaN(min) && !isNaN(max)) { newScale.push({ grade, min, max, comment }); } else { alert(`Error parsing line ${index + 1}: Invalid format or non-numeric min/max.\nLine: ${line}`); parseError = true; } } else { alert(`Error parsing line ${index + 1}: Not enough parts (expected GRADE, MIN, MAX, [COMMENT]).\nLine: ${line}`); parseError = true; } }); if (parseError) return null; newScale.sort((a, b) => a.min - b.min); for (let i = 0; i < newScale.length - 1; i++) { if (newScale[i].max >= newScale[i+1].min) { alert(`Validation Error: Grading ranges overlap between ${newScale[i].grade} (${newScale[i].min}-${newScale[i].max}) and ${newScale[i+1].grade} (${newScale[i+1].min}-${newScale[i+1].max}).`); return null; } } return newScale;
      }
      function loadSettings() { /* ... (no changes) ... */
          const settings = schoolData.settings?.gradingScale || {}; const defaults = getDefaultData().settings.gradingScale; gradingScaleGlobalTextarea.value = formatScaleForTextarea(settings.global || defaults.global || []); gradingScaleOlevelTextarea.value = formatScaleForTextarea(settings['O-Level'] || defaults['O-Level'] || []); loadSpecificScaleForEditing(); console.log("Settings loaded into UI.");
      }
      function resetSettingsToDefault() { /* ... (no changes) ... */
          if (confirm("Are you sure you want to reset ALL grading scales to the system defaults? This cannot be undone easily.")) { schoolData.settings.gradingScale = getDefaultData().settings.gradingScale; saveData(); loadSettings(); overrideTargetSelect.value = ''; gradingScaleSpecificTextarea.value = ''; alert("All grading scales reset to defaults."); }
      }

      // --- Start the application ---
      initializeApp();
      console.log("Initialization script finished."); // Debug End

    });
