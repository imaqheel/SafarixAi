import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

// The OpenAI integration uses Replit AI integrations seamlessly.
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.trips.create.path, async (req, res) => {
    try {
      const input = api.trips.create.input.parse(req.body);
      
      // Generate AI trip plan
      const prompt = `
        Create a detailed travel itinerary for:
        Destination: ${input.destination}
        Dates: ${input.startDate} to ${input.endDate} (${input.days} days)
        Budget: ${input.budget}
        Travelers: ${input.travelers}
        Activities: ${input.activities.join(", ")}
        Options: ${input.options.halal ? "Halal food required. " : ""}${input.options.vegetarian ? "Vegetarian food required. " : ""}
        
        Respond with ONLY a valid JSON object in the exact following format, DO NOT wrap in markdown code blocks:
        {
          "itinerary": [
            { "day": 1, "date": "Day 1", "places": [{ "name": "...", "description": "..." }] }
          ],
          "lodging": [
            { "name": "...", "rating": 4.5, "pricePerNight": 150, "imageSearchQuery": "..." }
          ],
          "estimatedCosts": {
            "accommodation": { "type": "...", "range": "..." },
            "transportation": [ { "type": "...", "cost": "..." } ],
            "food": [ { "type": "...", "cost": "..." } ],
            "activities": [ { "name": "...", "cost": "..." } ]
          }
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) throw new Error("No response from AI");
      
      const parsedData = JSON.parse(responseText);

      const trip = await storage.createTrip({
        ...input,
        itinerary: parsedData.itinerary,
        lodging: parsedData.lodging,
        estimatedCosts: parsedData.estimatedCosts
      });

      res.status(201).json(trip);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Error creating trip:", err);
      res.status(500).json({ message: "Failed to generate trip" });
    }
  });

  app.get(api.trips.get.path, async (req, res) => {
    const trip = await storage.getTrip(Number(req.params.id));
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  });

  return httpServer;
}