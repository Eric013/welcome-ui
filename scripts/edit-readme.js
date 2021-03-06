const path = require('path')
const fs = require('fs')
const util = require('util')

const kebabCase = require('lodash.kebabcase')

fs.readFileAsync = util.promisify(fs.readFile)
fs.readdirAsync = util.promisify(fs.readdir)
fs.writeFileAsync = util.promisify(fs.writeFile)

const ROOT_PATH = path.join(__dirname, '../packages')

const collectFolders = () =>
  fs
    .readdirAsync(ROOT_PATH, { withFileTypes: true })
    .then(files => files.filter(f => f.isDirectory()))

const collectPackages = folder =>
  folder
    .filter(({ name }) => !name.startsWith('_'))
    .map(({ name }) => ({
      pkgName: kebabCase(name),
      componentName: name,
      config: require(`${ROOT_PATH}/${name}/package.json`)
    }))

const handleError = err => {
  // eslint-disable-next-line no-console
  console.error(err)
  throw err
}

collectFolders()
  .then(collectPackages)
  .then(packages => packages.forEach(createReadme))
  .catch(handleError)

const createReadme = pkg => {
  fs.writeFileAsync(`${ROOT_PATH}/${pkg.componentName}/README.md`, getReadmeContent(pkg))
    // eslint-disable-next-line no-console
    .then(() => console.debug('Successfully wrote', pkg.pkgName))
    .catch(handleError)
}

// README.md
const getReadmeContent = pkg => {
  const {
    componentName,
    config: { homepage: docs, name }
  } = pkg

  const hasDocs = docs !== 'http://welcome-ui.com'

  const content = `# ${name}

The ${
    hasDocs ? `[${componentName}](${docs})` : componentName
  } component from [@welcome-ui](http://welcome-ui.com).

## Installation

    yarn add ${name}

## Import

    import { ${componentName} } from '${name}'

## Documentation

See the ${
    hasDocs ? `[documentation](${docs}) or ` : ''
  }[package source](https://github.com/WTTJ/welcome-ui/tree/master/packages/${componentName}) for more details.
`

  return content
}
