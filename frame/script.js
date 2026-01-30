let courseCounter = 1;

// AIUB Grading Scale
const GRADING_SCALE = [
    { min: 90, max: 100, grade: 'A+', point: 4.0 },
    { min: 85, max: 89, grade: 'A', point: 3.75 },
    { min: 80, max: 84, grade: 'B+', point: 3.5 },
    { min: 75, max: 79, grade: 'B', point: 3.25 },
    { min: 70, max: 74, grade: 'C+', point: 3.0 },
    { min: 65, max: 69, grade: 'C', point: 2.75 },
    { min: 60, max: 64, grade: 'D+', point: 2.5 },
    { min: 50, max: 59, grade: 'D', point: 2.25 },
    { min: 0, max: 49, grade: 'F', point: 0.0 }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('AIUB CGPA Calculator Initialized');
    attachRealTimeListeners();
});

/**
 * Convert marks to grade information
 * @param {number} marks - Student's marks (0-100)
 * @returns {object} Grade information {grade, point}
 */
function marksToGrade(marks) {
    if (marks < 0 || marks > 100) {
        return { grade: 'Invalid', point: 0.0 };
    }
    
    for (let scale of GRADING_SCALE) {
        if (marks >= scale.min && marks <= scale.max) {
            return { grade: scale.grade, point: scale.point };
        }
    }
    
    return { grade: 'F', point: 0.0 };
}

/**
 * Attach real-time listeners to course inputs for live grade display
 */
function attachRealTimeListeners() {
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('course-marks')) {
            const courseRow = e.target.closest('.course-row');
            const gradeDisplay = courseRow.querySelector('.grade-result');
            const marks = parseFloat(e.target.value);
            
            if (!isNaN(marks) && marks >= 0 && marks <= 100) {
                const gradeInfo = marksToGrade(marks);
                gradeDisplay.textContent = `${gradeInfo.grade} (${gradeInfo.point.toFixed(2)})`;
                gradeDisplay.style.color = getGradeColor(gradeInfo.grade);
            } else if (marks > 100) {
                gradeDisplay.textContent = 'Max 100';
                gradeDisplay.style.color = '#ef4444';
            } else {
                gradeDisplay.textContent = '-';
                gradeDisplay.style.color = '#f59e0b';
            }
        }
    });
}

/**
 * Get color for grade display
 * @param {string} grade - Letter grade
 * @returns {string} Color code
 */
function getGradeColor(grade) {
    const colors = {
        'A+': '#16a34a',
        'A': '#16a34a',
        'B+': '#004ea2',
        'B': '#004ea2',
        'C+': '#64748b',
        'C': '#64748b',
        'D+': '#b45309',
        'D': '#b45309',
        'F': '#dc2626'
    };
    return colors[grade] || '#f59e0b';
}

/**
 * Add a new course row dynamically
 */
function addCourse() {
    courseCounter++;
    const coursesContainer = document.getElementById('coursesContainer');
    
    const courseRow = document.createElement('div');
    courseRow.className = 'course-row';
    courseRow.setAttribute('data-course-id', courseCounter);
    
    courseRow.innerHTML = `
        <div class="course-fields">
            <div class="form-group">
                <label>Course Title</label>
                <input type="text" class="course-title" placeholder="e.g., Programming in Java" autocomplete="off">
                <small>Enter the official course name.</small>
            </div>
            <div class="form-group">
                <label>Credits</label>
                <input type="number" class="course-credits" placeholder="3" min="1" max="6" step="1" inputmode="numeric">
                <small>Credit hours for this course (usually 1–6).</small>
            </div>
            <div class="form-group">
                <label>Marks</label>
                <input type="number" class="course-marks" placeholder="85" min="0" max="100" step="0.5" inputmode="decimal">
                <small>Your marks out of 100 for this course.</small>
            </div>
            <div class="form-group grade-display">
                <label>Grade</label>
                <div class="grade-result">-</div>
            </div>
        </div>
        <button class="btn-remove" onclick="removeCourse(${courseCounter})" title="Remove Course" aria-label="Remove course ${courseCounter}">×</button>
    `;
    
    coursesContainer.appendChild(courseRow);
    
    // Add slide-in animation
    courseRow.style.animation = 'slideIn 0.5s ease';
    
    // Scroll to the new course on mobile
    if (window.innerWidth <= 768) {
        courseRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Remove a course row
 * @param {number} courseId - ID of the course to remove
 */
function removeCourse(courseId) {
    const courseRow = document.querySelector(`[data-course-id="${courseId}"]`);
    if (courseRow) {
        courseRow.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            courseRow.remove();
        }, 300);
    }
}

/**
 * Get all courses from the form
 * @returns {Array} Array of course objects
 */
function getAllCourses() {
    const courses = [];
    const courseRows = document.querySelectorAll('.course-row');
    
    courseRows.forEach(row => {
        const title = row.querySelector('.course-title').value.trim();
        const credits = parseFloat(row.querySelector('.course-credits').value);
        const marks = parseFloat(row.querySelector('.course-marks').value);
        
        if (title && !isNaN(credits) && !isNaN(marks)) {
            if (credits > 0 && marks >= 0 && marks <= 100) {
                courses.push({ title, credits, marks });
            }
        }
    });
    
    return courses;
}

