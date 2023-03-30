import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "../config/pinecone";
import { makeChain } from "../utils/makechain";
import { pinecone } from "../utils/pinecone-client";

export async function run() {
  try {
    const question = "what are some of your personal projects?";

    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({}),
      {
        pineconeIndex: index,
        textKey: "text",
        namespace: PINECONE_NAME_SPACE,
      }
    );

    // create chain
    const chain = makeChain(vectorStore);

    const response = await chain.call({
      question: question,
      chat_history: [],
    });

    console.log("response", response.text);
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  await run();
})();
