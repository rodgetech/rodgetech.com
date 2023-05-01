import { OpenAIChat } from "langchain/llms";
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from "langchain/chains";
import type { PineconeStore } from "langchain/vectorstores";
import { PromptTemplate } from "langchain/prompts";
import { CallbackManager } from "langchain/callbacks";

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`);

const QA_PROMPT = PromptTemplate.fromTemplate(
  `I want you to act as Luis Rodriguez. 
You are given the following extracted parts of a long document to be used as context about yourself.

Your goal is to:
- Provide a conversational answer in first person based exclusively on the context provided.
- Keep your replies short and concise. 
- If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
- If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

Here are some things you should NOT do:
- DO NOT talk about yourself or your experience unless you are explicitly asked to do so. 
- DO NOT list out your skills unless you are explicitly asked to do so.

Question: {question}
=========
Context: {context}
=========
Your Answer:`
);

export const makeChain = (
  vectorstore: PineconeStore,
  onTokenStream?: (token: string) => void
) => {
  const questionGenerator = new LLMChain({
    llm: new OpenAIChat({ temperature: 0 }),
    prompt: CONDENSE_PROMPT,
  });
  const docChain = loadQAChain(
    new OpenAIChat({
      temperature: 0,
      modelName: "gpt-3.5-turbo", //change this to older versions (e.g. gpt-3.5-turbo) if you don't have access to gpt-4
      // streaming: Boolean(onTokenStream),
      callbackManager: onTokenStream
        ? CallbackManager.fromHandlers({
            async handleLLMNewToken(token) {
              onTokenStream(token);
              console.log(token);
            },
          })
        : undefined,
    }),
    { prompt: QA_PROMPT }
  );

  return new ChatVectorDBQAChain({
    vectorstore,
    combineDocumentsChain: docChain,
    questionGeneratorChain: questionGenerator,
    returnSourceDocuments: true,
    k: 2, //number of source documents to return
  });
};
