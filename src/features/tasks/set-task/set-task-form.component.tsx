"use client";

import {
  Button,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stepper,
  StepperStep,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useTranslations } from "next-intl";
import { useSetTaskForm } from "./use-set-task-form.hook";
import { UploadMediaDropzone } from "@/features/media/upload/upload-media-dropzone.component";
import { MediaUploadPreview } from "@/features/media/upload/media-upload-preview.component";

export type SetTaskFormProps = {
  projects: { id: number; title: string }[];
  employees: { id: string; fullName: string }[];
};

export function SetTaskForm({ projects, employees }: SetTaskFormProps) {
  const {
    form,
    submitHandler,
    step,
    media,
    addMedia,
    removeMedia,
    error,
    loading,
  } = useSetTaskForm();

  const t = useTranslations("setTask.form");

  return (
    <Paper
      component="form"
      onSubmit={submitHandler}
      withBorder
      shadow="md"
      p={30}
      radius="md"
    >
      <Stepper active={step.value}>
        <StepperStep
          label={t("steps.step1.label")}
          description={t("steps.step1.description")}
        >
          {error && (
            <Text size="sm" c="red" mb={10}>
              {error}
            </Text>
          )}
          <Select
            label={t("project.label")}
            placeholder={t("project.placeholder")}
            data={projects.map((project) => ({
              value: project.id.toString(),
              label: project.title,
            }))}
            required
            key={form.key("projectId")}
            {...form.getInputProps("projectId")}
            searchable
          />
          <TextInput
            label={t("title.label")}
            placeholder={t("title.placeholder")}
            required
            mt="md"
            key={form.key("title")}
            {...form.getInputProps("title")}
          />
          <Textarea
            autosize
            rows={4}
            minRows={4}
            maxRows={8}
            label={t("description.label")}
            placeholder={t("description.placeholder")}
            required
            mt="md"
            key={form.key("description")}
            {...form.getInputProps("description")}
          />
          <Text size="sm" mt="md" mb={5} fw={500}>
            {t("media.label")}
          </Text>
          <MediaUploadPreview media={media} removeMedia={removeMedia} />
          <UploadMediaDropzone addMedia={addMedia} />
        </StepperStep>
        <StepperStep
          label={t("steps.step2.label")}
          description={t("steps.step2.description")}
        >
          {error && (
            <Text size="sm" c="red" mb={10}>
              {error}
            </Text>
          )}
          <DatePickerInput
            type="range"
            allowSingleDateInRange
            label={t("dateRange.label")}
            placeholder={t("dateRange.placeholder")}
            mt="md"
            required
            key={form.key("dateRange")}
            {...form.getInputProps("dateRange")}
          />
        </StepperStep>
        <StepperStep
          label={t("steps.step3.label")}
          description={t("steps.step3.description")}
        >
          {error && (
            <Text size="sm" c="red" mb={10}>
              {error}
            </Text>
          )}
          <MultiSelect
            mt="md"
            label={t("employees.label")}
            placeholder={t("employees.placeholder")}
            data={employees.map((employee) => ({
              value: employee.id,
              label: employee.fullName,
            }))}
            limit={10}
            hidePickedOptions
            searchable
            required
            key={form.key("employees")}
            {...form.getInputProps("employees")}
          />
        </StepperStep>
      </Stepper>
      <Group justify="center" mt="xl">
        {step.value !== 0 && (
          <Button variant="default" onClick={step.prevStep}>
            {t("steps.previous")}
          </Button>
        )}
        {step.value !== 2 && (
          <Button onClick={step.nextStep}>{t("steps.next")}</Button>
        )}
        {step.value === 2 && (
          <Button type="submit" loading={loading}>
            {t("submit")}
          </Button>
        )}
      </Group>
    </Paper>
  );
}
