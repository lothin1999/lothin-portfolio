const fs = require("fs");
const path = require("path");

const templateTs = fs.readFileSync(path.join(__dirname, "../src/lib/cvTemplate.ts"), "utf8");
// Since cvTemplate.ts is a backtick template literal, we can match: export const cvTemplate = `([\s\S]*)`;
const match = templateTs.match(/export const cvTemplate = `([\s\S]*)`;/);
if (!match) {
  console.error("Could not parse formatted template");
  process.exit(1);
}

let cvTemplate = match[1]
  .replace(/\\\`/g, "`")
  .replace(/\\\${/g, "${");

function testSection(name, regex) {
  const replaced = cvTemplate.replace(regex, `<!-- START_${name.toUpperCase()} -->\nTEST_${name.toUpperCase()}\n<!-- END_${name.toUpperCase()} -->`);
  const index = replaced.indexOf(`TEST_${name.toUpperCase()}`);
  if (index === -1) {
    console.log(`${name}: NOT FOUND`);
    return;
  }
  const snippet = replaced.substring(index - 100, index + 300);
  console.log(`=== ${name} ===`);
  console.log(snippet);
  console.log("------------------------");
}

testSection("contact", /<!-- START_CL_CONTACT -->[\s\S]*?<!-- END_CL_CONTACT -->/);
testSection("cl_date", /<!-- START_CL_DATE -->[\s\S]*?<!-- END_CL_DATE -->/);
testSection("cl_key_skills", /<!-- START_CL_KEY_SKILLS -->[\s\S]*?<!-- END_CL_KEY_SKILLS -->/);
testSection("cl_references", /<!-- START_CL_REFERENCES -->[\s\S]*?<!-- END_CL_REFERENCES -->/);
testSection("cl_signature", /<!-- START_CL_SIGNATURE -->[\s\S]*?<!-- END_CL_SIGNATURE -->/);
testSection("p2_header", /<!-- START_P2_HEADER -->[\s\S]*?<!-- END_P2_HEADER -->/);
testSection("p2_photo", /<!-- START_P2_PHOTO -->[\s\S]*?<!-- END_P2_PHOTO -->/);
testSection("p2_contact", /<!-- START_P2_CONTACT -->[\s\S]*?<!-- END_P2_CONTACT -->/);
testSection("p2_skills", /<!-- START_P2_SKILLS -->[\s\S]*?<!-- END_P2_SKILLS -->/);
testSection("p2_language", /<!-- START_P2_LANGUAGE -->[\s\S]*?<!-- END_P2_LANGUAGE -->/);
testSection("p2_experience", /<!-- START_P2_EXPERIENCE -->[\s\S]*?<!-- END_P2_EXPERIENCE -->/);
testSection("p2_education", /<!-- START_P2_EDUCATION -->[\s\S]*?<!-- END_P2_EDUCATION -->/);
testSection("p2_references", /<!-- START_P2_REFERENCES -->[\s\S]*?<!-- END_P2_REFERENCES -->/);
