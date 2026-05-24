async function run() {
  const res = await fetch("http://localhost:5000/api/trips/1776044710478");
  console.log("STATUS:", res.status);
  const text = await res.text();
  console.log("BODY:", text.slice(0, 1000));
}
run();
