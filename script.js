
const subjectForm = document.getElementById("subjectForm");
const subjectName = document.getElementById("subjectName");
const examDate = document.getElementById("examDate");
const isBacklog = document.getElementById("isBacklog");
const subjectList = document.getElementById("subjectList");
const topicForm = document.getElementById("topicForm");
const topicSubject = document.getElementById("topicSubject");
const topicName = document.getElementById("topicName");
const topicList = document.getElementById("topicList");
const overallProgress = document.getElementById("overallProgress");
const progressText = document.getElementById("progressText");
const subjectCount = document.getElementById("subjectCount");
const completedCount = document.getElementById("completedCount");
const backlogCount = document.getElementById("backlogCount");
const startBtn = document.getElementById("startBtn");

const STORAGE_KEY = "syllabussos_subjects";

let subjects = [];

try {
  const savedSubjects = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  if (Array.isArray(savedSubjects)) {
    subjects = savedSubjects.filter(
      (subject) =>
        subject &&
        typeof subject.id === "string" &&
        typeof subject.name === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(subject.examDate) &&
        typeof subject.isBacklog === "boolean"
    );
  }
} catch (error) {
  console.error("Could not load saved subjects:", error);
}

function saveSubjects() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    return true;
  } catch (error) {
    alert("Could not save your subjects. Check browser storage.");
    console.error(error);
    return false;
  }
}
const TOPIC_STORAGE_KEY = "syllabussos_topics";
let topics = [];

try {
  const savedTopics = JSON.parse(
    localStorage.getItem(TOPIC_STORAGE_KEY) || "[]"
  );

  if (Array.isArray(savedTopics)) {
    topics = savedTopics.filter(
      (topic) =>
        topic &&
        typeof topic.id === "string" &&
        typeof topic.subjectId === "string" &&
        typeof topic.name === "string" &&
        typeof topic.completed === "boolean"
    );
  }
} catch (error) {
  console.error("Could not load saved topics:", error);
}
// Calculate the number of calendar days until an exam.
function getDaysRemaining(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const exam = Date.UTC(year, month - 1, day);

  const now = new Date();
  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return Math.round((exam - today) / 86400000);
}

function formatExamDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}

function renderSubjects() {
  subjectList.replaceChildren();

  const sortedSubjects = [...subjects].sort((a, b) =>
    a.examDate.localeCompare(b.examDate)
  );

  if (sortedSubjects.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent =
      "No subjects added yet. Start by adding one!";
    subjectList.appendChild(emptyMessage);
  }

  sortedSubjects.forEach((subject) => {
    const card = document.createElement("div");
    card.className = "subject";

    const title = document.createElement("h3");
    title.textContent = subject.name;

    const date = document.createElement("p");
    date.textContent = "Exam date: " + formatExamDate(subject.examDate);

    const days = getDaysRemaining(subject.examDate);
    const remaining = document.createElement("p");

    if (days > 0) {
      remaining.textContent = `${days} day(s) remaining`;
    } else if (days === 0) {
      remaining.textContent = "Exam is today!";
    } else {
      remaining.textContent = `Exam date passed by ${Math.abs(days)} day(s)`;
    }

    const backlog = document.createElement("p");
    backlog.textContent = subject.isBacklog
      ? "Backlog: Yes"
      : "Backlog: No";

    if (subject.isBacklog) {
      backlog.style.color = "#b42318";
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete Subject";

    deleteButton.addEventListener("click", () => {
      const confirmed = confirm(
        `Delete "${subject.name}" from your planner?`
      );

      if (!confirmed) return;

      const previousSubjects = subjects;
      subjects = subjects.filter((item) => item.id !== subject.id);

      if (saveSubjects()) {
        renderSubjects();
      } else {
        subjects = previousSubjects;
      }
    });

    card.append(title, date, remaining, backlog, deleteButton);
    subjectList.appendChild(card);
  });

  // Update dashboard counters.
  subjectCount.textContent = subjects.length;

  backlogCount.textContent = subjects.filter(
    (subject) => subject.isBacklog
  ).length;

  // Topic-completion tracking will be added in a later step.
  completedCount.textContent = "0";
}

subjectForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = subjectName.value.trim();
  const date = examDate.value;

  if (!name || !date) {
    alert("Please enter the subject name and exam date.");
    return;
  }

  // Check that the date is a real calendar date.
  const [year, month, day] = date.split("-").map(Number);
  const checkDate = new Date(year, month - 1, day);

  if (
    checkDate.getFullYear() !== year ||
    checkDate.getMonth() !== month - 1 ||
    checkDate.getDate() !== day
  ) {
    alert("Please enter a valid exam date.");
    return;
  }

  const newSubject = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: name,
    examDate: date,
    isBacklog: isBacklog.checked
  };

  subjects.push(newSubject);

  if (!saveSubjects()) {
    subjects.pop();
    return;
  }

  renderSubjects();
  subjectForm.reset();
  subjectName.focus();
});

