import { User } from "@/features/db/user/user.model";
import { MediaPreview } from "@/features/media/preview/media-preview.component";
import { MessageData } from "@/features/tasks/get-tasks/get-task-messages.action";
import { LocalizedDate } from "@/features/tasks/get-tasks/localized-date.component";
import { Avatar, Container, Group, rem, Stack, Text } from "@mantine/core";

export type MessageListProps = {
  messages: MessageData[];
};

export async function MessageList({ messages }: MessageListProps) {
  const currentUserId = await User.getCurrentUserId();

  return (
    <Stack gap="md" w="100%" miw="100%">
      {messages.map((message) => {
        const isSender = message.profile.id === currentUserId;

        return (
          <Container key={message.id} w="100%" px="xs">
            <Container
              w="80%"
              ml={isSender ? "auto" : 0}
              mr={isSender ? 0 : "auto"}
              p={0}
            >
              <Group
                justify={isSender ? "flex-end" : "flex-start"}
                gap="sm"
                mb="xs"
              >
                {!isSender && (
                  <Avatar
                    src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
                    radius="xl"
                  />
                )}
                <div style={{ textAlign: isSender ? "right" : "left" }}>
                  <Text size="sm" fw={500}>
                    {message.profile.fullName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    <LocalizedDate date={new Date(message.sentDate)} />
                  </Text>
                </div>
              </Group>
              <Container
                w={isSender ? `calc(100% - ${rem(54)})` : "100%"}
                p={"0 0 0 " + (isSender ? 0 : rem(54)).toString()}
                ml={isSender ? "auto" : 0}
                mr={isSender ? 0 : "auto"}
              >
                <Text
                  size="sm"
                  mb="xs"
                  style={{
                    whiteSpace: "pre-line",
                    textAlign: isSender ? "right" : "left",
                  }}
                >
                  {message.content}
                </Text>
                <Group
                  ml={isSender ? "auto" : 0}
                  mr={isSender ? 0 : "auto"}
                  p={0}
                  justify={isSender ? "flex-end" : "flex-start"}
                >
                  {message.media.length > 0 && (
                    <MediaPreview media={message.media} />
                  )}
                </Group>
              </Container>
            </Container>
          </Container>
        );
      })}
    </Stack>
  );
}
