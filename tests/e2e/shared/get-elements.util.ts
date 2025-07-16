import { Locator, Page } from "@playwright/test";

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

export const getHeadingByContent = (page: Page, content: string) =>
  page.getByRole("heading", {
    name: content,
    exact: true,
  });

export const getLinkByContent = (page: Page, content: string) =>
  page.getByRole("link", {
    name: content,
    exact: true,
  });

export const getListBoxByName = (page: Page, name: string) =>
  page.getByRole("listbox", {
    name,
    exact: true,
  });

export const getOptionByName = (locator: Locator, name: string) =>
  locator.getByRole("option", {
    name,
    exact: true,
  });

export const getByLabel = (page: Page, label: string) =>
  page.getByLabel(label, {
    exact: true,
  });
