import { EditProject } from "./queries/edit-project.query";
import { GetProjectInfo } from "./queries/get-project-info.query";
import { GetRelatedProjects } from "./queries/get-related-projects.query";

export class Project {
  static getRelatedProjects() {
    return new GetRelatedProjects().execute();
  }

  static getProjectInfo(projectId: number) {
    return new GetProjectInfo(projectId).execute();
  }

  static editProject(projectId: number, newData: { title: string }) {
    return new EditProject(projectId, newData).execute();
  }
}
