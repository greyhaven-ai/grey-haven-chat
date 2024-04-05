import { Loader2 } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";

import ChatActions from "./chat-actions";
import ChatMessage from "./chat-message";
import { ChatHandler } from "./chat.interface";

export default function ChatMessages(
  props: Pick<ChatHandler, "messages" | "isLoading" | "reload" | "stop">,
) {
  const scrollableChatContainerRef = useRef<HTMLDivElement>(null);
  const messageLength = props.messages.length;
  const lastMessage = props.messages[messageLength - 1];

  const scrollToBottom = useCallback(() => {
    if (scrollableChatContainerRef.current) {
      scrollableChatContainerRef.current.scrollTop =
        scrollableChatContainerRef.current.scrollHeight;
    }
  }, []);

  const isLastMessageFromAssistant =
    messageLength > 0 && lastMessage?.role !== "user";
  const showReload =
    props.reload && !props.isLoading && isLastMessageFromAssistant;
  const showStop = props.stop && props.isLoading;

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, props.messages]);

  return (
    <div className="w-full rounded-xl --muted p-4 pb-0">
      <div
        className="h-[50vh] w-full overflow-y-auto rounded-md p-4 chat-messages"
        ref={scrollableChatContainerRef}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          overflowY: "scroll",
          overflowX: "hidden",
        }}
      >
        <div className="flex flex-col gap-5 divide-y divide-muted">
          {props.messages.map((m) => (
            <ChatMessage key={m.id} {...m} />
          ))}
          {/* {props.isLoading && isLastMessageFromAssistant && (
            <div className="flex justify-center items-center pt-10">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>
          )} */}
        </div>
      </div>
      <div className="flex justify-end py-4">
        <ChatActions
          reload={props.reload}
          stop={props.stop}
          showReload={showReload}
          showStop={showStop}
        />
      </div>
    </div>
  );
}

