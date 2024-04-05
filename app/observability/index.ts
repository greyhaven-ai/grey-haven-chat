import * as traceloop from "@traceloop/node-server-sdk";
import * as LlamaIndex from "llamaindex";

export const initObservability = () => {
  traceloop.initialize({
    appName: "grey-haven-chat",
    disableBatch: true,
    apiKey: process.env.TRACELOOP_API_KEY,
    instrumentModules: {
      llamaIndex: LlamaIndex,
    },
  });
};
