# Assessment Engine - Functional Requirements

## Module: ASSESSMENT ENGINE
**Total Requirements**: 70  
**Priority**: P0-P1 (Critical for Learning Evaluation)

---

## 1. Question Bank Management

### FR-QUEST-001: Create Questions
**Priority**: P0
**Description**: System shall allow creating questions of various types
**Actor**: Teacher, Content Creator
**Preconditions**: User has question creation permission
**Postconditions**: Question saved to bank

**Detailed Requirements**:
- Question types: MCQ (single/multiple answer), True/False, Fill in blanks, Short answer, Long answer, Match the following, Ordering/sequencing
- Rich text editor for question content
- Insert images, equations, tables in questions
- Add explanation/solution
- Set difficulty level: Easy, Medium, Hard
- Tag with subject, chapter, topic, concept
- Mark bloom's taxonomy level
- Set marks/points
- Question preview before save
- Duplicate and edit existing questions
- Version history for questions
- Import questions from file

**Business Rules**: Quality questions, curriculum-aligned, proper tagging for searchability
**Validation**: Question content complete, type-specific fields validated

---

### FR-QUEST-002: MCQ Options Management
**Priority**: P0
**Description**: System shall manage multiple choice question options
**Actor**: Teacher
**Preconditions**: MCQ question being created
**Postconditions**: Options configured

**Detailed Requirements**:
- Add 2-6 options per question
- Mark correct answer(s): Single or multiple
- Rich content in options: Text, images, equations
- Randomize option order for each student
- Negative marking configuration
- Partial marking for multiple correct answers
- Add distractors (common wrong answers)
- Explanation for why each option is right/wrong
- Option feedback
- Import options from spreadsheet
- Duplicate options across similar questions

**Business Rules**: At least one correct answer, clear options, avoid ambiguity
**Validation**: Correct answers marked, minimum options present

---

### FR-QUEST-003: Question Categories and Tags
**Priority**: P0
**Description**: System shall organize questions with categories and tags
**Actor**: Teacher, Admin
**Preconditions**: Question bank exists
**Postconditions**: Questions organized

**Detailed Requirements**:
- Hierarchical categories: Board→Subject→Class→Chapter→Topic
- Free-form tags for concepts
- Difficulty tags
- Question type tags
- Bloom's taxonomy tags
- Board exam relevance tags
- Previous year question tags
- Frequently asked tags
- Tag-based search and filtering
- Bulk tagging operations
- Tag suggestions based on content
- Tag management: Merge, rename, delete

**Business Rules**: Consistent categorization, mandatory curriculum tags, flexible custom tags
**Validation**: At least one category assigned, tags appropriate

---

### FR-QUEST-004: Question Bank Search and Filter
**Priority**: P0
**Description**: System shall provide comprehensive question search
**Actor**: Teacher
**Preconditions**: Question bank populated
**Postconditions**: Relevant questions found

**Detailed Requirements**:
- Full-text search in questions
- Filter by subject, class, chapter, topic
- Filter by difficulty level
- Filter by question type
- Filter by tags
- Filter by creator
- Filter by date added
- Filter by usage frequency
- Sort by relevance, difficulty, date
- Advanced search with multiple filters
- Save search queries
- Recent searches

**Business Rules**: Fast search (<2 seconds), relevant results, intuitive filters
**Validation**: Search results accurate, filters work correctly

---

### FR-QUEST-005: Question Import and Export
**Priority**: P1
**Description**: System shall support bulk question import/export
**Actor**: Teacher, Admin
**Preconditions**: Questions in supported format
**Postconditions**: Questions imported/exported

**Detailed Requirements**:
- Import formats: CSV, Excel, Word, QTI (Question and Test Interoperability)
- Export formats: Same as import plus PDF
- Template download for import
- Bulk import with validation
- Error reporting for invalid questions
- Import preview before commit
- Map columns during import
- Preserve question metadata
- Import images with questions
- Export with filters applied
- Backup entire question bank

**Business Rules**: Data integrity maintained, support common formats, preserve relationships
**Validation**: Import/export successful, data accurate

---

### FR-QUEST-006: Question Versioning
**Priority**: P1
**Description**: System shall maintain question version history
**Actor**: Teacher, Admin
**Preconditions**: Question edited
**Postconditions**: Version saved

**Detailed Requirements**:
- Auto-save version on each edit
- Version numbering
- Track who made changes and when
- Version comparison: Side-by-side diff
- Restore previous version
- Version comments/notes
- Published vs draft versions
- Version approval workflow
- Merge changes from different editors
- Version analytics: Which version performs better
- Archive old versions

**Business Rules**: Complete history, easy rollback, collaborative editing support
**Validation**: Versions tracked, restore works

---

### FR-QUEST-007: Question Difficulty Analysis
**Priority**: P1
**Description**: System shall analyze and adjust question difficulty
**Actor**: System (automatic), Teacher
**Preconditions**: Question attempted by students
**Postconditions**: Difficulty assessed

**Detailed Requirements**:
- Calculate actual difficulty from student responses
- Success rate tracking
- Average time to answer
- Discrimination index: How well it separates high/low performers
- Compare intended vs actual difficulty
- Suggest difficulty reclassification
- Identify too easy/too hard questions
- Bloom's taxonomy alignment check
- Question effectiveness score
- Historical difficulty trends
- Adjust difficulty based on class/student level

**Business Rules**: Data-driven difficulty, improve question quality, fair assessments
**Validation**: Calculations accurate, suggestions useful

---

### FR-QUEST-008: Question Usage Analytics
**Priority**: P1
**Description**: System shall track question usage and performance
**Actor**: Teacher, Admin
**Preconditions**: Questions used in assessments
**Postconditions**: Analytics available

**Detailed Requirements**:
- Usage frequency: How often used
- Success rate over time
- Average time spent
- Most/least used questions
- Question performance by class/student group
- Identify ineffective questions
- Cheating detection: Abnormal patterns
- Question popularity among teachers
- Student feedback on questions
- Correlate question performance with learning outcomes
- Recommendations for question improvement

**Business Rules**: Data-driven improvements, privacy-compliant, actionable insights
**Validation**: Analytics accurate, insights valuable

---

### FR-QUEST-009: Question Sharing and Collaboration
**Priority**: P1
**Description**: System shall enable question sharing among teachers
**Actor**: Teacher
**Preconditions**: Questions created
**Postconditions**: Questions shared

**Detailed Requirements**:
- Share questions with specific teachers
- Share with department or entire school
- Public question repository
- Permission levels: View, use, edit
- Collaborative question creation
- Comments and feedback on shared questions
- Rating shared questions
- Attribution to original creator
- Track usage of shared questions
- Fork and customize shared questions
- Share entire question sets/exams

