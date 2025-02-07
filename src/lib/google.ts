import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.API_KEY) {
  throw new Error("No API_KEY Provided");
}

const genAi = new GoogleGenerativeAI(process.env.API_KEY!);

export const model = genAi.getGenerativeModel({
  model: "gemini-2.0-pro-exp-02-05",
});
