import { Avatar, Group, Paper, Text } from "@mantine/core";
import classes from "./employee-list.module.css";

export type EmployeeListProps = {
  employees: {
    id: string;
    fullName: string;
  }[];
};

export function EmployeeList({ employees }: EmployeeListProps) {
  return (
    <Group gap="lg">
      {employees.map((employee) => (
        <Paper
          key={employee.id}
          p="sm"
          radius="md"
          className={classes.employee}
        >
          <Group gap="sm">
            <Avatar
              size={30}
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
              radius={30}
            />
            <Text fz="sm" fw={500}>
              {employee.fullName}
            </Text>
          </Group>
        </Paper>
      ))}
    </Group>
  );
}
