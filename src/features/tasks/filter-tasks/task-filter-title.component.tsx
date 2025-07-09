"use client";

import { TextInput } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

const DEBOUNCE_TIMEOUT = 500;

export function TaskFilterTitle() {
  const router = useRouter();
  const t = useTranslations("taskList.filter.title");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchParams = useSearchParams();

  const currentTitle = searchParams.get("title") ?? "";

  const [value, setValue] = useState(currentTitle);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    setValue(event.target.value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (event.target.value.trim()) {
        params.set("title", event.target.value.trim());
      } else {
        params.delete("title");
      }
      router.replace(`?${params.toString()}`, {
        scroll: false,
      });
    }, DEBOUNCE_TIMEOUT);
  };

  return (
    <TextInput
      type="text"
      label={t("label")}
      value={value}
      placeholder={t("placeholder")}
      onChange={handleTitleChange}
    />
  );
}
