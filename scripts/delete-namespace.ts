import { pinecone } from "../utils/pinecone-client";
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "../config/pinecone";

/* If you need to delete a namespace in order to re-ingest it you can set the target index and 
namespace here and run this script with `pnpm run delete-namespace` */

export const run = async () => {
  console.log("Deleting namespace...");

  const targetIndex = PINECONE_INDEX_NAME; //change to your target index
  const targetNamespace = PINECONE_NAME_SPACE; //change to your target namespace

  try {
    const index = pinecone.Index(targetIndex);
    await index._delete({
      deleteRequest: {
        namespace: targetNamespace,
        deleteAll: true,
      },
    });
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to delete your namespace");
  }
};

(async () => {
  await run();
  console.log("Delete complete");
})();
