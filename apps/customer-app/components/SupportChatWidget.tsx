import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge } from "@rapex/ui-native";
import { useAppTheme } from "../hooks/useAppTheme";
import { FaqAnswerProvider, suggestedFaqQuestions } from "../services/supportChat";

type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
};

const provider = new FaqAnswerProvider();

let nextId = 0;
function makeId(): string {
  nextId += 1;
  return `msg-${nextId}`;
}

/**
 * Corner support-chat bubble. Answers come from the local FAQ provider only
 * -- no external API call, per founder instruction to hold off on wiring a
 * real ChatGPT key until they provide one (see services/supportChat.ts).
 */
export function SupportChatWidget() {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: makeId(), from: "bot", text: "Hi! I'm the RAPEX support bot. Ask me a question or tap a suggestion below." },
  ]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: makeId(), from: "user", text: trimmed }]);
    setDraft("");
    const answer = await provider.ask(trimmed);
    setMessages((prev) => [...prev, { id: makeId(), from: "bot", text: answer }]);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.bubble,
          {
            backgroundColor: theme.colors.brandPrimary,
            borderRadius: theme.radius.full,
            bottom: theme.spacing.xl + 70,
            right: theme.spacing.lg,
          },
        ]}
      >
        <Text style={styles.bubbleIcon}>💬</Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.sheet, { backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl }]}
          >
            <View style={[styles.header, { padding: theme.spacing.lg, borderBottomColor: theme.colors.border }]}>
              <View style={{ gap: 2 }}>
                <Text style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.textPrimary }}>
                  RAPEX Support
                </Text>
                <Badge label="FAQ bot — not a live agent yet" tone="warning" />
              </View>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Text style={{ fontSize: theme.typography.fontSize.xl, color: theme.colors.textSecondary }}>×</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.bubbleRow,
                    message.from === "user" ? styles.bubbleRowUser : styles.bubbleRowBot,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      {
                        borderRadius: theme.radius.md,
                        backgroundColor: message.from === "user" ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: message.from === "user" ? theme.colors.textInverse : theme.colors.textPrimary,
                        fontSize: theme.typography.fontSize.sm,
                      }}
                    >
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
                <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, fontWeight: "600" }}>
                  Suggested questions
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
                  {suggestedFaqQuestions().map((question) => (
                    <Pressable
                      key={question}
                      onPress={() => ask(question)}
                      style={[styles.chip, { borderColor: theme.colors.border, borderRadius: theme.radius.full }]}
                    >
                      <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textPrimary }}>{question}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View
              style={[
                styles.inputRow,
                { padding: theme.spacing.md, borderTopColor: theme.colors.border, gap: theme.spacing.sm },
              ]}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Type a question…"
                placeholderTextColor={theme.colors.textSecondary}
                onSubmitEditing={() => ask(draft)}
                style={[
                  styles.input,
                  {
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.full,
                    color: theme.colors.textPrimary,
                    paddingHorizontal: theme.spacing.md,
                  },
                ]}
              />
              <Pressable
                onPress={() => ask(draft)}
                style={[styles.sendButton, { backgroundColor: theme.colors.brandPrimary, borderRadius: theme.radius.full }]}
              >
                <Text style={{ color: theme.colors.textInverse, fontWeight: "700" }}>Send</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
    zIndex: 20,
  },
  bubbleIcon: {
    fontSize: 24,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowBot: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
  },
  sendButton: {
    paddingHorizontal: 18,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
