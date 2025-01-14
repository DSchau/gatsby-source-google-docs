const json2md = require("json2md")
const YAML = require("yamljs")
const prettier = require("prettier")
const graymatter = require("gray-matter")

const normalize = (content, file) => {
  let frontmatter = []
  let normalized = []
  for (let i = 0; i < content.length; i++) {
    const line = content[i]

    if (line.p === "---") {
      let nextIndex = i + 1
      while (content[nextIndex].p !== "---") {
        frontmatter.push(content[nextIndex])
        nextIndex += 1
      }
      i = nextIndex
      continue
    }

    if (line.p && line.p.indexOf("```") === 0) {
      const language = line.p.split("```").pop() || `markup`
      const lines = []
      let nextIndex = i + 1
      while (content[nextIndex].p !== "```") {
        lines.push(content[nextIndex].p)
        nextIndex += 1
      }

      normalized.push({
        code: {
          language,
          content: lines,
        },
      })
      i = nextIndex
      continue
    }

    normalized.push(line)
  }

  let markdown = json2md(normalized)
  try {
    markdown = prettier.format(markdown, {
      parser: "markdown",
      singleQuote: true,
    })
  } catch (e) {
    console.warn(`The file at ${file.path} appears to be invalid Markdown`)
  }

  return {
    markdown,
    frontmatter: graymatter(
      [`---`]
        .concat(Object.keys(file).map(key => `${key}: ${file[key]}`))
        .concat(
          json2md(frontmatter)
            .replace(/\n+/g, "\n")
            .replace(/[“”]/g, '"')
            .trim()
        )
        .concat(`---`)
        .join("\n")
    ).data,
  }
}

module.exports = ({content, file}) => {
  const {markdown, frontmatter} = normalize(content, file)
  return `---
${YAML.stringify(frontmatter)}---

${markdown}`
}
