import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export default async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();

  // Ask OpenAI for a streaming completion given the prompt
  const listofCatehgories = [
    "Fruits",
    "Produce",
    "Dairy & Eggs",
    "Vegetables",
    "Grains",
    "Proteins",
    "Meat & Poultry",
    "Seafood",
    "Bakery",
    "Cereal & Breakfast Foods",
    "Fats",
    "Oils",
    "Sugars",
    "Pantry Goods",
    "Frozen Foods",
    "Sweets",
    "Carbohydrates",
    "Vitamins and Minerals",
    "Fibers",
  ];
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    stream: true,
    temperature: 0,
    max_tokens: 500,
    prompt: `Given the following user input delimited in triple quotes, please classify it into one of the following supermarket shopping list categories: Produce, Dairy & Eggs, Meat & Poultry, Seafood, Bakery, Cereal & Breakfast Foods, Pantry Goods, Frozen Foods, Beverages, Snacks, Deli, Health Foods/Specialty Diets, Pet Supplies, Cleaning Products, Personal Care, Baby Products, Paper Goods, Household Items, Pharmacy. If the user input is not a supermarket product say that you didn't find a match for that word.
User Input:
"""${prompt}"""`,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
