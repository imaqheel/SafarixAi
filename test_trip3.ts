import fs from "fs/promises";
async function run() {
  const text = await fs.readFile("full_trip.json", "utf8");
  const data = JSON.parse(text);
  console.log("Trip ID:", data.id);
  console.log("Keys of trip:", Object.keys(data));
  console.log("Options:", data.options);
  console.log("Has itinerary?", !!data.itinerary);
  if (data.itinerary) {
     console.log("Is array?", Array.isArray(data.itinerary));
     if (Array.isArray(data.itinerary)) {
         console.log("First day:", Object.keys(data.itinerary[0] || {}));
         console.log("First day activities:", Array.isArray(data.itinerary[0]?.activities));
     } else {
         console.log("Itinerary keys:", Object.keys(data.itinerary));
     }
  }
}
run();
