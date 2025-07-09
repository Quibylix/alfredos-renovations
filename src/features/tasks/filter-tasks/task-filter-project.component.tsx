"use client";

import { Select } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function TaskFilterProject({
  projects,
}: {
  projects: { id: number; title: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("taskList.filter.project");

  const searchParams = useSearchParams();

  const initialProject = searchParams.get("project") ?? null;

  const [project, setProject] = useState<string | null>(initialProject);

  function handleChange(value: string | null) {
    setProject(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value && value.length > 0) {
      params.set("project", value);
    } else {
      params.delete("project");
    }

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <Select
      label={t("label")}
      placeholder={t("placeholder")}
      value={project}
      onChange={handleChange}
      data={projects.map((project) => ({
        value: project.id.toString(),
        label: project.title,
      }))}
      limit={10}
      searchable
    />
  );
}