/**
 * Calculate Semester GPA
 * @param {Array} courses - Array of course objects
 * @returns {number} Semester GPA
 */
function calculateSemesterGPA(courses) {
    if (courses.length === 0) return 0.0;
    
    let totalPoints = 0.0;
    let totalCredits = 0;
    
    courses.forEach(course => {
        const gradeInfo = marksToGrade(course.marks);
        totalPoints += gradeInfo.point * course.credits;
        totalCredits += course.credits;
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
}

/**
 * Calculate new Cumulative CGPA
 * Formula: New CGPA = (Prev CGPA × Prev Credits + Current GPA × Current Credits) / Total Credits
 * 
 * @param {number} prevCGPA - Previous CGPA
 * @param {number} prevCredits - Previous credits
 * @param {number} currentGPA - Current semester GPA
 * @param {number} currentCredits - Current semester credits
 * @returns {number} New cumulative CGPA
 */
function calculateCumulativeCGPA(prevCGPA, prevCredits, currentGPA, currentCredits) {
    const totalPoints = (prevCGPA * prevCredits) + (currentGPA * currentCredits);
    const totalCredits = prevCredits + currentCredits;
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
}

/**
 * Determine academic status based on CGPA
 * @param {number} cgpa - Current CGPA
 * @returns {object} Status information {text, class}
 */
function getAcademicStatus(cgpa) {
    if (cgpa >= 3.75) {
        return { text: "Dean's List 🏆", class: 'status-excellent' };
    } else if (cgpa >= 3.5) {
        return { text: "Excellent Standing ⭐", class: 'status-excellent' };
    } else if (cgpa >= 3.0) {
        return { text: "Good Standing ✓", class: 'status-good' };
    } else if (cgpa >= 2.5) {
        return { text: "Satisfactory", class: 'status-good' };
    } else if (cgpa >= 2.0) {
        return { text: "Warning ⚠️", class: 'status-warning' };
    } else {
        return { text: "Academic Probation ⚠️", class: 'status-probation' };
    }
}

/**
 * Main CGPA calculation function
 */
function calculateCGPA() {
    // Get student information
    const currentCGPA = parseFloat(document.getElementById('currentCGPA').value) || 0;
    const completedCredits = parseInt(document.getElementById('completedCredits').value) || 0;
    
    // Validate inputs
    if (currentCGPA < 0 || currentCGPA > 4) {
        alert('Current CGPA must be between 0.0 and 4.0');
        return;
    }
    
    if (completedCredits < 0) {
        alert('Completed credits cannot be negative');
        return;
    }
    
    // Get courses
    const courses = getAllCourses();
    
    if (courses.length === 0) {
        alert('Please add at least one course with valid information');
        return;
    }
    
    // Calculate semester GPA
    const semesterGPA = calculateSemesterGPA(courses);
    
    // Calculate total credits for current semester
    const currentCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    
    // Calculate new cumulative CGPA
    const newCGPA = calculateCumulativeCGPA(currentCGPA, completedCredits, semesterGPA, currentCredits);
    
    // Get academic status
    const status = getAcademicStatus(newCGPA);
    
    // Display results
    displayCGPAResults(semesterGPA, newCGPA, completedCredits + currentCredits, status);
}

/**
 * Display CGPA calculation results
 */
function displayCGPAResults(semesterGPA, newCGPA, totalCredits, status) {
    // Update result values
    document.getElementById('semesterGPA').textContent = semesterGPA.toFixed(2);
    document.getElementById('newCGPA').textContent = newCGPA.toFixed(2);
    document.getElementById('totalCredits').textContent = totalCredits;
    
    const statusElement = document.getElementById('academicStatus');
    statusElement.textContent = status.text;
    statusElement.className = `result-value status ${status.class}`;
    
    // Show results container
    const resultsContainer = document.getElementById('cgpaResults');
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Reset the CGPA calculator
 */
function resetCalculator() {
    // Reset student information
    document.getElementById('currentCGPA').value = '0';
    document.getElementById('completedCredits').value = '0';
    document.getElementById('totalSemesters').value = '0';
    
    // Clear all course rows except the first one
    const coursesContainer = document.getElementById('coursesContainer');
    const courseRows = coursesContainer.querySelectorAll('.course-row');
    
    courseRows.forEach((row, index) => {
        if (index === 0) {
            // Reset first row
            row.querySelector('.course-title').value = '';
            row.querySelector('.course-credits').value = '';
            row.querySelector('.course-marks').value = '';
            row.querySelector('.grade-result').textContent = '-';
            row.querySelector('.grade-result').style.color = '#f59e0b';
        } else {
            // Remove other rows
            row.remove();
        }
    });
    
    // Reset course counter
    courseCounter = 1;
    
    // Hide results
    document.getElementById('cgpaResults').style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add slide-out animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Console message
console.log('%c AIUB Academic Management Tool ', 'background: #00d4ff; color: #0a0e27; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('%c Built with ❤️ for AIUB Students ', 'background: #7c3aed; color: white; font-size: 12px; padding: 5px;');
