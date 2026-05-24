import { MongoClient } from "mongodb";

// Try connecting to Mongo
async function main() {
  const uri = "mongodb+srv://safarixai:AiByAqheel%4026@cluster0.ulgotbi.mongodb.net/travel_ai_planner?appName=Cluster0";
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 2000, tlsInsecure: true });
    await client.connect();
    console.log("SUCCESS!");
    await client.close();
  } catch(e) {
    console.error("FAIL:", e);
  }
}
main();