// Scroll to the planner when Start Planning is clicked.
startBtn.addEventListener("click", () => {
  document.getElementById("planner").scrollIntoView({
    behavior: "smooth"
  });

  subjectName.focus({ preventScroll: true });
});

function saveTopics() {
  try {
    localStorage.setItem(
      TOPIC_STORAGE_KEY,
      JSON.stringify(topics)
    );
    return true;
  } catch (error) {
    alert("Could not save topics. Check browser storage.");
    console.error(error);
    return false;
  }
}

function renderTopicSubjectOptions() {
  const previousValue = topicSubject.value;
  topicSubject.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a subject";
  topicSubject.appendChild(placeholder);

  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.name;
    topicSubject.appendChild(option);
  });

  if (subjects.some((s) => s.id === previousValue)) {
    topicSubject.value = previousValue;
  }
}

function renderTopics() {
  topicList.replaceChildren();

  // Remove topics belonging to subjects that no longer exist.
  topics = topics.filter((topic) =>
    subjects.some((subject) => subject.id === topic.subjectId)
  );

  const total = topics.length;
  const completed = topics.filter((topic) => topic.completed).length;
  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  overallProgress.value = percentage;
  progressText.textContent =
    `Overall preparation: ${percentage}% (${completed}/${total} topics)`;

  completedCount.textContent = completed;

  if (total === 0) {
    const message = document.createElement("p");
    message.textContent = "No topics added yet.";
    topicList.appendChild(message);
    return;
  }

  topics.forEach((topic) => {
    const card = document.createElement("div");
    card.className = "topic-card";

    const subject = subjects.find(
      (item) => item.id === topic.subjectId
    );

    const heading = document.createElement("h3");
    heading.textContent = topic.name;

    const subjectLabel = document.createElement("p");
    subjectLabel.textContent = `Subject: ${subject.name}`;

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = topic.completed;

    checkbox.addEventListener("change", () => {
      const previous = topic.completed;
      topic.completed = checkbox.checked;
if (checkbox.checked) {
    recordWeeklyActivity("completed", topic.id);
}
      if (saveTopics()) {
        renderTopics();
      } else {
        topic.completed = previous;
        checkbox.checked = previous;
      }
    });

    label.append(checkbox, document.createTextNode(" Completed"));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete Topic";

    deleteButton.addEventListener("click", () => {
      const previousTopics = topics;
      topics = topics.filter((item) => item.id !== topic.id);

      if (saveTopics()) {
        renderTopics();
      } else {
        topics = previousTopics;
      }
    });

    card.append(heading, subjectLabel, label, deleteButton);
    topicList.appendChild(card);
  });
}

topicForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = topicName.value.trim();
  const selectedSubject = topicSubject.value;

  if (!name || !subjects.some((s) => s.id === selectedSubject)) {
    alert("Please choose a subject and enter a topic.");
    return;
  }

  const newTopic = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    subjectId: selectedSubject,
    name,
    completed: false
  };

  topics.push(newTopic);

  if (!saveTopics()) {
    topics.pop();
    return;
  }

  renderTopics();
  topicForm.reset();
});

