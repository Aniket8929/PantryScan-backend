import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.CO_API_KEY,
});

export default cohere;