/**
 * Academic calculation utilities, grading scales, GPA/CGPA formulas, and attendance math.
 */

// ─── GRADING SCALES ────────────────────────────────────────────────
export interface GradePointMapping {
  grade: string;
  points: number;
  minPercentage: number;
  description: string;
}

export type GradingScaleType = "4.0" | "10.0" | "5.0";

export const GRADING_SCALES: Record<GradingScaleType, GradePointMapping[]> = {
  "4.0": [
    { grade: "A+", points: 4.0, minPercentage: 97, description: "Excellent / High Distinction" },
    { grade: "A", points: 4.0, minPercentage: 93, description: "Superior" },
    { grade: "A-", points: 3.7, minPercentage: 90, description: "Very Good" },
    { grade: "B+", points: 3.3, minPercentage: 87, description: "Good" },
    { grade: "B", points: 3.0, minPercentage: 83, description: "Above Average" },
    { grade: "B-", points: 2.7, minPercentage: 80, description: "Average" },
    { grade: "C+", points: 2.3, minPercentage: 77, description: "Satisfactory" },
    { grade: "C", points: 2.0, minPercentage: 73, description: "Pass" },
    { grade: "C-", points: 1.7, minPercentage: 70, description: "Marginal Pass" },
    { grade: "D+", points: 1.3, minPercentage: 67, description: "Minimum Pass" },
    { grade: "D", points: 1.0, minPercentage: 65, description: "Barely Passing" },
    { grade: "F", points: 0.0, minPercentage: 0, description: "Fail" },
  ],
  "10.0": [
    { grade: "O (Outstanding)", points: 10.0, minPercentage: 90, description: "Outstanding Performance" },
    { grade: "A+ (Excellent)", points: 9.0, minPercentage: 80, description: "Excellent" },
    { grade: "A (Very Good)", points: 8.0, minPercentage: 70, description: "Very Good" },
    { grade: "B+ (Good)", points: 7.0, minPercentage: 60, description: "Good" },
    { grade: "B (Above Average)", points: 6.0, minPercentage: 50, description: "Above Average" },
    { grade: "C (Average)", points: 5.0, minPercentage: 45, description: "Average Pass" },
    { grade: "P (Pass)", points: 4.0, minPercentage: 40, description: "Pass" },
    { grade: "F (Fail)", points: 0.0, minPercentage: 0, description: "Fail / Reappear" },
  ],
  "5.0": [
    { grade: "A", points: 5.0, minPercentage: 70, description: "First Class" },
    { grade: "B", points: 4.0, minPercentage: 60, description: "Second Class Upper" },
    { grade: "C", points: 3.0, minPercentage: 50, description: "Second Class Lower" },
    { grade: "D", points: 2.0, minPercentage: 45, description: "Third Class" },
    { grade: "E", points: 1.0, minPercentage: 40, description: "Pass" },
    { grade: "F", points: 0.0, minPercentage: 0, description: "Fail" },
  ],
};

// ─── GPA / CGPA HELPERS ───────────────────────────────────────────
export interface CourseEntry {
  id: string;
  name: string;
  credits: number;
  gradePoints: number;
  gradeLabel?: string;
}

export function calculateGPA(courses: CourseEntry[]): {
  gpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  formulaBreakdown: string;
} {
  const validCourses = courses.filter((c) => c.credits > 0 && !isNaN(c.credits) && !isNaN(c.gradePoints));
  if (validCourses.length === 0) {
    return {
      gpa: 0,
      totalCredits: 0,
      totalQualityPoints: 0,
      formulaBreakdown: "No valid course credits entered.",
    };
  }

  const totalCredits = validCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalQualityPoints = validCourses.reduce((sum, c) => sum + c.credits * c.gradePoints, 0);
  const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

  const formulaBreakdown = `GPA = Σ(Credits × Grade Points) / Total Credits\n= (${validCourses
    .map((c) => `${c.credits} × ${c.gradePoints}`)
    .join(" + ")}) / ${totalCredits}\n= ${totalQualityPoints.toFixed(2)} / ${totalCredits}\n= ${gpa.toFixed(3)}`;

  return {
    gpa: Number(gpa.toFixed(3)),
    totalCredits,
    totalQualityPoints: Number(totalQualityPoints.toFixed(2)),
    formulaBreakdown,
  };
}

export interface SemesterEntry {
  id: string;
  name: string;
  gpa: number;
  credits: number;
}

export function calculateCGPA(semesters: SemesterEntry[]): {
  cgpa: number;
  totalCredits: number;
  totalWeightedGpa: number;
  formulaBreakdown: string;
} {
  const valid = semesters.filter((s) => s.credits > 0 && !isNaN(s.credits) && !isNaN(s.gpa));
  if (valid.length === 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      totalWeightedGpa: 0,
      formulaBreakdown: "No valid semesters entered.",
    };
  }

  const totalCredits = valid.reduce((sum, s) => sum + s.credits, 0);
  const totalWeightedGpa = valid.reduce((sum, s) => sum + s.gpa * s.credits, 0);
  const cgpa = totalCredits > 0 ? totalWeightedGpa / totalCredits : 0;

  const formulaBreakdown = `CGPA = Σ(Semester GPA × Semester Credits) / Total Credits\n= (${valid
    .map((s) => `${s.gpa} × ${s.credits}`)
    .join(" + ")}) / ${totalCredits}\n= ${totalWeightedGpa.toFixed(2)} / ${totalCredits}\n= ${cgpa.toFixed(3)}`;

  return {
    cgpa: Number(cgpa.toFixed(3)),
    totalCredits,
    totalWeightedGpa: Number(totalWeightedGpa.toFixed(2)),
    formulaBreakdown,
  };
}