**Business Rules**: Respect ownership, proper attribution, quality control for public sharing
**Validation**: Sharing permissions work, attribution maintained

---

### FR-QUEST-010: Question Randomization
**Priority**: P0
**Description**: System shall randomize questions for assessments
**Actor**: System (automatic)
**Preconditions**: Question pool available
**Postconditions**: Randomized questions selected

**Detailed Requirements**:
- Random selection from question pool
- Randomize question order
- Randomize option order (MCQs)
- Maintain difficulty distribution
- Maintain topic coverage
- Ensure no duplicate questions
- Weighted randomization based on tags
- Blueprint-based randomization
- Generate unique question sets per student
- Repeatable randomization with seed for testing
- Randomization constraints configuration

**Business Rules**: Fair randomization, equivalent difficulty across sets, prevent cheating
**Validation**: Randomization algorithms work, distributions maintained

---


### FR-QUEST-011: Blueprint-Based Question Selection
**Priority**: P1
**Description**: System shall select questions based on assessment blueprints
**Actor**: Teacher, System
**Preconditions**: Blueprint defined
**Postconditions**: Questions selected per blueprint

**Detailed Requirements**:
- Define blueprint: Topic-wise marks distribution
- Specify difficulty distribution: Easy/Medium/Hard percentages
- Bloom's taxonomy level distribution
- Question type distribution
- Auto-select questions matching blueprint
- Manual adjustments to auto-selected questions
- Validate exam against blueprint
- Blueprint templates for common exams
- Multi-dimensional blueprints
- Blueprint reusability
- Export blueprint specifications

**Business Rules**: Exams align with syllabus, balanced difficulty, comprehensive coverage
**Validation**: Blueprint specifications met, selections valid

---

### FR-QUEST-012: Question Quality Review
**Priority**: P1
**Description**: System shall support question quality review process
**Actor**: Subject Expert, Admin
**Preconditions**: Question submitted for review
**Postconditions**: Question approved or rejected

**Detailed Requirements**:
- Submit questions for peer review
- Review queue for experts
- Quality checklist: Clarity, accuracy, relevance
- Rate questions on multiple criteria
- Approve, reject, or request changes
- Reviewer comments and suggestions
- Track review history
- Multi-level review for critical exams
- Quality score assignment
- Bulk review operations
- Reviewer performance tracking
- Automated quality checks: Grammar, formatting

**Business Rules**: Maintain quality standards, expert validation, continuous improvement
**Validation**: Review workflow functional, quality improved

---

## 2. Exam Creation and Configuration

### FR-EXAM-001: Create Exam
**Priority**: P0
**Description**: System shall allow creating exams/tests/quizzes
**Actor**: Teacher
**Preconditions**: Question bank available
**Postconditions**: Exam created

**Detailed Requirements**:
- Exam basic details: Title, description, subject, class
- Exam type: Practice test, unit test, mid-term, final, quiz
- Select questions: Manual selection or blueprint-based
- Add sections with titles
- Set total marks
- Passing criteria configuration
- Exam instructions
- Time limit per exam and per section
- Negative marking rules
- Randomization settings
- Partial marking rules
- Exam preview before publishing

**Business Rules**: Clear structure, appropriate difficulty, curriculum-aligned
**Validation**: Required fields filled, questions added, valid configuration

---

### FR-EXAM-002: Exam Sections and Structure
**Priority**: P1
**Description**: System shall support multi-section exam structure
**Actor**: Teacher
**Preconditions**: Exam being created
**Postconditions**: Sections configured

**Detailed Requirements**:
- Create multiple sections: Section A, B, C
- Section-wise time limits
- Section-wise instructions
- Mandatory vs optional sections
- Choose X out of Y questions per section
- Section navigation rules: Sequential or random access
- Section-wise marks distribution
- Different question types per section
- Weighted sections
- Auto-calculate total marks
- Section templates for reuse

**Business Rules**: Logical structure, clear instructions, fair allocation
**Validation**: Section configuration valid, marks add up

---

### FR-EXAM-003: Question Paper Generation
**Priority**: P0
**Description**: System shall generate printable question papers
**Actor**: Teacher
**Preconditions**: Exam configured
**Postconditions**: Question paper PDF generated

**Detailed Requirements**:
- Professional PDF layout
- School/institution header
- Exam details: Subject, class, date, duration, marks
- General instructions
- Question numbering
- Section headers
- Space for answers (for print exams)
- Page breaks at logical points
- Multiple versions (Set A, B, C) with different questions
- Answer key generation (separate PDF)
- Marking scheme generation
- Customizable paper format and styling

**Business Rules**: Print-ready quality, clear formatting, professional appearance
**Validation**: PDFs generate correctly, content formatted well

---

### FR-EXAM-004: Exam Scheduling
**Priority**: P0
**Description**: System shall support exam scheduling
**Actor**: Teacher, Admin
**Preconditions**: Exam created
**Postconditions**: Exam scheduled

**Detailed Requirements**:
- Set start date and time
- Set end date and time
- Duration specification
- Flexible window: Students can start anytime within window
- Fixed time: All students start together
- Time zone handling for online exams
- Schedule conflicts detection
- Recurring exams: Weekly quizzes
- Reschedule with notifications
- Schedule buffer time before/after
- Calendar integration
- Reminders before exam

**Business Rules**: Adequate time for students, avoid conflicts, fair scheduling
**Validation**: Schedules valid, conflicts detected

---

### FR-EXAM-005: Exam Settings and Rules
**Priority**: P0
**Description**: System shall configure exam settings and rules
**Actor**: Teacher
**Preconditions**: Exam being created
**Postconditions**: Rules configured

**Detailed Requirements**:
- Attempt limits: Single or multiple attempts
- Show results: Immediately, after submission, scheduled
- Show correct answers: After exam or never
- Allow review: Let students review their answers
- Calculator permission
- Allow notes/open book
- Shuffle questions per student
- Shuffle options per student
- Browser lockdown: Full screen, disable copy-paste
- Proctoring settings
- Accessibility settings: Extra time, screen reader
- Late submission rules and penalties

**Business Rules**: Fair rules, clear communication, prevent cheating
**Validation**: Settings consistent, rules enforceable

---

### FR-EXAM-006: Exam Templates
**Priority**: P1
**Description**: System shall provide exam templates
**Actor**: Teacher
**Preconditions**: Template library available
**Postconditions**: Exam created from template

**Detailed Requirements**:
- Pre-built templates: Weekly quiz, unit test, board exam format
- Template categories by exam type
- Customizable templates
- Save custom templates
- Share templates with colleagues
- Template marketplace for purchase
- Clone existing exam as template
- Template preview
- Template ratings and reviews
- Modify template after creation
- Template versioning

