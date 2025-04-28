"use client";

import { Skeleton } from "@mantine/core";
import { useEffect, useState } from "react";

export function LocalizedDate({ date }: { date: Date }) {
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    const formatter = new Intl.DateTimeFormat("en-US", options);
    setDateString(formatter.format(date));
  }, [date]);

  return (
    <span>
      {dateString ? (
        <span>{dateString}</span>
      ) : (
        <Skeleton
          component="span"
          display="block"
          height={10}
          width={100}
          radius="xl"
        />
      )}
    </span>
  );
}
