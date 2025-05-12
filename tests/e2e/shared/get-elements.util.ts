import { Page } from "@playwright/test";

export const getTextboxByName = (page: Page, name: string) =>
  page.getByRole("textbox", {
    name,
    exact: true,
  });

export const getListboxByName = (page: Page, name: string) =>
  page.getByRole("listbox", {
    name,
    exact: true,
  });

export const getButtonByName = (page: Page, name: string) =>
  page.getByRole("button", {
    name,
    exact: true,
  });

export const getTextByContent = (page: Page, content: string) =>
  page.getByText(content, { exact: true }).first();