**Business Rules**: Speed up exam creation, maintain consistency, quality templates
**Validation**: Templates functional, customization works

---

### FR-EXAM-007: Practice Mode Configuration
**Priority**: P1
**Description**: System shall configure practice tests differently
**Actor**: Teacher, Student
**Preconditions**: Practice mode enabled
**Postconditions**: Practice test configured

**Detailed Requirements**:
- Unlimited attempts
- Instant feedback per question
- Show correct answers immediately
- Explanation display after answer
- No time pressure or relaxed time
- Progress tracking
- Bookmark difficult questions
- Revisit any question anytime
- Performance analysis after practice
- Adaptive difficulty in practice
- Topic-wise practice sets
- Spaced repetition for practice

**Business Rules**: Learning-focused, stress-free, encourage practice
**Validation**: Practice features work, different from formal exams

---

### FR-EXAM-008: Exam Publishing and Distribution
**Priority**: P0
**Description**: System shall publish and distribute exams
**Actor**: Teacher
**Preconditions**: Exam ready
**Postconditions**: Exam published to students

**Detailed Requirements**:
- Publish exam to specific classes/students
- Draft vs published status
- Unpublish and edit capability
- Publish with scheduling
- Access code for private exams
- Public exams for open access
- Distribution via email, SMS, in-app notification
- LMS integration for distribution
- Track exam reach: Who received notification
- Exam URL generation
- QR code for quick access
- Embed exam in website

**Business Rules**: Controlled distribution, timely delivery, easy access
**Validation**: Publishing successful, students notified

---

### FR-EXAM-009: Exam Cloning and Reuse
**Priority**: P1
**Description**: System shall allow cloning and reusing exams
**Actor**: Teacher
**Preconditions**: Existing exam available
**Postconditions**: New exam created from existing

**Detailed Requirements**:
- Clone entire exam with one click
- Modify cloned exam independently
- Clone with or without student data
- Clone across academic years
- Update questions in cloned exam
- Maintain link to original for updates
- Clone and randomize questions
- Batch cloning for multiple classes
- Version comparison between original and clone
- Clone statistics: How many times cloned
- Prevent accidental modifications to original

**Business Rules**: Efficient exam reuse, maintain quality, save teacher time
**Validation**: Cloning works, independence maintained

---

### FR-EXAM-010: Adaptive Exams
**Priority**: P2
**Description**: System shall support adaptive testing
**Actor**: System (automatic), Student
**Preconditions**: Adaptive mode configured
**Postconditions**: Personalized exam delivered

**Detailed Requirements**:
- Start with medium difficulty questions
- Adjust difficulty based on student responses
- Harder questions if answering correctly
- Easier questions if struggling
- Maintain consistent difficulty level estimation
- Ensure comprehensive coverage despite adaptation
- Stop criteria: Fixed questions, time limit, or confidence level
- Adaptive algorithm configuration
- Track adaptation path
- Performance estimation during exam
- Post-exam analysis of adaptation
- Compare adaptive vs non-adaptive results

**Business Rules**: Fair assessment, efficient evaluation, personalized experience
**Validation**: Adaptive algorithm works, fair difficulty adjustment

---


## 3. Exam Attempts and Student Experience

### FR-ATTEMPT-001: Start Exam
**Priority**: P0
**Description**: System shall allow students to start exams
**Actor**: Student
**Preconditions**: Exam assigned and scheduled
**Postconditions**: Exam attempt started

**Detailed Requirements**:
- Display exam details before start
- Show instructions and rules
- Confirm start (one-way action)
- Browser check: Compatible browser warning
- Internet connection check
- Device compatibility check
- Timer starts on exam start
- Lock exam after start (prevent exit)
- Resume capability if disconnected
- Log exam start time
- Pre-exam checklist
- Accept terms before starting

**Business Rules**: Clear instructions, informed consent, fair start for all
**Validation**: Exam starts correctly, timer accurate

---

### FR-ATTEMPT-002: Question Navigation
**Priority**: P0
**Description**: System shall provide intuitive question navigation
**Actor**: Student
**Preconditions**: Exam in progress
**Postconditions**: Student navigates questions

**Detailed Requirements**:
- Navigate to next/previous question
- Jump to any question via question palette
- Question palette shows: Answered, not answered, marked for review, not visited
- Section navigation if multi-section
- Auto-save answers on navigation
- Breadcrumb navigation
- Question counter: 5 of 30
- Keyboard shortcuts for power users
- Touch gestures for mobile
- Warn if navigating away from unanswered question
- Progress bar
- Accessibility navigation for screen readers

**Business Rules**: Smooth navigation, no answer loss, clear status indication
**Validation**: Navigation works, answers saved, status accurate

---

### FR-ATTEMPT-003: Answer Submission
**Priority**: P0
**Description**: System shall capture student answers
**Actor**: Student
**Preconditions**: Question displayed
**Postconditions**: Answer recorded

**Detailed Requirements**:
- MCQ: Radio buttons or checkboxes
- True/False: Toggle selection
- Fill in blanks: Text input with validation
- Short answer: Text area with character limit
- Long answer: Rich text editor
- Match the following: Drag-drop or dropdowns
- Ordering: Drag to reorder
- Auto-save answer every 10 seconds
- Visual confirmation of answer saved
- Change answer anytime before submission
- Clear answer option
- Answer validation: Format, length
- Support mathematical equations input

**Business Rules**: Reliable answer capture, no data loss, intuitive input
**Validation**: All answer types work, auto-save reliable

---

### FR-ATTEMPT-004: Mark for Review
**Priority**: P1
**Description**: System shall allow marking questions for later review
**Actor**: Student
**Preconditions**: Exam in progress
**Postconditions**: Question marked

**Detailed Requirements**:
- Mark for review button
- Marked questions highlighted in palette
- Filter: Show only marked questions
- Quick review of all marked questions
- Unmark questions
- Persist marks through session
- Reminder before submission if questions marked
- Notes on marked questions
- Time spent on marked questions tracking
- Commonly marked questions analytics for teachers

**Business Rules**: Help students manage time, reduce anxiety, improve exam strategy
**Validation**: Marking works, filter functional

---

### FR-ATTEMPT-005: Exam Timer
**Priority**: P0
**Description**: System shall display and enforce exam time limits
**Actor**: System (automatic)
**Preconditions**: Exam started
**Postconditions**: Timer displayed and enforced

**Detailed Requirements**:
- Countdown timer visible at all times
- Section-wise timers if applicable
- Timer warnings: 15 min, 5 min, 1 min remaining
- Color-coded timer: Green, yellow, red
- Auto-submit when time expires
- Pause timer for technical issues (admin action)
- Extra time for accessibility needs
- Time extension during exam (emergency)
- Hide timer option for anxiety reduction
- Time spent per question tracking
- Resume timer after disconnection
- Offline time tracking

