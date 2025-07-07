import {
  AspectRatio,
  CloseButton,
  Image,
  SimpleGrid,
  Stack,
} from "@mantine/core";

export type MediaUploadPreviewProps = {
  media: {
    type: "image" | "video";
    url: string;
  }[];
  removeMedia: (index: number) => void;
};

export function MediaUploadPreview({
  media,
  removeMedia,
}: MediaUploadPreviewProps) {
  return (
    <SimpleGrid
      cols={{ base: 2, sm: 4 }}
      mt={media.length > 0 ? "xl" : 0}
      mb={media.length > 0 ? "sm" : 0}
    >
      {media.map((item, index) => (
        <Stack w="100%" h="100%" key={index} pos="relative">
          <AspectRatio ratio={1}>
            {item.type === "image" ? (
              <Image
                src={item.url}
                alt={`Media ${index + 1}`}
                radius="md"
                miw="100%"
                mih="100%"
                maw="100%"
                mah="100%"
                fit="cover"
                display="block"
                mx="auto"
              />
            ) : (
              <video
                src={item.url}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "0.5rem",
                }}
              />
            )}
          </AspectRatio>
          <CloseButton
            pos="absolute"
            top={5}
            right={5}
            onClick={() => removeMedia(index)}
          />
        </Stack>
      ))}
    </SimpleGrid>
  );
}