// ─── CGPA TO PERCENTAGE FORMULA PRESETS ───────────────────────────
export interface CgpaFormulaPreset {
  id: string;
  name: string;
  institution: string;
  baseScale: number;
  formulaDescription: string;
  calculate: (cgpa: number) => number;
}

export const CGPA_FORMULA_PRESETS: CgpaFormulaPreset[] = [
  {
    id: "cbse-9.5",
    name: "CBSE / AICTE Standard (9.5×)",
    institution: "CBSE, AICTE, Most Indian Universities",
    baseScale: 10.0,
    formulaDescription: "Percentage = CGPA × 9.5",
    calculate: (cgpa: number) => Math.min(100, Math.max(0, cgpa * 9.5)),
  },
  {
    id: "standard-10",
    name: "Direct 10× Scaling",
    institution: "IITs, NITs, Standard 10-point Scale",
    baseScale: 10.0,
    formulaDescription: "Percentage = CGPA × 10.0",
    calculate: (cgpa: number) => Math.min(100, Math.max(0, cgpa * 10.0)),
  },
  {
    id: "mumbai-univ",
    name: "Mumbai University (7.1× + 11)",
    institution: "Mumbai University Engineering / Sciences",
    baseScale: 10.0,
    formulaDescription: "Percentage = 7.1 × CGPA + 11 (if CGPA ≥ 7)",
    calculate: (cgpa: number) => {
      if (cgpa >= 7) return Math.min(100, Math.max(0, 7.1 * cgpa + 11));
      return Math.min(100, Math.max(0, 7.25 * cgpa + 11));
    },
  },
  {
    id: "vtu",
    name: "VTU Karnataka ((CGPA - 0.75) × 10)",
    institution: "Visvesvaraya Technological University",
    baseScale: 10.0,
    formulaDescription: "Percentage = (CGPA - 0.75) × 10",
    calculate: (cgpa: number) => Math.min(100, Math.max(0, (cgpa - 0.75) * 10)),
  },
  {
    id: "us-4-scale",
    name: "US 4.0 Standard ((CGPA / 4) × 100)",
    institution: "US Colleges & Universities",
    baseScale: 4.0,
    formulaDescription: "Percentage = (CGPA / 4.0) × 100",
    calculate: (cgpa: number) => Math.min(100, Math.max(0, (cgpa / 4.0) * 100)),
  },
  {
    id: "us-widen-scale",
    name: "US Scale 20× + 20",
    institution: "Common US Admissions Linear Scale",
    baseScale: 4.0,
    formulaDescription: "Percentage = (CGPA × 20) + 20",
    calculate: (cgpa: number) => Math.min(100, Math.max(0, cgpa * 20 + 20)),
  },
];

// ─── ATTENDANCE CALCULATIONS ──────────────────────────────────────
export interface AttendanceResult {
  currentPercentage: number;
  isEligible: boolean;
  statusMessage: string;
  safeBunkCount: number;
  catchUpRequired: number;
  formula: string;
}

export function calculateAttendance(
  totalClasses: number,
  attendedClasses: number,
  requiredPercentage: number = 75
): AttendanceResult {
  if (totalClasses <= 0 || isNaN(totalClasses)) {
    return {
      currentPercentage: 0,
      isEligible: false,
      statusMessage: "Please enter total classes held.",
      safeBunkCount: 0,
      catchUpRequired: 0,
      formula: "Attendance = (Attended / Total) × 100",
    };
  }

  const attended = Math.min(totalClasses, Math.max(0, attendedClasses));
  const currentPct = (attended / totalClasses) * 100;
  const isEligible = currentPct >= requiredPercentage;

  let safeBunkCount = 0;
  let catchUpRequired = 0;

  if (isEligible) {
    // How many classes can be missed without dropping below requiredPct:
    // (attended) / (total + x) >= req/100
    // total + x <= attended / (req/100)
    // x <= (attended * 100 / req) - total
    safeBunkCount = Math.max(0, Math.floor((attended * 100) / requiredPercentage - totalClasses));
  } else {
    // How many consecutive classes must be attended to reach requiredPct:
    // (attended + y) / (total + y) >= req/100
    // 100 * attended + 100 * y >= req * total + req * y
    // y * (100 - req) >= req * total - 100 * attended
    // y = ceil( (req * total - 100 * attended) / (100 - req) )
    const reqFactor = requiredPercentage / 100;
    if (requiredPercentage < 100) {
      catchUpRequired = Math.max(
        0,
        Math.ceil((requiredPercentage * totalClasses - 100 * attended) / (100 - requiredPercentage))
      );
    } else {
      catchUpRequired = totalClasses - attended;
    }
  }

  const formula = `Current Attendance = (${attended} / ${totalClasses}) × 100 = ${currentPct.toFixed(2)}%`;

  const statusMessage = isEligible
    ? `You have satisfied the ${requiredPercentage}% attendance requirement! You can safely miss ${safeBunkCount} more upcoming classes without falling below ${requiredPercentage}%.`
    : `Your attendance is below ${requiredPercentage}%. You must attend the next ${catchUpRequired} classes consecutively without missing any to restore eligibility.`;

  return {
    currentPercentage: Number(currentPct.toFixed(2)),
    isEligible,
    statusMessage,
    safeBunkCount,
    catchUpRequired,
    formula,
  };
}
