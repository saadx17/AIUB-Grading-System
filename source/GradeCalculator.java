package com.aiub.grading;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * AIUB Grade Calculator - Backend Logic
 * Handles grade conversions, CGPA calculations, and final exam planning
 */
public class GradeCalculator {
    
    // AIUB Grading Scale using TreeMap for efficient range queries
    private static final TreeMap<Integer, GradeInfo> GRADE_SCALE = new TreeMap<>();
    
    static {
        GRADE_SCALE.put(90, new GradeInfo("A+", 4.0));
        GRADE_SCALE.put(85, new GradeInfo("A", 3.75));
        GRADE_SCALE.put(80, new GradeInfo("B+", 3.5));
        GRADE_SCALE.put(75, new GradeInfo("B", 3.25));
        GRADE_SCALE.put(70, new GradeInfo("C+", 3.0));
        GRADE_SCALE.put(65, new GradeInfo("C", 2.75));
        GRADE_SCALE.put(60, new GradeInfo("D+", 2.5));
        GRADE_SCALE.put(50, new GradeInfo("D", 2.25));
        GRADE_SCALE.put(0, new GradeInfo("F", 0.0));
    }
    
    /**
     * Convert marks to grade information
     * @param marks Student's marks (0-100)
     * @return GradeInfo object containing letter grade and grade point
     */
    public static GradeInfo marksToGrade(double marks) {
        if (marks < 0 || marks > 100) {
            throw new IllegalArgumentException("Marks must be between 0 and 100");
        }
        
        Map.Entry<Integer, GradeInfo> entry = GRADE_SCALE.floorEntry((int) marks);
        return entry != null ? entry.getValue() : new GradeInfo("F", 0.0);
    }
    
    /**
     * Calculate semester GPA
     * @param courses Array of Course objects
     * @return Semester GPA
     */
    public static double calculateSemesterGPA(Course[] courses) {
        if (courses == null || courses.length == 0) {
            return 0.0;
        }
        
        double totalPoints = 0.0;
        int totalCredits = 0;
        
        for (Course course : courses) {
            GradeInfo grade = marksToGrade(course.getMarks());
            totalPoints += grade.getGradePoint() * course.getCredits();
            totalCredits += course.getCredits();
        }
        
        return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
    }
    
    /**
     * Calculate new cumulative CGPA
     * Formula: New CGPA = (Prev CGPA × Prev Credits + Current GPA × Current Credits) / Total Credits
     * 
     * @param previousCGPA Previous cumulative GPA
     * @param previousCredits Previously completed credits
     * @param currentGPA Current semester GPA
     * @param currentCredits Current semester credits
     * @return New cumulative CGPA
     */
    public static double calculateCumulativeCGPA(double previousCGPA, int previousCredits, 
                                                  double currentGPA, int currentCredits) {
        if (previousCredits < 0 || currentCredits < 0) {
            throw new IllegalArgumentException("Credits cannot be negative");
        }
        
        if (previousCGPA < 0.0 || previousCGPA > 4.0) {
            throw new IllegalArgumentException("CGPA must be between 0.0 and 4.0");
        }
        
        double totalPoints = (previousCGPA * previousCredits) + (currentGPA * currentCredits);
        int totalCredits = previousCredits + currentCredits;
        
        return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
    }
    

    /**
     * Determine academic status based on CGPA
     * @param cgpa Current CGPA
     * @return Academic status
     */
    public static String getAcademicStatus(double cgpa) {
        if (cgpa < 0.0 || cgpa > 4.0) {
            return "Invalid CGPA";
        }
        
        if (cgpa >= 3.75) {
            return "Dean's List";
        } else if (cgpa >= 3.5) {
            return "Excellent Standing";
        } else if (cgpa >= 3.0) {
            return "Good Standing";
        } else if (cgpa >= 2.5) {
            return "Satisfactory";
        } else if (cgpa >= 2.0) {
            return "Warning";
        } else {
            return "Academic Probation";
        }
    }
    
    // Inner Classes
    
    /**
     * Grade Information holder
     */
    public static class GradeInfo {
        private final String letterGrade;
        private final double gradePoint;
        
        public GradeInfo(String letterGrade, double gradePoint) {
            this.letterGrade = letterGrade;
            this.gradePoint = gradePoint;
        }
        
        public String getLetterGrade() { return letterGrade; }
        public double getGradePoint() { return gradePoint; }
        
        @Override
        public String toString() {
            return letterGrade + " (" + gradePoint + ")";
        }
    }
    
    /**
     * Course Information
     */
    public static class Course {
        private String title;
        private int credits;
        private double marks;
        
        public Course(String title, int credits, double marks) {
            this.title = title;
            this.credits = credits;
            this.marks = marks;
        }
        
        public String getTitle() { return title; }
        public int getCredits() { return credits; }
        public double getMarks() { return marks; }
    }
    

    // Main method for testing
    public static void main(String[] args) {
        System.out.println("=== AIUB Grade Calculator Test ===\n");
        
        // Test 1: Marks to Grade Conversion
        System.out.println("Test 1: Marks to Grade Conversion");
        double[] testMarks = {95, 87, 82, 77, 72, 67, 62, 55, 45};
        for (double marks : testMarks) {
            GradeInfo grade = marksToGrade(marks);
            System.out.printf("Marks: %.0f → Grade: %s\n", marks, grade);
        }
        
        // Test 2: Semester GPA Calculation
        System.out.println("\nTest 2: Semester GPA Calculation");
        Course[] courses = {
            new Course("Programming in Java", 3, 88),
            new Course("Data Structures", 3, 92),
            new Course("Database Management", 3, 85),
            new Course("Web Technologies", 3, 90)
        };
        double semesterGPA = calculateSemesterGPA(courses);
        System.out.printf("Semester GPA: %.2f\n", semesterGPA);
        
        // Test 3: Cumulative CGPA Calculation
        System.out.println("\nTest 3: Cumulative CGPA Calculation");
        double previousCGPA = 3.45;
        int previousCredits = 36;
        int currentCredits = 12;
        double newCGPA = calculateCumulativeCGPA(previousCGPA, previousCredits, semesterGPA, currentCredits);
        System.out.printf("Previous CGPA: %.2f (%d credits)\n", previousCGPA, previousCredits);
        System.out.printf("Current GPA: %.2f (%d credits)\n", semesterGPA, currentCredits);
        System.out.printf("New Cumulative CGPA: %.2f\n", newCGPA);
        System.out.printf("Academic Status: %s\n", getAcademicStatus(newCGPA));
    }
}