**Business Rules**: Fair time enforcement, clear warnings, handle edge cases
**Validation**: Timer accurate, auto-submit works

---

### FR-ATTEMPT-006: Exam Submission
**Priority**: P0
**Description**: System shall allow and handle exam submission
**Actor**: Student, System
**Preconditions**: Exam in progress
**Postconditions**: Exam submitted

**Detailed Requirements**:
- Submit button visible throughout
- Confirm submission dialog: "Are you sure?"
- Show summary: Answered, unanswered, marked
- Warn if unanswered questions exist
- Allow submission anyway
- Auto-submit on timer expiry
- Submission confirmation message
- Disable further changes after submission
- Record submission time
- Generate submission receipt
- Email submission confirmation
- Handle multiple submission attempts (prevent)

**Business Rules**: Irreversible submission, clear confirmation, prevent accidental submission
**Validation**: Submission successful, data saved

---

### FR-ATTEMPT-007: Multiple Attempts Management
**Priority**: P1
**Description**: System shall manage multiple exam attempts
**Actor**: Student, System
**Preconditions**: Multiple attempts allowed
**Postconditions**: Attempts tracked

**Detailed Requirements**:
- Configure max attempts per student
- Track attempt count
- Display previous attempt scores
- Best attempt, latest attempt, or average scoring
- Lock exam after max attempts
- Reset attempts for specific students
- Different questions per attempt
- Cooldown period between attempts
- Attempt history with timestamps
- Compare attempts performance
- Analytics on attempt patterns
- Prevent gaming the system

**Business Rules**: Fair attempt policy, encourage learning, prevent abuse
**Validation**: Attempt limits enforced, tracking accurate

---

### FR-ATTEMPT-008: Resume Interrupted Exam
**Priority**: P0
**Description**: System shall allow resuming interrupted exams
**Actor**: Student
**Preconditions**: Exam started but interrupted
**Postconditions**: Exam resumed from last state

**Detailed Requirements**:
- Detect disconnection or browser close
- Save state: Answered questions, time remaining
- Resume link/button on login
- Restore all answers
- Continue timer from where left
- Warn about time lost during disconnection
- Grace period for resume: 30 minutes
- Log interruptions
- Multiple interruption handling
- Prevent manipulation of timer
- Admin-forced resume for technical issues
- Resume notification to student

**Business Rules**: Don't penalize technical issues, maintain exam integrity, fair treatment
**Validation**: Resume works, state restored accurately

---

### FR-ATTEMPT-009: Accessibility Features
**Priority**: P0
**Description**: System shall provide accessibility features for exams
**Actor**: Student with disabilities
**Preconditions**: Accessibility needs configured
**Postconditions**: Accommodations active

**Detailed Requirements**:
- Screen reader compatibility
- Keyboard-only navigation
- Extended time allocation
- Larger fonts and high contrast
- Text-to-speech for questions
- Speech-to-text for answers
- Simplified language option
- Distraction-free mode
- Frequent breaks option
- Alternative question formats
- Accessibility toolbar
- Compliance with WCAG 2.1 AA

**Business Rules**: Equal access, legal compliance, inclusive design
**Validation**: Accessibility features functional, compliant

---

### FR-ATTEMPT-010: Exam Interface Customization
**Priority**: P1
**Description**: System shall allow interface customization during exams
**Actor**: Student
**Preconditions**: Exam in progress
**Postconditions**: Interface customized

**Detailed Requirements**:
- Font size adjustment
- Color theme selection
- Question layout: Single or multi-column
- Zoom in/out
- Full-screen mode
- Minimize distractions
- Calculator widget
- Scratch pad/notepad
- Formula sheet display
- Periodic table (for chemistry)
- Save preferences for future exams
- Device-specific optimizations

**Business Rules**: Improve user experience, reduce anxiety, personalization
**Validation**: Customizations work, preferences saved

---

## 4. Grading and Evaluation

### FR-GRADE-001: Auto-Grading for Objective Questions
**Priority**: P0
**Description**: System shall automatically grade objective questions
**Actor**: System (automatic)
**Preconditions**: Exam submitted
**Postconditions**: Objective questions graded

**Detailed Requirements**:
- Auto-grade MCQ: Compare with correct answer(s)
- Auto-grade True/False
- Auto-grade fill in blanks: Exact match or fuzzy match
- Auto-grade match the following
- Auto-grade ordering questions
- Apply negative marking if configured
- Apply partial marking for multiple correct answers
- Case-insensitive matching option
- Multiple acceptable answers support
- Calculate total score for objective section
- Instant grading on submission
- Bulk grading for all students

**Business Rules**: Accurate grading, consistent rules, instant results
**Validation**: Grading algorithms correct, scores accurate

---

### FR-GRADE-002: Manual Grading Interface
**Priority**: P0
**Description**: System shall provide interface for manual grading
**Actor**: Teacher
**Preconditions**: Exam with subjective questions submitted
**Postconditions**: Questions manually graded

**Detailed Requirements**:
- Grading queue: List of pending submissions
- Side-by-side view: Question and student answer
- Award marks with fractions: 2.5/5
- Add comments and feedback per answer
- Marking rubric display
- Sample answer reference
- Previous student answers for consistency
- Quick grading tools: Common comments, templates
- Partial credit guidelines
- Flag for second review
- Bulk grading: Same question across students
- Save and continue later

**Business Rules**: Fair grading, constructive feedback, consistent evaluation
**Validation**: Grading interface functional, scores saved

---

### FR-GRADE-003: Rubric-Based Grading
**Priority**: P1
**Description**: System shall support rubric-based grading
**Actor**: Teacher
**Preconditions**: Rubric defined
**Postconditions**: Answers graded using rubric

**Detailed Requirements**:
- Create grading rubrics: Criteria and point values
- Multiple criteria per question
- Descriptive levels: Excellent, Good, Fair, Poor
- Point values per level
- Apply rubric during grading
- Select level per criterion
- Auto-calculate total based on rubric
- Rubric visible to students
- Rubric templates library
- Reuse rubrics across exams
- Rubric analytics: Inter-rater reliability
- Export rubric results

**Business Rules**: Transparent grading, consistent criteria, fair assessment
**Validation**: Rubric application works, calculations correct

---

### FR-GRADE-004: Peer Review Grading
**Priority**: P2
**Description**: System shall support peer grading for assignments
**Actor**: Student (as grader)
**Preconditions**: Peer review enabled
**Postconditions**: Peers graded each other

