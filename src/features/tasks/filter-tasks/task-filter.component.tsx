import { Project } from "@/features/db/project/project.model";
import { User } from "@/features/db/user/user.model";
import { TaskFilterTitle } from "./task-filter-title.component";
import { TaskFilterDate } from "./task-filter-date.component";
import { TaskFilterStatus } from "./task-filter-status.component";
import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Group,
  Stack,
} from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { TaskFilterEmployees } from "./task-filter-employees.component";
import { USER_STATUS_MESSAGES } from "@/features/db/user/user.constant";
import { TaskFilterProject } from "./task-filter-project.component";

export async function TaskFilter() {
  const employeesData = await User.getRelatedEmployees().execute();
  const projectsData = await Project.getRelatedProjects();

  const t = await getTranslations("taskList.filter");

  const displayEmployees =
    employeesData.status === USER_STATUS_MESSAGES.OK &&
    employeesData.employees.length > 0;

  const displayProjects =
    projectsData.status === USER_STATUS_MESSAGES.OK &&
    projectsData.projects.length > 0;

  return (
    <Accordion variant="filled" mb="md">
      <AccordionItem value="task-filter">
        <AccordionControl component="h3">{t("label")}</AccordionControl>
        <AccordionPanel p="md">
          <Stack>
            <TaskFilterTitle />
            <Group>
              <TaskFilterDate type="start" />
              <TaskFilterDate type="end" />
            </Group>
            <TaskFilterStatus />
            {displayEmployees && (
              <TaskFilterEmployees employees={employeesData.employees} />
            )}
            {displayProjects && (
              <TaskFilterProject projects={projectsData.projects} />
            )}
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
