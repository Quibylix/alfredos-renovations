import { GetProjectInfo } from "./queries/get-project-info.query";

export class Project {
  static getProjectInfo(projectId: number) {
    return new GetProjectInfo(projectId).execute();
  }
}