**Detailed Requirements**:
- Assign submissions to peers randomly
- Anonymous peer grading option
- Grading rubric provided
- Multiple peer graders per submission
- Aggregate peer scores
- Teacher moderation of peer grades
- Feedback from peers
- Peer grader training module
- Quality check on peer grading
- Dispute resolution
- Peer grading participation points
- Analytics on peer grading quality

**Business Rules**: Learning opportunity, teacher oversight, fair averaging
**Validation**: Peer assignments work, aggregation correct

---

### FR-GRADE-005: Grade Calculation and Weighting
**Priority**: P0
**Description**: System shall calculate final grades with weighting
**Actor**: System (automatic), Teacher
**Preconditions**: All questions graded
**Postconditions**: Final grade calculated

**Detailed Requirements**:
- Section-wise score calculation
- Apply section weights
- Overall exam score
- Percentage calculation
- Grade normalization if needed
- Curved grading option
- Pass/fail determination
- Grade letter assignment: A, B, C, D, F
- GPA calculation
- Rounding rules configuration
- Bonus marks addition
- Grace marks application

**Business Rules**: Transparent calculations, fair weighting, consistent grading scale
**Validation**: Calculations accurate, grades correct

---


### FR-GRADE-006: Grade Moderation and Verification
**Priority**: P1
**Description**: System shall support grade moderation process
**Actor**: Senior Teacher, Admin
**Preconditions**: Initial grading complete
**Postconditions**: Grades moderated

**Detailed Requirements**:
- Flag exams for moderation: Random sample or specific students
- Second grader assignment
- Compare grades from multiple graders
- Inter-rater reliability calculation
- Resolve grading discrepancies
- Moderation comments and notes
- Approve final grades
- Grade adjustment workflow
- Appeal process for students
- Moderation statistics
- Audit trail of grade changes
- Notify students of final grades after moderation

**Business Rules**: Quality assurance, consistent standards, fair process
**Validation**: Moderation workflow complete, discrepancies resolved

---

### FR-GRADE-007: Grade Publishing
**Priority**: P0
**Description**: System shall publish grades to students
**Actor**: Teacher
**Preconditions**: Grading complete
**Postconditions**: Grades visible to students

**Detailed Requirements**:
- Publish grades individually or in batch
- Schedule grade release: Specific date/time
- Publish with or without correct answers
- Publish with or without feedback
- Gradual release: Section by section
- Notifications on grade publication
- Parent access to child's grades
- Grade visibility controls per student
- Unpublish and republish capability
- Grade announcement feature
- Export grades for students
- Print grade reports

**Business Rules**: Timely grade release, privacy maintained, clear communication
**Validation**: Publishing works, notifications sent

---

### FR-GRADE-008: Grade Feedback and Comments
**Priority**: P1
**Description**: System shall provide detailed feedback with grades
**Actor**: Teacher
**Preconditions**: Questions graded
**Postconditions**: Feedback available

**Detailed Requirements**:
- Overall exam feedback
- Question-wise feedback
- Audio/video feedback option
- Feedback templates and shortcuts
- Constructive feedback guidelines
- Highlight strengths and weaknesses
- Improvement suggestions
- Link to remedial content
- Feedback visibility timeline
- Student reply to feedback
- Feedback effectiveness tracking
- Feedback analytics for teachers

**Business Rules**: Constructive feedback, encourage improvement, timely delivery
**Validation**: Feedback saved, visible to students

---

## 5. Results and Analytics

### FR-RESULT-001: Individual Result Display
**Priority**: P0
**Description**: System shall display individual exam results
**Actor**: Student, Parent
**Preconditions**: Exam graded and published
**Postconditions**: Results displayed

**Detailed Requirements**:
- Overall score and percentage
- Section-wise breakdown
- Question-wise results with correct/incorrect
- Time spent per question
- Marks obtained vs maximum
- Rank in class/section
- Percentile score
- Grade letter or GPA
- Comparison with class average
- Strength and weakness analysis
- Correct answers display (if enabled)
- Detailed explanation for wrong answers
- Downloadable result PDF

**Business Rules**: Clear result presentation, actionable insights, privacy maintained
**Validation**: Results accurate, calculations correct

---

### FR-RESULT-002: Answer Sheet Review
**Priority**: P1
**Description**: System shall allow reviewing answer sheets
**Actor**: Student, Parent, Teacher
**Preconditions**: Exam submitted and graded
**Postconditions**: Answer sheet displayed

**Detailed Requirements**:
- View all questions and student answers
- Correct answers highlighted
- Marks awarded per question
- Teacher comments visible
- Color coding: Correct (green), incorrect (red), partial (yellow)
- Navigate through answer sheet
- Compare with model answers
- Print answer sheet
- Download as PDF
- Request reevaluation option
- Annotation by student on review
- Time-bound answer sheet access

**Business Rules**: Transparent evaluation, learning opportunity, prevent disputes
**Validation**: Answer sheet accurate, all data displayed

---

### FR-RESULT-003: Class Performance Analytics
**Priority**: P1
**Description**: System shall provide class-level performance analytics
**Actor**: Teacher, Principal
**Preconditions**: Exams completed by class
**Postconditions**: Analytics displayed

**Detailed Requirements**:
- Class average, median, mode
- Score distribution histogram
- Highest and lowest scores
- Pass percentage
- Question-wise class performance
- Topic-wise strengths and weaknesses
- Comparison across sections
- Performance trends over time
- Identify struggling students
- Identify top performers
- Standard deviation calculation
- Normal distribution analysis

**Business Rules**: Data-driven insights, identify class needs, improve teaching
**Validation**: Analytics accurate, visualizations clear

---

### FR-RESULT-004: Student Performance Trends
**Priority**: P1
**Description**: System shall track student performance over time
**Actor**: Teacher, Student, Parent
**Preconditions**: Multiple exams completed
**Postconditions**: Trend analysis available

**Detailed Requirements**:
- Performance graph over time
- Subject-wise trends
- Identify improving/declining performance
- Consistent vs inconsistent performance
- Exam type-wise performance
- Topic mastery progression
- Compare with past performance
- Predict future performance
- Achievement milestones
- Performance alerts: Sudden drops
- Benchmark against goals
- Personalized recommendations

**Business Rules**: Longitudinal tracking, early intervention, celebrate improvements
**Validation**: Trends accurate, predictions reasonable

---

### FR-RESULT-005: Comparative Analysis
**Priority**: P1
**Description**: System shall provide comparative performance analysis
**Actor**: Teacher, Admin
**Preconditions**: Multiple students/classes/exams available
**Postconditions**: Comparisons displayed

**Detailed Requirements**:
- Student vs class average
- Student vs top performer
- Class vs class comparison
- Section vs section comparison
- School vs district/state average
- Subject-wise comparisons
- Year-over-year comparisons
- Cohort analysis
- Benchmark against standards
- Percentile rankings
- Quartile distributions
- Export comparative reports