function renderAllTopics() {
  renderTopicSubjectOptions();
  renderTopics();
}

// Refresh topic links and progress whenever subjects change.


renderAllTopics();

// Display saved subjects when the page opens.
renderSubjects();

const timetableForm = document.getElementById("timetableForm");
const studyHoursInput = document.getElementById("studyHours");
const timetableSummary = document.getElementById("timetableSummary");
const timetableResults = document.getElementById("timetableResults");

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function displayDay(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}

function generateTimetable(hoursPerDay) {
  timetableResults.replaceChildren();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = dateKey(today);

  const upcomingSubjects = subjects.filter(
    (subject) => subject.examDate >= todayKey
  );

  const pendingTopics = topics.filter((topic) => {
    const subject = subjects.find(
      (item) => item.id === topic.subjectId
    );

    return subject &&
      subject.examDate >= todayKey &&
      !topic.completed;
  });

  const overdueTopics = topics.filter((topic) => {
    const subject = subjects.find(
      (item) => item.id === topic.subjectId
    );

    return subject &&
      subject.examDate < todayKey &&
      !topic.completed;
  });

  if (upcomingSubjects.length === 0) {
    timetableSummary.textContent =
      "Add a subject with today's or a future exam date first.";
    return;
  }

  if (pendingTopics.length === 0) {
    timetableSummary.textContent =
      "No unfinished topics remain for upcoming exams.";

    if (overdueTopics.length > 0) {
      timetableSummary.textContent +=
        ` ${overdueTopics.length} unfinished topic(s) have past exam dates.`;
    }
    return;
  }

  const latestExam = upcomingSubjects
    .map((subject) => subject.examDate)
    .sort()
    .at(-1);

  const [year, month, day] = latestExam.split("-").map(Number);
  const latestDate = new Date(year, month - 1, day);

  const totalDays = Math.floor(
    (
      Date.UTC(
        latestDate.getFullYear(),
        latestDate.getMonth(),
        latestDate.getDate()
      ) -
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      )
    ) / 86400000
  ) + 1;

  const planningDays = Math.min(totalDays, 90);
  const assignedTopicIds = new Set();
  const schedule = [];

  for (let offset = 0; offset < planningDays; offset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + offset);
    const currentKey = dateKey(currentDate);
    const sessions = [];

    for (let hour = 0; hour < hoursPerDay; hour++) {
      const candidates = pendingTopics
        .filter((topic) => {
          if (assignedTopicIds.has(topic.id)) return false;

          const subject = subjects.find(
            (item) => item.id === topic.subjectId
          );

          return subject && subject.examDate >= currentKey;
        })
        .map((topic) => {
          const subject = subjects.find(
            (item) => item.id === topic.subjectId
          );

          const remainingDays = Math.max(
            1,
            Math.floor(
              (
                new Date(subject.examDate + "T00:00:00").getTime() -
                currentDate.getTime()
              ) / 86400000
            ) + 1
          );

          const remainingTopics = pendingTopics.filter(
            (item) =>
              item.subjectId === topic.subjectId &&
              !assignedTopicIds.has(item.id)
          ).length;

          return {
            topic,
            subject,
            urgency: (remainingTopics / remainingDays) *
             (subject.isBacklog ? 1.5 : 1)
          };
        })
       
.sort((a, b) => {
  // 1. Higher workload per remaining day comes first.
  if (b.urgency !== a.urgency) {
    return b.urgency - a.urgency;
  }

  // 2. Earlier exam dates come first.
  const deadlineOrder =
    a.subject.examDate.localeCompare(b.subject.examDate);

  if (deadlineOrder !== 0) {
    return deadlineOrder;
  }

  // 3. Backlogs come first when exam dates are equal.
  if (a.subject.isBacklog !== b.subject.isBacklog) {
    return a.subject.isBacklog ? -1 : 1;
  }

  // 4. Keep the order consistent for matching priorities.
  return a.topic.name.localeCompare(b.topic.name);
})

      if (candidates.length === 0) break;

      const chosen = candidates[0];
      assignedTopicIds.add(chosen.topic.id);

      sessions.push({
        topic: chosen.topic,
        subject: chosen.subject,
        startHour: 8 + hour,
        endHour: 9 + hour
      });
    }

    if (sessions.length > 0) {
      schedule.push({
        date: currentKey,
        sessions
      });
    }
  }

  const unscheduled = pendingTopics.filter(
    (topic) => !assignedTopicIds.has(topic.id)
  );

  timetableSummary.textContent =
    `${assignedTopicIds.size} of ${pendingTopics.length} unfinished topics scheduled. ` +
    `${hoursPerDay} study hour(s) per day across ${planningDays} day(s).`;

  function formatTime(hour) {
    const displayHour = hour % 12 || 12;
    const period = hour >= 12 ? "PM" : "AM";
    return `${displayHour}:00 ${period}`;
  }

  schedule.forEach((dayPlan) => {
    const card = document.createElement("div");
    card.className = "study-day";

    const heading = document.createElement("h3");
    heading.textContent = displayDay(dayPlan.date);
    card.appendChild(heading);

    dayPlan.sessions.forEach((session) => {
      const item = document.createElement("div");
      item.className = "study-session";

      const title = document.createElement("strong");
      title.textContent = session.topic.name;

      const subjectText = document.createElement("p");
      subjectText.textContent =
        `Subject: ${session.subject.name}` +
        (session.subject.isBacklog ? " (Backlog)" : "");

      const timeText = document.createElement("p");
      timeText.textContent =
        `${formatTime(session.startHour)} – ${formatTime(session.endHour)}`;

      const examText = document.createElement("p");
      examText.textContent =
        `Exam: ${displayDay(session.subject.examDate)}`;

      item.append(title, subjectText, timeText, examText);
      card.appendChild(item);
    });

    timetableResults.appendChild(card);
  });

  if (unscheduled.length > 0) {
    const warning = document.createElement("p");
    warning.className = "study-warning";
    warning.textContent =
      `${unscheduled.length} topic(s) could not fit before their exam deadlines. ` +
      "Consider increasing study hours or reviewing exam dates.";
    timetableResults.appendChild(warning);
  } else {
    const success = document.createElement("p");
    success.className = "study-success";
    success.textContent =
      "All unfinished topics for upcoming exams have been scheduled.";
    timetableResults.appendChild(success);
  }

  if (overdueTopics.length > 0) {
    const warning = document.createElement("p");
    warning.className = "study-warning";
    warning.textContent =
      `${overdueTopics.length} unfinished topic(s) have past exam dates.`;
    timetableResults.appendChild(warning);
  }

  if (totalDays > 90) {
    const warning = document.createElement("p");
    warning.className = "study-warning";
    warning.textContent =
      "Only the next 90 days are displayed.";
    timetableResults.appendChild(warning);
  }
}

timetableForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const hours = Number(studyHoursInput.value);

  if (!Number.isInteger(hours) || hours < 1 || hours > 12) {
    alert("Enter a whole number between 1 and 12 study hours.");
    return;
  }

  generateTimetable(hours);
});



// ========================================
// REVISION TRACKER + PROGRESS DASHBOARD
// ========================================

const REVISION_STORAGE_KEY = "syllabussos_revisions";

let revisionRecords = {};

try {
  const savedRevisions = JSON.parse(
    localStorage.getItem(REVISION_STORAGE_KEY) || "{}"
  );

  if (
    savedRevisions &&
    typeof savedRevisions === "object" &&
    !Array.isArray(savedRevisions)
  ) {
    revisionRecords = savedRevisions;
  }
} catch (error) {
  revisionRecords = {};
}

const revisionList = document.getElementById("revisionList");
const revisionSummary = document.getElementById("revisionSummary");

function saveRevisionRecords() {
  localStorage.setItem(
    REVISION_STORAGE_KEY,
    JSON.stringify(revisionRecords)
  );
}

function renderProgressDashboard() {
  const total = topics.length;
  const completed = topics.filter(
    (topic) => topic.completed
  ).length;
  const pending = total - completed;

  const backlogIds = new Set(
    subjects
      .filter((subject) => subject.isBacklog)
      .map((subject) => subject.id)
  );

  const backlogCount = backlogIds.size;
  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  document.getElementById("dashboardTotal").textContent = total;
  document.getElementById("dashboardCompleted").textContent = completed;
  document.getElementById("dashboardPending").textContent = pending;
  document.getElementById("dashboardBacklogs").textContent = backlogCount;

  document.getElementById("dashboardProgress").value = percentage;
  document.getElementById("dashboardProgressText").textContent =
    `${percentage}% completed (${completed} of ${total} topics)`;
}

