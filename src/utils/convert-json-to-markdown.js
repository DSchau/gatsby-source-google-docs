const json2md = require("json2md")
const YAML = require("yamljs")
const matter = require("gray-matter")

const normalize = markdown => {
  if (markdown.indexOf("---") === -1) {
    return markdown
  }

  return markdown.replace(/---([\s\S]+)---/, (_, group) => {
    return `---\n${group.trim().replace(/\n+/g, "\n")}\n---`
  })
}

module.exports = ({content, file}) => {
  const {content: markdown, data: frontmatter} = matter(
    json2md(normalize(content))
  )
  return `---
${YAML.stringify(Object.assign({}, file, frontmatter))}---

${markdown}`
}
