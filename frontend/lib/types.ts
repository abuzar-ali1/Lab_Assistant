export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  is_verified?: boolean;
}

export interface RegisterPayload {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export type ReportStatus = "pending" | "processing" | "completed" | "failed";

export interface ReportSummary {
  id: number;
  original_filename: string;
  status: ReportStatus;
  created_at: string;
  abnormal_count: number;
  total_tests: number;
}

export interface TestResult {
  id: string;
  test_name: string;
  value: string;
  unit: string;
  reference_range: string;
  is_abnormal: boolean;
  explanation_urdu: string;
  explanation_english: string;
  doctor_questions: string[];
  created_at?: string;
}

export interface ReportDetail {
  id: number;
  original_filename: string;
  status: ReportStatus;
  file_url: string | null;
  created_at: string;
  completed_at: string | null;
  processing_time_seconds: number | null;
  test_results: TestResult[];
  error_message?: string | null;
}

export interface PaginatedReports {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: ReportSummary[];
}
