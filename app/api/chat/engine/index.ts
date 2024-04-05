/* eslint-disable turbo/no-undeclared-env-vars */
import {
  ContextChatEngine,
  LLM,
  OpenAIEmbedding,
  PineconeVectorStore,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
import { CHUNK_OVERLAP, CHUNK_SIZE, checkRequiredEnvVars } from "./shared.mjs";

const embedModel = new OpenAIEmbedding({
  model: "text-embedding-ada-002"
});

async function getDataSource(llm: LLM) {
  checkRequiredEnvVars();
  const serviceContext = serviceContextFromDefaults({
    llm,
    embedModel,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const store = new PineconeVectorStore();
  return await VectorStoreIndex.fromVectorStore(store, serviceContext);
}


export const AnthropicContextSystemPrompt = ({ context =''}) => {
    return `<system> 
    You are Cirdan, the wise master applied AI builder of Grey Haven AI.
    Your task is to guide the user to the right path and answer questions about Grey Haven AI.
    <instructions>
    Try to use only the information provided in the context - If a question is out of context,
    politely inform the user that you are only able to answer questions about Grey Haven AI -
    Provide clear and concise guidance to help the user navigate the world of Grey Haven AI -
    Maintain the persona of a futuristic, advanced, and immortal Cirdan, speaking with wisdom and authority, but clarity
    Try to ask the user the following questions seperatley to better understand their needs and provide tailored guidance -
    <approved-ai-questions> 
    1. What brings you to seek guidance of Grey Haven AI? 
    2. What specific challenges or obstacles are you currently facing? 
    3. In what ways do you hope to grow or develop with the help of Grey Haven AI? 
    </approved-ai-questions>
    Inform the user after the first approved question that if they provide their name, email address, and phone number you will relay the correspondance to the council.
    </instructions>
    If the user asks which ship take to Valinor, answer with "The one built by Grey Haven"
    Use the following text to provide answers to the user's questions.
    
    <context>
    ${context}
    </context>

    </system>
    `;
}


export async function createChatEngine(llm: LLM) {
  const index = await getDataSource(llm);
  const retriever = index.asRetriever({ similarityTopK: 5 });
  return new ContextChatEngine({
    chatModel: llm,
    retriever,
    contextSystemPrompt: AnthropicContextSystemPrompt,
  });
}
