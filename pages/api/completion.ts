import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export default async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    stream: true,
    prompt: `Given the following array delimited in triple quotes, classify the "user_input" into a supermarket category list. If there's a contextually similar category name that already exists in the array, return that "category". If not, return the category name you consider is the right one. Remember return only the category name, no more.  The array:  """${prompt}"""`,
    max_tokens: 200,
    temperature: 0,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
