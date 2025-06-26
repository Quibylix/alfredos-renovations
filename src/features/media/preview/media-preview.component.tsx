"use client";

import { useDisclosure } from "@mantine/hooks";
import { Modal, SimpleGrid, Image, AspectRatio, Box } from "@mantine/core";
import { useState } from "react";

type MediaItem = {
  id: number;
  type: "image" | "video";
  url: string;
};

type MediaPreviewGridProps = {
  media: MediaItem[];
};

export function MediaPreview({ media }: MediaPreviewGridProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const handleOpen = (item: MediaItem) => {
    setActiveMedia(item);
    open();
  };

  return (
    <>
      <SimpleGrid
        cols={media.length === 1 ? 1 : media.length === 2 ? 2 : 2}
        spacing="xs"
        maw={400}
      >
        {media.map((item) => (
          <AspectRatio
            key={item.id}
            ratio={1}
            onClick={() => handleOpen(item)}
            style={{
              cursor: "pointer",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {item.type === "image" ? (
              <Image
                miw="100%"
                mih="100%"
                maw="100%"
                mah="100%"
                src={item.url}
                alt={`media-${item.id}`}
                fit="cover"
              />
            ) : (
              <video
                src={item.url}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                muted
                playsInline
              />
            )}
          </AspectRatio>
        ))}
      </SimpleGrid>
      {activeMedia && (
        <Modal
          opened={opened}
          onClose={close}
          size="lg"
          centered
          withCloseButton={false}
          padding={0}
        >
          <Box style={{ position: "relative" }}>
            {activeMedia?.type === "image" ? (
              <Image src={activeMedia.url} alt="" fit="contain" />
            ) : (
              <video
                src={activeMedia.url}
                style={{ width: "100%", height: "100%" }}
                controls
                autoPlay
              />
            )}
          </Box>
        </Modal>
      )}
    </>
  );
}
