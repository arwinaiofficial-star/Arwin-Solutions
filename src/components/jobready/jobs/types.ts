export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  salary?: string;
  jobType?: string;
  postedAt?: string;
  tags?: string[];
  relevanceScore: number;
}

export interface JobSearchState {
  query: string;
  location: string;
  results: JobResult[];
  loading: boolean;
  searched: boolean;
  sortBy: "relevance" | "date";
}
