const json2md = require("json2md")
const YAML = require("yamljs")
const matter = require("gray-matter")

module.exports = ({content, file}) => {
  const {content: markdown, data: frontmatter} = matter(json2md(content))
  return `---
${YAML.stringify(Object.assign({}, file, frontmatter))}---

${markdown}`
}
