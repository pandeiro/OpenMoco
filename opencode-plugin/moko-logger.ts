import type { Plugin } from "@opencode-ai/plugin";

const recordedMessages = new Map<string, { input: number; output: number }>();

function formatCost(cost: number | undefined): string {
  if (cost === undefined) return "$0.0000";
  return `$${cost.toFixed(4)}`;
}

export const MokoLoggerPlugin: Plugin = async ({ directory }) => {
  return {
    event: async ({ event }) => {
      try {
        if (event.type === "message.updated") {
          const message = event.properties.info;

          if (message.role !== "assistant") return;
          if (!message.tokens) return;
          if (message.tokens.input === 0 && message.tokens.output === 0) return;

          const recorded = recordedMessages.get(message.id);
          if (
            recorded &&
            recorded.input === message.tokens.input &&
            recorded.output === message.tokens.output
          ) {
            return;
          }

          console.log(
            JSON.stringify({
              type: "tokens",
              messageId: message.id,
              sessionId: message.sessionID,
              provider: message.providerID,
              model: message.modelID,
              input: message.tokens.input,
              output: message.tokens.output,
              reasoning: message.tokens.reasoning || 0,
              cacheRead: message.tokens.cache?.read || 0,
              cacheWrite: message.tokens.cache?.write || 0,
              cost: message.cost || 0,
            })
          );

          recordedMessages.set(message.id, {
            input: message.tokens.input,
            output: message.tokens.output,
          });
        }
      } catch {
        // Silently fail - don't break opencode
      }
    },

    "tool.execute.before": async (input) => {
      try {
        console.log(
          JSON.stringify({
            type: "tool.start",
            callId: input.callID,
            sessionId: input.sessionID,
            tool: input.tool,
          })
        );
      } catch {
        // ignore
      }
    },

    "tool.execute.after": async (input, output) => {
      try {
        const outputStr = String(output.output ?? "");
        const isError =
          outputStr.includes("Error:") ||
          outputStr.includes("error:") ||
          outputStr.startsWith("Error") ||
          (output.metadata && (output.metadata as any).error);

        console.log(
          JSON.stringify({
            type: "tool.end",
            callId: input.callID,
            sessionId: input.sessionID,
            tool: input.tool,
            success: !isError,
            title: output.title || null,
          })
        );
      } catch {
        // ignore
      }
    },
  };
};
