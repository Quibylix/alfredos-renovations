import { Grid, GridCol } from "@mantine/core";
import { ProjectPreview } from "./project-preview.component";

type ProjectListProps = {
  projects: { id: number; title: string }[];
};

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <Grid
      type="container"
      breakpoints={{
        xs: "100px",
        sm: "200px",
        md: "500px",
        lg: "800px",
        xl: "1200px",
      }}
    >
      {projects.map((projectItem) => (
        <GridCol key={projectItem.id} span={{ base: 12, md: 6, lg: 4 }}>
          <ProjectPreview project={projectItem} />
        </GridCol>
      ))}
    </Grid>
  );
}
