import { describe, expect, it } from 'vitest'
import { tokenize, SugarHigh } from '../lib'

function getTypeName(token) {
  return SugarHigh.TokenTypes[token[0]]
}

function getTokenValues(tokens) {
  return tokens.map((tk) => tk[1])
}

function getTokenTypes(tokens) {
  return tokens.map((tk) => getTypeName(tk))
}

function getTokenArray(tokens) {
  return tokens.map((tk) => [tk[1], getTypeName(tk)]);
}

function extractTokensTypes(tokens) {
  return getTokenTypes(tokens).filter(type => type !== 'space')
}

function mergeSpaces(str) {
  return str.trim().replace(/^[\s]{2,}$/g, ' ')
}

function filterSpaces(arr) {
  return arr
    .map(t => mergeSpaces(t))
    .filter(Boolean)
}

function extractTokenValues(tokens) {
  return filterSpaces(getTokenValues(tokens))
}

function extractTokenArray(tokens) {
  return tokens
    .map((tk) => [mergeSpaces(tk[1]), getTypeName(tk)])
    .filter(([_, type]) => type !== 'space')
}

describe('function calls', () => {
  it('dot catch should not be determined as keyword', () => {
    const tokens = tokenize(`promise.catch(log)`)
    expect(getTokenArray(tokens)).toEqual([
      ["promise", "identifier"], [".", "sign"], ["catch", "identifier"], ["(", "sign"], ["log", "identifier"], [")", "sign"]
    ])
  })
})

describe('calculation expression', () => {
  it('basic inline calculation expression', () => {
    const tokens = tokenize(`123 - /555/ + 444;`)
    expect(getTokenArray(tokens)).toEqual([
      ['123', 'class'], [' ', 'space'], ['-', 'sign'], [' ', 'space'], ['/555/', 'string'], [' ', 'space'],
      ['+', 'sign'], [' ', 'space'], ['444', 'class'], [';', 'sign']
    ])
  })

  it('calculation with comments', () => {
    const tokens = tokenize(`/* evaluate */ (19) / 234 + 56 / 7;`)
    expect(extractTokenArray(tokens)).toEqual([
      ["/* evaluate */", "comment"], ["(", "sign"], ["19", "class"], [")", "sign"], ["/", "sign"], ["234", "class"],
      ["+", "sign"], ["56", "class"], ["/", "sign"], ["7", "class"], [";", "sign"]
    ])
  })

  it('calculation with defs', () => {
    const tokens = tokenize(`const _iu = (19) / 234 + 56 / 7;`)
    expect(extractTokenArray(tokens)).toEqual([
      ["const", "keyword"], ["_iu", "class"], ["=", "sign"], ["(", "sign"], ["19", "class"], [")", "sign"], ["/", "sign"],
      ["234", "class"], ["+", "sign"], ["56", "class"], ["/", "sign"], ["7", "class"], [";", "sign"]
    ])
  })
})