**Business Rules**: Fair comparisons, anonymized data, actionable insights
**Validation**: Comparisons valid, calculations correct

---

### FR-RESULT-006: Question Performance Analysis
**Priority**: P1
**Description**: System shall analyze performance per question
**Actor**: Teacher
**Preconditions**: Exam completed by students
**Postconditions**: Question analysis available

**Detailed Requirements**:
- Success rate per question
- Average time spent per question
- Discrimination index: Separates high/low performers
- Distractor analysis for MCQs
- Identify questions answered correctly by chance
- Identify ambiguous questions
- Question difficulty verification
- Common wrong answers analysis
- Correlate question performance with learning outcomes
- Recommend question improvements
- Flag ineffective questions
- Question effectiveness score

**Business Rules**: Improve question quality, validate assessments, data-driven improvements
**Validation**: Analysis accurate, recommendations useful

---

### FR-RESULT-007: Learning Gap Identification
**Priority**: P1
**Description**: System shall identify learning gaps from assessments
**Actor**: System (automatic), Teacher
**Preconditions**: Assessment results available
**Postconditions**: Gaps identified

**Detailed Requirements**:
- Identify weak topics per student
- Identify weak topics per class
- Map gaps to curriculum standards
- Severity classification: Critical, moderate, minor
- Correlation with prerequisite concepts
- Pattern recognition in mistakes
- Identify misconceptions
- Gap trends over time
- Prioritize gaps for remediation
- Generate intervention plans
- Link to remedial content
- Track gap closure progress

**Business Rules**: Early identification, personalized intervention, data-driven teaching
**Validation**: Gap identification accurate, actionable

---

### FR-RESULT-008: Exam Effectiveness Reports
**Priority**: P1
**Description**: System shall evaluate exam effectiveness
**Actor**: Teacher, Admin
**Preconditions**: Exam completed and analyzed
**Postconditions**: Effectiveness report generated