function renderRevisionTracker() {
  revisionList.replaceChildren();

  if (topics.length === 0) {
    revisionSummary.textContent =
      "Add topics in the Topic Tracker to start revising.";
    return;
  }

  let revisedCount = 0;

  topics.forEach((topic) => {
    if (revisionRecords[topic.id]?.revised === true) {
      revisedCount++;
    }
  });

  revisionSummary.textContent =
    `${revisedCount} of ${topics.length} topics revised. ` +
    `${topics.length - revisedCount} still need revision.`;

  topics.forEach((topic) => {
    const subject = subjects.find(
      (item) => item.id === topic.subjectId
    );

    if (!subject) return;

    const record = revisionRecords[topic.id] || {
      revised: false,
      revisedAt: ""
    };

    const card = document.createElement("div");
    card.className = "revision-card";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.checked = record.revised === true;

    const text = document.createElement("span");
    text.textContent =
      `${topic.name} — ${subject.name}` +
      (subject.isBacklog ? " (Backlog)" : "");

    label.append(checkbox, text);
    card.appendChild(label);

    if (record.revised && record.revisedAt) {
      const dateText = document.createElement("p");
      dateText.className = "revision-date";
      dateText.textContent =
        `Last marked revised: ${record.revisedAt}`;
      card.appendChild(dateText);
    }

    checkbox.addEventListener("change", () => {
      revisionRecords[topic.id] = {
        revised: checkbox.checked,
        revisedAt: checkbox.checked
          ? new Date().toLocaleDateString("en-IN")
          : ""
      };
if (checkbox.checked) {
    recordWeeklyActivity("revised", topic.id);
}
      saveRevisionRecords();
      renderRevisionTracker();
    });

    revisionList.appendChild(card);
  });
}


function renderStudyInsights() {
  renderProgressDashboard();
  renderRevisionTracker();
  renderStudyRecommendations();
}

// Initial render
renderStudyInsights();


// ========================================
// SMART STUDY RECOMMENDATIONS
// ========================================