describe('jsx', () => {
  it('parse jsx compositions', () => {
    const tokens = tokenize(`// jsx
    const element = (
      <>
        <Food
          season={{
            sault: <p a={[{}]} />
          }}>
        </Food>
        {/* jsx comment */}
        <h1 className="title" data-title="true">
          Read more{' '}
          <Link href="/posts/first-post">
            <a>this page! - {Date.now()}</a>
          </Link>
        </h1>
      </>
    )`)
    expect(extractTokenArray(tokens)).toEqual([
      ["// jsx", "comment"], ["const", "keyword"], ["element", "identifier"], ["=", "sign"], ["(", "sign"], ["", "break"],
      ["<", "sign"], [">", "sign"], ["", "break"], ["<", "sign"], ["Food", "identifier"], ["", "break"],
      ["season", "identifier"], ["=", "sign"], ["{", "sign"], ["{", "sign"], ["", "break"], ["sault", "identifier"],
      [":", "sign"], ["<", "sign"], ["p", "identifier"], ["a", "identifier"], ["=", "sign"], ["{", "sign"], ["[", "sign"],
      ["{", "sign"], ["}", "sign"], ["]", "sign"], ["}", "sign"], ["/>", "sign"], ["", "break"], ["}", "sign"], ["}", "sign"],
      [">", "sign"], ["", "break"], ["</", "sign"], ["Food", "identifier"], [">", "sign"], ["", "break"], ["{", "sign"],
      ["/* jsx comment */", "comment"], ["}", "sign"], ["", "break"], ["<", "sign"], ["h1", "identifier"],
      ["className", "identifier"], ["=", "sign"], ["\"", "string"], ["title", "string"], ["\"", "string"],
      ["data", "identifier"], ["-", "sign"], ["title", "identifier"], ["=", "sign"], ["\"", "string"], ["true", "string"],
      ["\"", "string"], [">", "sign"], ["", "jsxliterals"], ["Read more", "jsxliterals"], ["{", "sign"], ["'", "string"],
      ["", "string"], ["'", "string"], ["}", "sign"], ["", "jsxliterals"], ["", "jsxliterals"], ["<", "sign"],
      ["Link", "identifier"], ["href", "identifier"], ["=", "sign"], ["\"", "string"], ["/posts/first-post", "string"],
      ["\"", "string"], [">", "sign"], ["", "jsxliterals"], ["", "jsxliterals"], ["<", "sign"], ["a", "identifier"],
      [">", "sign"], ["this page! -", "jsxliterals"], ["{", "sign"], ["Date", "class"], [".", "sign"], ["now", "identifier"],
      ["(", "sign"], [")", "sign"], ["}", "sign"], ["</", "sign"], ["a", "identifier"], [">", "sign"], ["", "break"],
      ["</", "sign"], ["Link", "identifier"], [">", "sign"], ["", "break"], ["</", "sign"], ["h1", "identifier"],
      [">", "sign"], ["", "break"], ["</", "sign"], [">", "sign"], ["", "break"], [")", "sign"]
    ])
  })

  it('parse basic jsx with text without expression children', () => {
    const tokens = tokenize(`<Foo>This is content</Foo>`)
    expect(extractTokenArray(tokens)).toEqual([
      ["<", "sign"], ["Foo", "identifier"], [">", "sign"], ["This is content", "jsxliterals"], ["</", "sign"],
      ["Foo", "identifier"], [">", "sign"]
    ])
  })

  it('parse basic jsx with expression children', () => {
    const tokens = tokenize(`<Foo>{Class + variable}</Foo>`)
    expect(extractTokenArray(tokens)).toEqual([
      ["<", "sign"], ["Foo", "identifier"], [">", "sign"], ["{", "sign"], ["Class", "class"], ["+", "sign"],
      ["variable", "identifier"], ["}", "sign"], ["</", "sign"], ["Foo", "identifier"], [">", "sign"]
    ])
  })

  it('parse multi jsx definitions', () => {
    const tokens = tokenize(
      `x = <div>this </div>
        y = <div>thi</div>
        z = <div>this</div>
      `)
    expect(extractTokenArray(tokens)).toEqual([
      ["x", "identifier"], ["=", "sign"], ["<", "sign"], ["div", "identifier"], [">", "sign"], ["this", "jsxliterals"],
      ["</", "sign"], ["div", "identifier"], [">", "sign"], ["", "break"],
      ["y", "identifier"], ["=", "sign"], ["<", "sign"], ["div", "identifier"], [">", "sign"], ["thi", "jsxliterals"],
      ["</", "sign"], ["div", "identifier"], [">", "sign"], ["", "break"],
      ["z", "identifier"], ["=", "sign"], ["<", "sign"], ["div", "identifier"], [">", "sign"], ["this", "jsxliterals"],
      ["</", "sign"], ["div", "identifier"], [">", "sign"], ["", "break"]
    ])
  })

  it('parse fold jsx', () => {
    const tokens = tokenize(`// jsx
    const element = (
      <div>Hello World <Food /><div/>
    )`);
    expect(extractTokenArray(tokens)).toEqual([
      ["// jsx", "comment"], ["const", "keyword"], ["element", "identifier"], ["=", "sign"], ["(", "sign"], ["", "break"],
      ["<", "sign"], ["div", "identifier"], [">", "sign"], ["Hello World", "jsxliterals"], ["<", "sign"],
      ["Food", "identifier"], ["/>", "sign"], ["<", "sign"], ["div", "identifier"], ["/>", "sign"], ["", "jsxliterals"],
      [")", "jsxliterals"]
    ])
  })

  it('parse keyword in jsx children literals as jsx literals', () => {
    const tokens = tokenize(`<div>Hello <Name /> with {data}</div>`)
    expect(extractTokenArray(tokens)).toEqual([
      ["<", "sign"], ["div", "identifier"], [">", "sign"], ["Hello", "jsxliterals"], ["<", "sign"], ["Name", "identifier"],
      ["/>", "sign"], ["with", "jsxliterals"], ["{", "sign"], ["data", "identifier"], ["}", "sign"], ["</", "sign"],
      ["div", "identifier"], [">", "sign"]
    ])
  })

  it('parse arrow function in jsx correctly', () => {
    const code = '<button onClick={() => {}}>click</button>'
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["<", "sign"], ["button", "identifier"], ["onClick", "identifier"], ["=", "sign"], ["{", "sign"], ["(", "sign"],
      [")", "sign"], ["=", "sign"], [">", "sign"], ["{", "sign"], ["}", "sign"], ["}", "sign"], [">", "sign"],
      ["click", "jsxliterals"], ["</", "sign"], ["button", "identifier"], [">", "sign"]
    ])
  })

  it('should render string for any jsx attribute values', () => {
    const code = '<h1 data-title="true" />'
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["<", "sign"], ["h1", "identifier"], ["data", "identifier"], ["-", "sign"], ["title", "identifier"], ["=", "sign"],
      ["\"", "string"], ["true", "string"], ["\"", "string"], ["/>", "sign"]
    ])

    const code2 = '<svg color="null" height="24"/>'
    const tokens2 = tokenize(code2)
    expect(extractTokenArray(tokens2)).toEqual([
      ["<", "sign"], ["svg", "identifier"], ["color", "identifier"], ["=", "sign"], ["\"", "string"], ["null", "string"],
      ["\"", "string"], ["height", "identifier"], ["=", "sign"], ["\"", "string"], ["24", "string"], ["\"", "string"], ["/>", "sign"]
    ])
  })

  it('should render single quote inside jsx literals as jsx literals', () => {
    const code = `<p>Let's get started!</p>`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["<", "sign"], ["p", "identifier"], [">", "sign"], ["Let's get started!", "jsxliterals"], ["</", "sign"], ["p", "identifier"],
      [">", "sign"]
    ])
  })

  it('should handle nested jsx literals correctly', async () => {
    const code =
    `<>
      <div>
        <p>Text 1</p>
      </div>
      <p>Text 2</p>
    </>`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["<", "sign"], [">", "sign"], ["", "break"], ["<", "sign"], ["div", "identifier"], [">", "sign"], ["", "jsxliterals"],
      ["", "jsxliterals"], ["<", "sign"], ["p", "identifier"], [">", "sign"], ["Text 1", "jsxliterals"], ["</", "sign"],
      ["p", "identifier"], [">", "sign"], ["", "break"], ["</", "sign"], ["div", "identifier"], [">", "sign"], ["", "break"],
      ["<", "sign"], ["p", "identifier"], [">", "sign"], ["Text 2", "jsxliterals"], ["</", "sign"], ["p", "identifier"],
      [">", "sign"], ["", "break"], ["</", "sign"], [">", "sign"]
    ])
  })
})