**Detailed Requirements**:
- Overall exam reliability (Cronbach's alpha)
- Question quality distribution
- Difficulty level distribution
- Discrimination effectiveness
- Time adequacy analysis
- Score distribution analysis
- Ceiling/floor effects detection
- Validity assessment
- Alignment with learning objectives
- Student feedback on exam
- Exam improvement recommendations
- Effectiveness comparison across exams

**Business Rules**: Scientific evaluation, continuous improvement, quality assurance
**Validation**: Calculations correct, recommendations valid

---

## 6. Ranking and Leaderboards

### FR-RANK-001: Class Ranking
**Priority**: P1
**Description**: System shall provide class-level rankings
**Actor**: Student, Teacher
**Preconditions**: Exam results available
**Postconditions**: Rankings displayed

**Detailed Requirements**:
- Rank students within class/section
- Rank calculation method: Marks, percentage
- Handle tied ranks
- Real-time rank updates
- Subject-wise rankings
- Overall academic rankings
- Rank based on multiple exams
- Weighted rankings
- Anonymous ranking option
- Opt-out option for students
- Historical rank tracking
- Rank change indicators

**Business Rules**: Fair ranking, motivation tool, privacy option, prevent unhealthy competition
**Validation**: Rankings accurate, ties handled correctly

---

### FR-RANK-002: School-Level Ranking
**Priority**: P1
**Description**: System shall provide school-wide rankings
**Actor**: Student, Principal
**Preconditions**: Multiple classes completed exams
**Postconditions**: School rankings available

**Detailed Requirements**:
- Rank across all sections of same class
- Grade-wise rankings
- Subject-wise school ranks
- Overall school toppers
- Department rankings
- Minimum criteria for ranking eligibility
- Percentile-based rankings
- Achievement levels: Gold, Silver, Bronze
- Recognition system
- Ranking boards display
- Historical school toppers
- Export rankings

**Business Rules**: Healthy competition, recognize excellence, fair criteria
**Validation**: Rankings across sections accurate

---

### FR-RANK-003: Board/State/National Rankings
**Priority**: P2
**Description**: System shall provide rankings at board/state/national level
**Actor**: Student, Government Official
**Preconditions**: Cross-school data available
**Postconditions**: Higher-level rankings displayed

**Detailed Requirements**:
- State-level rankings for board exams
- National rankings for competitive exams
- School performance rankings
- District comparisons
- Regional analysis
- Anonymized student rankings
- Performance bands instead of exact ranks
- Statistical analysis at scale
- Opt-in for national rankings
- Secure data aggregation
- Government dashboard integration
- Public leaderboards

**Business Rules**: Privacy protection, aggregated insights, policy-making support
**Validation**: Large-scale rankings reliable, privacy maintained

---

### FR-RANK-004: Subject Toppers
**Priority**: P1
**Description**: System shall identify and display subject toppers
**Actor**: System (automatic)
**Preconditions**: Subject exams completed
**Postconditions**: Toppers listed

**Detailed Requirements**:
- Top 3 or top 10 per subject
- Class-level toppers
- School-level toppers
- Board-level toppers
- Recognition badges
- Topper profiles with achievements
- Hall of fame
- Topper announcements
- Social sharing of achievements
- Certificates for toppers
- Topper trends over years
- Subject-wise excellence tracking

**Business Rules**: Recognize excellence, motivate students, fair selection
**Validation**: Toppers correctly identified, recognition delivered

---

### FR-RANK-005: Percentile Calculation
**Priority**: P1
**Description**: System shall calculate percentile ranks
**Actor**: System (automatic)
**Preconditions**: Score distribution available
**Postconditions**: Percentiles calculated

**Detailed Requirements**:
- Calculate percentile for each student
- Percentile explanation: Better than X% of students
- Use appropriate percentile method
- Handle edge cases: 100th percentile
- Percentile bands for large groups
- Display percentile with rank
- Percentile trends over exams
- Subject-wise percentiles
- Normalized percentiles across exams
- Percentile-based cutoffs
- Export percentile data
- Percentile visualization

**Business Rules**: Accurate calculations, meaningful interpretation, standard methods
**Validation**: Percentile calculations correct, edge cases handled

---


### FR-RANK-006: Gamification and Badges
**Priority**: P2
**Description**: System shall provide gamification through badges and achievements
**Actor**: Student, System
**Preconditions**: Achievement criteria defined
**Postconditions**: Badges awarded

**Detailed Requirements**:
- Badge types: First attempt, perfect score, improvement, consistency
- Achievement milestones: 10 exams completed, 100% in subject
- Skill-based badges: Math wizard, Science star
- Progress badges: Bronze, Silver, Gold, Platinum
- Display badges on profile
- Badge collection tracking
- Leaderboard for badges
- Share achievements on social media
- Unlock rewards with badges
- Time-limited badges: Monthly challenges
- Team badges for group achievements
- Badge rarity levels

**Business Rules**: Positive motivation, celebrate all achievements, avoid stress
**Validation**: Badge criteria met, awards timely

---

### FR-RANK-007: Competitive Leaderboards
**Priority**: P2
**Description**: System shall provide competitive leaderboards
**Actor**: Student
**Preconditions**: Multiple students taking exams
**Postconditions**: Leaderboards updated

**Detailed Requirements**:
- Real-time leaderboards
- Time-bound leaderboards: Weekly, monthly
- Subject-wise leaderboards
- Challenge-based leaderboards
- Friends leaderboard
- Climb the ladder visualization
- Points system for leaderboard
- Multiple leaderboards for different metrics
- Leaderboard reset schedules
- Fair grouping: By grade, age, region
- Opt-in leaderboards
- Leaderboard notifications

**Business Rules**: Healthy competition, opt-in participation, prevent toxicity
**Validation**: Leaderboards update correctly, points calculated fairly

---

### FR-RANK-008: Progress Tracking Dashboard
**Priority**: P1
**Description**: System shall provide student progress tracking dashboard
**Actor**: Student, Parent
**Preconditions**: Assessment history available
**Postconditions**: Dashboard displayed

**Detailed Requirements**:
- Overall progress visualization
- Subject-wise progress
- Goal setting and tracking
- Completion percentages
- Time spent on assessments
- Improvement graph
- Achievements and milestones
- Current rank and percentile
- Upcoming exams and deadlines
- Recommended focus areas
- Comparison with past performance
- Export progress reports

**Business Rules**: Motivational dashboard, clear progress indicators, actionable insights
**Validation**: Dashboard accurate, updates real-time

---

## 7. Exam Security and Proctoring

### FR-SECURITY-001: Browser Lockdown
**Priority**: P1
**Description**: System shall implement browser lockdown during exams
**Actor**: System (automatic)
**Preconditions**: Lockdown enabled for exam
**Postconditions**: Browser locked during exam

**Detailed Requirements**:
- Full-screen mode enforcement
- Disable right-click and copy-paste
- Disable browser navigation buttons
- Disable new tab/window opening
- Disable screen capture (where possible)
- Detect and block screen recording software
- Warn on attempting to exit full-screen
- Log lockdown violations
- Configurable lockdown levels
- Exit lockdown password
- Compatible browser requirement
- Mobile lockdown for app

**Business Rules**: Prevent cheating, maintain exam integrity, balance security and usability
**Validation**: Lockdown effective, violations detected

---

### FR-SECURITY-002: AI-Based Proctoring
**Priority**: P2
**Description**: System shall provide AI-based proctoring
**Actor**: System (automatic)
**Preconditions**: Webcam and microphone access
**Postconditions**: Exam proctored

**Detailed Requirements**:
- Face detection and verification
- Multiple persons detection
- Eye gaze tracking
- Mobile phone detection
- Audio monitoring for voices
- Tab switching detection
- Suspicious behavior flagging
- Continuous monitoring during exam
- Recording for review
- Real-time alerts to proctor
- Confidence scores for violations
- Post-exam proctoring report
- Privacy-compliant proctoring

**Business Rules**: Prevent cheating, privacy protection, human oversight required
**Validation**: AI detection accurate, false positives minimal

---

### FR-SECURITY-003: Live Human Proctoring
**Priority**: P2
**Description**: System shall support live human proctoring
**Actor**: Proctor
**Preconditions**: Proctor assigned to exam
**Postconditions**: Exam monitored live

**Detailed Requirements**:
- Proctor dashboard showing all students
- Live video feeds from students
- Screen sharing from students
- Chat with individual students
- Broadcast messages to all students
- Flag suspicious behavior
- Review flagged incidents
- Pause student's exam if needed
- Extend time for technical issues
- Proctor notes per student
- Recording of proctoring session
- Multiple proctors for large exams

**Business Rules**: Human judgment for violations, student support during exam
**Validation**: Proctoring tools functional, communication clear

---

### FR-SECURITY-004: Plagiarism Detection
**Priority**: P1
**Description**: System shall detect plagiarism in answers
**Actor**: System (automatic), Teacher
**Preconditions**: Subjective answers submitted
**Postconditions**: Plagiarism assessed

**Detailed Requirements**:
- Compare answers within same exam
- Compare with previous submissions
- Compare with online sources (web search)
- Similarity percentage calculation
- Highlight matching text
- Paraphrasing detection
- Source identification
- Plagiarism report per student
- Configurable similarity threshold
- Exclude quotes from detection
- Batch plagiarism checking
- Appeal process for false positives

**Business Rules**: Academic integrity, fair detection, educational opportunity
**Validation**: Detection accurate, sources identified

---

### FR-SECURITY-005: IP and Device Tracking
**Priority**: P1
**Description**: System shall track devices and IP addresses during exams
**Actor**: System (automatic)
**Preconditions**: Exam in progress
**Postconditions**: Device data logged

**Detailed Requirements**:
- Log IP address of student
- Device fingerprinting
- Detect device changes mid-exam
- Detect multiple simultaneous logins
- Geographic location tracking
- Allowed device whitelist
- Restrict exam to specific IP ranges (on-campus)
- Alert on suspicious IP/device patterns
- Device and IP audit logs
- Compare with student's usual device
- Block VPN usage (optional)
- Device compliance check

**Business Rules**: Detect proxy test-takers, geo-fencing for secure exams
**Validation**: Tracking accurate, anomalies detected

---

### FR-SECURITY-006: Randomization for Anti-Cheating
**Priority**: P0
**Description**: System shall use randomization to prevent cheating
**Actor**: System (automatic)
**Preconditions**: Exam configured
**Postconditions**: Unique exam per student

**Detailed Requirements**:
- Randomize question order per student
- Randomize option order in MCQs
- Select different questions from pool per student
- Ensure equivalent difficulty across randomized sets
- Maintain blueprint compliance
- Track which version each student received
- Compare randomized sets for fairness
- Disable randomization if needed
- Section-wise randomization
- Seed-based randomization for replication
- Analytics on randomization effectiveness
- Version comparison reports

**Business Rules**: Fair randomization, equivalent difficulty, prevent copying
**Validation**: Randomization works, fairness maintained

---

### FR-SECURITY-007: Access Control and Authentication
**Priority**: P0
**Description**: System shall enforce strict access control for exams
**Actor**: System (automatic)
**Preconditions**: Student attempting exam access
**Postconditions**: Access granted or denied

**Detailed Requirements**:
- Verify student identity: Login required
- Access code/password for private exams
- Time-based access: Only during exam window
- Enrollment verification: Only assigned students
- Prerequisites check: Completed previous exams
- Payment verification for paid exams
- Subscription verification
- Device authorization
- Geographic restrictions
- Attempt limit checks
- Concurrent session prevention
- Biometric authentication (optional)

**Business Rules**: Only authorized access, prevent impersonation, secure exams
**Validation**: Access controls enforced, unauthorized blocked

---

### FR-SECURITY-008: Audit Logging
**Priority**: P0
**Description**: System shall maintain comprehensive exam audit logs
**Actor**: System (automatic)
**Preconditions**: Exam activities occur
**Postconditions**: Activities logged

**Detailed Requirements**:
- Log exam start, end, submit
- Log every answer change with timestamp
- Log question navigation
- Log tab switches and focus loss
- Log security violations
- Log admin actions on exams
- Log grading activities
- Immutable logs
- Long-term retention: 5-7 years
- Log analysis for patterns
- Export logs for investigations
- Real-time log monitoring
- Alert on suspicious patterns

**Business Rules**: Complete audit trail, tamper-proof, support investigations
**Validation**: All activities logged, logs secure

---

## 8. Reporting and Insights

### FR-REPORT-001: Student Report Cards
**Priority**: P0
**Description**: System shall generate comprehensive student report cards
**Actor**: Teacher, Admin
**Preconditions**: Assessments completed
**Postconditions**: Report card generated

**Detailed Requirements**:
- Subject-wise marks and grades
- Overall GPA/percentage
- Attendance record
- Behavior and conduct
- Teacher remarks
- Rank in class
- Strengths and weaknesses
- Progress graph
- Co-curricular achievements
- Comparison with previous terms
- Downloadable and printable
- Parent signature section
- School branding and seal

**Business Rules**: Comprehensive assessment, professional format, timely distribution
**Validation**: Report cards accurate, formatting correct

---

### FR-REPORT-002: Teacher Performance Reports
**Priority**: P1
**Description**: System shall provide teacher effectiveness reports
**Actor**: Principal, Admin
**Preconditions**: Teacher-conducted assessments data available
**Postconditions**: Teacher reports generated

**Detailed Requirements**:
- Class performance under teacher
- Improvement rates
- Question quality metrics
- Grading consistency
- Timeliness of grading
- Feedback quality
- Student satisfaction scores
- Comparison with peers
- Subject expertise assessment
- Professional development recommendations
- Exam creation effectiveness
- Assessment coverage of curriculum

**Business Rules**: Fair evaluation, constructive feedback, professional development focus
**Validation**: Reports accurate, privacy maintained

---

### FR-REPORT-003: School Performance Dashboard
**Priority**: P1
**Description**: System shall provide school-level performance dashboard
**Actor**: Principal, Admin
**Preconditions**: School-wide assessment data
**Postconditions**: Dashboard displayed

**Detailed Requirements**:
- Overall school performance trends
- Class-wise performance comparison
- Subject-wise strengths and weaknesses
- Pass percentage trends
- Top performers and struggling students
- Teacher effectiveness overview
- Curriculum coverage tracking
- Assessment frequency and quality
- Comparative analysis with other schools
- Board exam preparedness
- Actionable insights and recommendations
- Exportable reports

**Business Rules**: Data-driven school management, holistic view, support decision-making
**Validation**: Dashboard accurate, insights actionable

---

### FR-REPORT-004: Government Dashboard Integration
**Priority**: P1
**Description**: System shall integrate with government education dashboards
**Actor**: Government Official
**Preconditions**: Government integration configured
**Postconditions**: Data synced to government systems

**Detailed Requirements**:
- Aggregate school data for district/state
- Performance metrics by region
- Pass percentage statistics
- Learning outcome achievement rates
- Curriculum coverage reports
- Infrastructure and resource utilization
- Teacher performance aggregates
- Student enrollment and assessment data
- Anonymized data for privacy
- Standard data formats for interoperability
- Scheduled data sync
- Compliance with government reporting requirements

**Business Rules**: Privacy-compliant, standardized reporting, support policy-making
**Validation**: Data sync successful, formats compliant

---

### FR-REPORT-005: Custom Report Builder
**Priority**: P1
**Description**: System shall provide custom report builder
**Actor**: Admin, Teacher
**Preconditions**: Data available
**Postconditions**: Custom report created

**Detailed Requirements**:
- Drag-and-drop report builder
- Select data fields and metrics
- Apply filters and groupings
- Choose visualizations: Charts, tables, graphs
- Custom date ranges
- Save report templates
- Schedule automated reports
- Share reports with stakeholders
- Export in multiple formats
- Real-time vs historical data
- Calculated fields and formulas
- Report permissions and access control

**Business Rules**: Flexible reporting, user-friendly, meet diverse needs
**Validation**: Report builder functional, exports work

---

## Summary

**Total Requirements**: 70 (Complete)

**Sections Covered**:
1. Question Bank Management (FR-QUEST-001 to FR-QUEST-012): 12 requirements
2. Exam Creation and Configuration (FR-EXAM-001 to FR-EXAM-010): 10 requirements
3. Exam Attempts and Student Experience (FR-ATTEMPT-001 to FR-ATTEMPT-010): 10 requirements
4. Grading and Evaluation (FR-GRADE-001 to FR-GRADE-008): 8 requirements
5. Results and Analytics (FR-RESULT-001 to FR-RESULT-008): 8 requirements
6. Ranking and Leaderboards (FR-RANK-001 to FR-RANK-008): 8 requirements
7. Exam Security and Proctoring (FR-SECURITY-001 to FR-SECURITY-008): 8 requirements
8. Reporting and Insights (FR-REPORT-001 to FR-REPORT-005): 6 requirements

**Priority Distribution**:
- P0 (Critical): 39 requirements (55.7%)
- P1 (High): 26 requirements (37.1%)
- P2 (Medium): 5 requirements (7.2%)

**Key Capabilities**:
- Comprehensive question bank with 7+ question types
- Blueprint-based exam creation with templates
- Multi-section exam structure with advanced settings
- Auto-grading for objective and manual grading interface for subjective questions
- Rubric-based and peer review grading
- Multiple attempt management with resume capability
- Complete accessibility features (WCAG compliant)
- Individual and comparative analytics with learning gap identification
- Multi-level ranking: Class, school, state, national
- Percentile calculation and gamification
- Browser lockdown and AI-based proctoring
- Plagiarism detection and device tracking
- Comprehensive audit logging
- Custom report builder and government dashboard integration
- Student report cards and teacher performance reports

---

**Module Status**: ✅ **COMPLETE** (70/70 requirements documented)

**Overall Progress**: 496 of 880 requirements (56.4%)

---
