import type {
  ProjectDetailInterface,
  ProjectUpdateInterface,
  ProjectComment,
  CommentPaginationResponse,
} from '@/types/ShowcaseType';

export interface ProjectCache {
  project: ProjectDetailInterface;
  lastFetched: number;
  updates: ProjectUpdateInterface[];
}

export interface CommentsCache {
  comments: ProjectComment[];
  lastFetched: number;
  pagination: CommentPaginationResponse;
}
