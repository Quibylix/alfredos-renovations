import { CloseButton, Image, Stack } from "@mantine/core";

export type ImagePreviewProps = {
  imageURL: string;
  alt: string;
  close: () => void;
};

export function ImagePreview({ imageURL, alt, close }: ImagePreviewProps) {
  return (
    <Stack
      w="max-content"
      h="max-content"
      mx="auto"
      mb="md"
      dir="column"
      pos="relative"
    >
      <CloseButton
        bg="dark.1"
        c="white"
        radius="50%"
        variant="transparent"
        onClick={close}
        size="md"
        pos="absolute"
        right={-15}
        top={-15}
      />
      <Image
        src={imageURL}
        alt={alt}
        radius="md"
        mb="md"
        mah={300}
        w="auto"
        display="block"
        mx="auto"
        onError={close}
      />
    </Stack>
  );
}
