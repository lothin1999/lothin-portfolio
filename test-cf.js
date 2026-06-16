const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key) acc[key] = val.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = env.CLOUDFLARE_AI_API_TOKEN;
const bucketName = env.R2_BUCKET_NAME || "portfolio-data";
const key = "images/img-test-123.jpg"; // dummy key

async function main() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`;
  
  console.log("Uploading...");
  await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "image/jpeg" },
    body: "dummy"
  });

  console.log("Deleting...");
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  console.log("Status:", res.status);
  const json = await res.json();
  console.log(JSON.stringify(json));
}
main();