describe('comments', () => {
  it('basic inline comments', () => {
    const code = `+ // This is a inline comment / <- a slash`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["+", "sign"], ["// This is a inline comment / <- a slash", "comment"]
    ])
  })

  it('multiple slashes started inline comments', () => {
    const code = `/// <reference path="..." /> // reference comment`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["/// <reference path=\"...\" /> // reference comment", "comment"]
    ])
  })

  it('multi-line comments', () => {
    const code = `/* This is another comment */ alert('good') // <- alerts`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["/* This is another comment */", "comment"], ["alert", "identifier"], ["(", "sign"], ["'", "string"],
      ["good", "string"], ["'", "string"], [")", "sign"], ["// <- alerts", "comment"]
    ])
  })
})

describe('regex', () => {
  it('basic regex', () => {
    const reg1 = '/^\\/[0-5]\\/$/'
    const reg2 = `/^\\w+[a-z0-9]/ig`
    expect(extractTokenArray(tokenize(reg1))).toEqual([["/^\\/[0-5]\\/$/", "string"]])
    expect(extractTokenArray(tokenize(reg2))).toEqual([["/^\\w+[a-z0-9]/ig", "string"]])
  })

  it('regex plus operators', () => {
    const code = `/^\\/[0-5]\\/$/ + /^\\/\w+\\/$/gi`
    expect(extractTokenArray(tokenize(code))).toEqual([
      ["/^\\/[0-5]\\/$/", "string"], ["+", "sign"], ["/^\\/w+\\/$/gi", "string"]
    ])
  })

  it('regex with quotes inside', () => {
    const code = `replace(/'/, \`"\`)`
    expect(extractTokenArray(tokenize(code))).toEqual([
      ["replace", "identifier"], ["(", "sign"], ["/'/", "string"], [",", "sign"], ["`", "string"], ["\"", "string"],
      ["`", "string"], [")", "string"]
    ])
  })

  it('multi line regex tests', () => {
    const code1 =
      `/reg/.test('str')[]\n` +
      `/reg/.test('str')`

    // '[]' consider as a end of the expression
    expect(extractTokenArray(tokenize(code1))).toEqual([
      ["/reg/", "string"], [".", "sign"], ["test", "identifier"], ["(", "sign"], ["'", "string"], ["str", "string"],
      ["'", "string"], [")", "sign"], ["[", "sign"], ["]", "sign"], ["", "break"], ["/reg/", "string"], [".", "sign"],
      ["test", "identifier"], ["(", "sign"], ["'", "string"], ["str", "string"], ["'", "string"], [")", "sign"]
    ])

    const code2 =
      `/reg/.test('str')()\n` +
      `/reg/.test('str')`

    // what before '()' still considers as an expression
    expect(extractTokenArray(tokenize(code2))).toEqual([
      ["/reg/", "string"], [".", "sign"], ["test", "identifier"], ["(", "sign"], ["'", "string"], ["str", "string"],
      ["'", "string"], [")", "sign"], ["(", "sign"], [")", "sign"], ["", "break"], ["/", "sign"], ["reg", "identifier"],
      ["/", "sign"], [".", "sign"], ["test", "identifier"], ["(", "sign"], ["'", "string"], ["str", "string"],
      ["'", "string"], [")", "sign"]
    ])
  })
})

