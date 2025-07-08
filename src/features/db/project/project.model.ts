import { GetProjectInfo } from "./queries/get-project-info.query";
import { GetRelatedProjects } from "./queries/get-related-projects.query";

export class Project {
  static getRelatedProjects() {
    return new GetRelatedProjects().execute();
  }

  static getProjectInfo(projectId: number) {
    return new GetProjectInfo(projectId).execute();
  }
}