function renderStudyRecommendations() {
  const summary = document.getElementById("recommendationSummary");
  const list = document.getElementById("recommendationList");

  if (!summary || !list) return;

  list.replaceChildren();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = dateKey(today);

  const pendingTopics = topics.filter((topic) => !topic.completed);

  const urgentSubjects = subjects
    .filter((subject) => subject.examDate >= todayKey)
    .sort((a, b) => {
      const dateOrder = a.examDate.localeCompare(b.examDate);

      if (dateOrder !== 0) return dateOrder;

      if (a.isBacklog !== b.isBacklog) {
        return a.isBacklog ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

  if (subjects.length === 0) {
    summary.textContent = "Add a subject and exam date to get personalized recommendations.";
    return;
  }

  if (pendingTopics.length === 0) {
    summary.textContent =
      "All tracked topics are completed. Review your revision tracker before exams.";

    const card = document.createElement("div");
    card.className = "recommendation-card revision";
    card.textContent =
      "Revision tip: revisit topics you haven't marked as revised yet.";
    list.appendChild(card);
    return;
  }

  if (urgentSubjects.length === 0) {
    summary.textContent =
      "Your saved exam dates are in the past. Update them to get accurate recommendations.";

    return;
  }

  const daysUntil = (dateString) => {
    const examDate = new Date(dateString + "T00:00:00");

    return Math.round(
      (examDate.getTime() - today.getTime()) / 86400000
    );
  };

  summary.textContent =
    `${pendingTopics.length} unfinished topic(s) need attention. ` +
    "Start with the nearest exam and give backlogs extra attention.";

  urgentSubjects.forEach((subject) => {
    const subjectTopics = pendingTopics.filter(
      (topic) => topic.subjectId === subject.id
    );

    if (subjectTopics.length === 0) return;

    const daysLeft = daysUntil(subject.examDate);
    const card = document.createElement("div");

    card.className =
      "recommendation-card" +
      (daysLeft <= 3 ? " urgent" : "");

    const heading = document.createElement("h3");
    heading.textContent =
      `${subject.name}${subject.isBacklog ? " — BACKLOG" : ""}`;

    const examInfo = document.createElement("p");
    examInfo.textContent =
      daysLeft === 0
        ? "Exam is today"
        : `Exam in ${daysLeft} day(s)`;

    const topicInfo = document.createElement("p");
    topicInfo.textContent =
      `${subjectTopics.length} unfinished topic(s)`;

    const suggestion = document.createElement("p");
    suggestion.textContent =
      daysLeft <= 3
        ? "High priority: focus on key concepts and quick revision."
        : subject.isBacklog
          ? "Prioritize this backlog and practise important questions."
          : "Study these topics and mark them complete as you progress.";

    card.append(heading, examInfo, topicInfo, suggestion);
    list.appendChild(card);
  });

  const revisionTopics = topics.filter((topic) => {
    if (!topic.completed) return false;

    return revisionRecords[topic.id]?.revised !== true;
  });

  if (revisionTopics.length > 0) {
    const revisionCard = document.createElement("div");
    revisionCard.className = "recommendation-card revision";

    const heading = document.createElement("h3");
    heading.textContent = "Revision reminder";

    const detail = document.createElement("p");
    detail.textContent =
      `${revisionTopics.length} completed topic(s) haven't been marked as revised.`;

    revisionCard.append(heading, detail);
    list.appendChild(revisionCard);
  }

  if (list.children.length === 0) {
    const empty = document.createElement("div");
    empty.className = "recommendation-empty";
    empty.textContent =
      "No unfinished topics are linked to upcoming exams. Add topics or review your exam dates.";

    list.appendChild(empty);
  }
}

renderStudyRecommendations();


// ========================================
// WEEKLY STUDY REPORT
// ========================================

const WEEKLY_GOAL_KEY = "syllabussos_weekly_goal";
const WEEKLY_ACTIVITY_KEY = "syllabussos_weekly_activity";

const weeklyGoalInput = document.getElementById("weeklyGoal");
const weeklyGoalForm = document.getElementById("weeklyGoalForm");
const weeklyCompletedDisplay = document.getElementById("weeklyCompleted");
const weeklyRevisedDisplay = document.getElementById("weeklyRevised");
const weeklyGoalStatus = document.getElementById("weeklyGoalStatus");
const weeklyReportMessage = document.getElementById("weeklyReportMessage");
const downloadWeeklyReportButton =
  document.getElementById("downloadWeeklyReport");

let weeklyGoal = 10;
let weeklyActivity = {};

try {
  const storedGoal = Number(localStorage.getItem(WEEKLY_GOAL_KEY));

  if (Number.isInteger(storedGoal) && storedGoal >= 1 && storedGoal <= 200) {
    weeklyGoal = storedGoal;
  }

  const storedActivity = JSON.parse(
    localStorage.getItem(WEEKLY_ACTIVITY_KEY) || "{}"
  );

  if (
    storedActivity &&
    typeof storedActivity === "object" &&
    !Array.isArray(storedActivity)
  ) {
    weeklyActivity = storedActivity;
  }
} catch (error) {
  console.warn("Weekly report data could not be loaded.", error);
}

weeklyGoalInput.value = weeklyGoal;

function getWeekStart(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const day = start.getDay();
  const daysSinceMonday = (day + 6) % 7;

  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentWeekKey() {
  return getLocalDateKey(getWeekStart());
}

function saveWeeklyActivity() {
  localStorage.setItem(
    WEEKLY_ACTIVITY_KEY,
    JSON.stringify(weeklyActivity)
  );
}

function recordWeeklyActivity(type, topicId) {
  const weekKey = getCurrentWeekKey();

  if (!weeklyActivity[weekKey]) {
    weeklyActivity[weekKey] = {
      completed: [],
      revised: []
    };
  }

  if (!Array.isArray(weeklyActivity[weekKey][type])) {
    weeklyActivity[weekKey][type] = [];
  }

  const entries = weeklyActivity[weekKey][type];

  if (!entries.includes(topicId)) {
    entries.push(topicId);
  }

  saveWeeklyActivity();
  renderWeeklyReport();
}

function renderWeeklyReport() {
  const weekKey = getCurrentWeekKey();
  const currentWeek = weeklyActivity[weekKey] || {
    completed: [],
    revised: []
  };

  const completedCount = Array.isArray(currentWeek.completed)
    ? currentWeek.completed.length
    : 0;

  const revisedCount = Array.isArray(currentWeek.revised)
    ? currentWeek.revised.length
    : 0;

  weeklyCompletedDisplay.textContent = completedCount;
  weeklyRevisedDisplay.textContent = revisedCount;

  weeklyGoalStatus.textContent =
    `Weekly goal: ${weeklyGoal} topics`;

  const remaining = Math.max(0, weeklyGoal - completedCount);

  weeklyReportMessage.textContent =
    completedCount >= weeklyGoal
      ? "Congratulations! You've reached your weekly topic completion goal."
      : `${remaining} more topic(s) to reach your weekly goal.`;
}

weeklyGoalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = Number(weeklyGoalInput.value);

  if (!Number.isInteger(value) || value < 1 || value > 200) {
    alert("Enter a whole-number goal between 1 and 200.");
    return;
  }

  weeklyGoal = value;
  localStorage.setItem(WEEKLY_GOAL_KEY, String(weeklyGoal));
  renderWeeklyReport();
});

downloadWeeklyReportButton.addEventListener("click", () => {
  const weekKey = getCurrentWeekKey();
  const currentWeek = weeklyActivity[weekKey] || {
    completed: [],
    revised: []
  };

  const completedCount = Array.isArray(currentWeek.completed)
    ? currentWeek.completed.length
    : 0;

  const revisedCount = Array.isArray(currentWeek.revised)
    ? currentWeek.revised.length
    : 0;

  const report = [
    "SYLLABUSSOS — WEEKLY STUDY REPORT",
    `Week starting: ${weekKey}`,
    `Topics completed this week: ${completedCount}`,
    `Topics revised this week: ${revisedCount}`,
    `Weekly completion goal: ${weeklyGoal}`,
    `Goal status: ${
      completedCount >= weeklyGoal ? "Reached" : "Not yet reached"
    }`,
    "",
    "Current syllabus overview:",
    `Total topics: ${topics.length}`,
    `Completed topics: ${topics.filter((topic) => topic.completed).length}`,
    `Pending topics: ${topics.filter((topic) => !topic.completed).length}`
  ].join("\n");

  const file = new Blob([report], {
    type: "text/plain;charset=utf-8"
  });

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = `SyllabusSOS-Weekly-Report-${weekKey}.txt`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
});

renderWeeklyReport();