describe('strings', () => {
  it('import paths', () => {
    const code = `import mod from "../../mod"`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["import", "keyword"], ["mod", "identifier"], ["from", "keyword"], ["\"", "string"], ["../../mod", "string"],
      ["\"", "string"]
    ])
  })

  it('multi quotes string', () => {
    const str1 = `"aa'bb'cc"`
    const str2 = `'aa"bb"cc'`
    const str3 = `\`\nabc\``
    expect(extractTokenArray(tokenize(str1))).toEqual([
      ["\"", "string"], ["aa", "string"], ["'", "string"], ["bb", "string"], ["'", "string"], ["cc", "string"],
      ["\"", "string"]
    ])
    expect(extractTokenArray(tokenize(str2))).toEqual([
      ["'", "string"], ["aa", "string"], ["\"", "string"], ["bb", "string"], ["\"", "string"], ["cc", "string"],
      ["'", "string"]
    ])
    expect(extractTokenArray(tokenize(str3))).toEqual([
      ["`", "string"], ["abc", "string"], ["`", "string"]
    ])
  })

  it('string template', () => {
    const code1 = `
      \`hi \$\{ a \} world\`
      \`hello \$\{world\}\`
    `
    expect(extractTokenArray(tokenize(code1))).toEqual([
      ["", "break"], ["`", "string"], ["hi", "string"], ["${", "sign"], ["a", "identifier"], ["}", "sign"],
      ["world", "string"], ["`", "string"], ["", "break"], ["`", "string"], ["hello", "string"], ["${", "sign"],
      ["world", "identifier"], ["}", "sign"], ["`", "string"], ["", "break"]
    ])

    const code2 = `
    \`hi \$\{ b \} plus \$\{ c + \`text\` \}\`
      \`nested \$\{ c + \`\$\{ no \}\` }\`
    `
    const tokens2 = tokenize(code2)
    expect(extractTokenArray(tokens2)).toEqual([
      ["", "break"], ["`", "string"], ["hi", "string"], ["${", "sign"], ["b", "identifier"], ["}", "sign"],
      ["plus", "string"], ["${", "sign"], ["c", "identifier"], ["+", "sign"], ["`", "string"], ["text", "string"],
      ["`", "string"], ["}", "sign"], ["`", "string"], ["", "break"], ["`", "string"], ["nested", "string"],
      ["${", "sign"], ["c", "identifier"], ["+", "sign"], ["`", "string"], ["${", "sign"], ["no", "identifier"],
      ["}", "sign"], ["`", "string"], ["}", "sign"], ["`", "string"], ["", "break"]
    ])

    const code3 = `
    \`
      hehehehe
      \`
      'we'
      "no"
      \`hello\`
    `
    expect(extractTokenArray(tokenize(code3))).toEqual([
      ["", "break"],["`", "string"], ["hehehehe", "string"], ["`", "string"],
      ["", "break"], ["'", "string"], ["we", "string"], ["'", "string"],
      ["", "break"], ["\"", "string"], ["no", "string"], ["\"", "string"],
      ["", "break"], ["`", "string"], ["hello", "string"], ["`", "string"],
      ["", "break"]
    ])
  })

  it('unicode token', () => {
    const code = `let hello你好 = 'hello你好'`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["let", "keyword"], ["hello你好", "identifier"], ["=", "sign"], ["'", "string"], ["hello你好", "string"], ["'", "string"]
    ])
  })

  it('number in string', () => {
    const code = `'123'\n'true'`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["'", "string"], ["123", "string"], ["'", "string"], ["", "break"], ["'", "string"], ["true", "string"], ["'", "string"]
    ])
  })
})

describe('class', () => {
  it('determine class name', () => {
    const code = `class Bar extends Array {}`
    const tokens = tokenize(code)
    expect(extractTokenArray(tokens)).toEqual([
      ["class", "keyword"], ["Bar", "class"], ["extends", "keyword"], ["Array", "class"], ["{", "sign"], ["}", "sign"]
    ])
  })
})
