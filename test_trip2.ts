async function run() {
  const res = await fetch("http://localhost:5000/api/trips/1776043984310");
  const text = await res.text();
  const fs = await import("fs/promises");
  await fs.writeFile("full_trip.json", text);
}
run();
