export interface TestRailOptions {
  domain: string;
  username: string;
  password: string;
  projectId: number;
  suiteId: number;
  createTestRun: boolean;
  runId: number;
  assignedToId?: number;
}

export enum Status {
  Passed = 1,
  Blocked = 2,
  Untested = 3,
  Retest = 4,
  Failed = 5,
}

export interface TestRailResult {
  case_id: number;
  status_id: Status;
  comment?: String;
}

export interface TestRunResult {
  id: number;
  suite_id: number;
  name: string;
  description: string;
  milestone_id: number | null;
  assignedto_id: number | null;
  include_all: boolean;
  is_completed: boolean;
  completed_on: number | null;
  config: number | null;
  config_ids: number[];
  passed_count: number;
  blocked_count: number;
  untested_count: number;
  retest_count: number;
  failed_count: number;
  custom_status1_count: number;
  custom_status2_count: number;
  custom_status3_count: number;
  custom_status4_count: number;
  custom_status5_count: number;
  custom_status6_count: number;
  custom_status7_count: number;
  project_id: number;
  plan_id: number | null;
  created_on: number;
  updated_on: number;
  refs: number | null;
  created_by: number;
  url: string;
}
