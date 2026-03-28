import sendResponse from "../utils/sendResponse.js";
import cohere from "../config/cohere.js";
import axios from "axios";
const structuredprompt = `
You are a meal planner AI. Respond ONLY in strict JSON format like this:
{
  "name": "",
  "emoji": "",
  "image": "",
  "description": "",
  "tags": [{"label":"","cls":""}],
  "nutrition":{"calories":0,"items":[{"label":"","value":"","pct":0,"color":""}]},
  "ingredients":[{"amount":"","item":""}],
  "steps":[],
  "cookTime":"",
  "prepTime":"",
  "difficulty":"",
  "difficultyColor":"",
  "servings":0,
  "aiReason":"",
  "alternatives":[]
}
Generate a healthy meal with all fields filled.
`;

function cleanAIResponse(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export const GenerateMeal = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return sendResponse(res, 400, "Prompt is required");
    }
    const response = await cohere.chat({
      model: "command-xlarge-nightly",
      message: structuredprompt + "\nUser request: " + prompt,
      max_tokens: 800,
      temperature: 0.7,
    });
    const cleanText = cleanAIResponse(response.text);
    return sendResponse(res, 200, "Meal generated successfully", cleanText);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Internal server error");
  }
};
const productCache = {};

export const Productinfo = async (req, res) => {
  try {
    const { productID } = req.body;
    if (!productID) {
      return sendResponse(res, 400, "No product ID provided");
    }
    if (productCache[productID]) {
      console.log("Serving from cache:", productID);
      return sendResponse(
        res,
        200,
        "fetch successful (cache)",
        productCache[productID],
      );
    }

    // 3️⃣ Fetch from API
    const url = `https://world.openfoodfacts.org/api/v0/product/${productID}.json`;
    const { data } = await axios.get(url, { timeout: 5000 });
    if (!data) {
      return sendResponse(res, 502, "Invalid response from API");
    }
    if (data.status !== 1) {
      return sendResponse(res, 404, "Product not found");
    }
    const product = data.product || {};
    const result = {
      id: productID,
      name: product.product_name || "Unknown",
      brand: product.brands || "Unknown",
      image: product.image_url || null,
      sugar:
        product?.nutriments?.sugars_100g !== undefined
          ? `${product.nutriments.sugars_100g}g`
          : "Unknown",
      calories:
        product?.nutriments?.energy_kcal_100g !== undefined
          ? `${product.nutriments.energy_kcal_100g} kcal`
          : "Unknown",
      fat:
        product?.nutriments?.fat_100g !== undefined
          ? `${product.nutriments.fat_100g}g`
          : "Unknown",
      ingredients: product.ingredients_text
        ? product.ingredients_text.split(",").map((i) => i.trim())
        : [],
      labels: product.labels_tags || [],
      found: true,
    };

    productCache[productID] = result;
    return sendResponse(res, 200, "fetch successful", result);
  } catch (err) {
    console.error("Error:", err.message);

    if (err.code === "ECONNABORTED") {
      return sendResponse(res, 504, "Request timeout");
    }

    return sendResponse(res, 500, "Failed to fetch product info");
  }
};
