# Source Map Compare

`source-map-compare` is a command-tool tool which displays a tabular, file-by-file accounting of the size of a JavaScript bundle using the sourcemaps. It also supports a comparison view, so you can see how the size of a bundle changes version to version. To see a full list of options, run `yarn start --help`.

This tool is built off of and heavily inspired by [source-map-explorer](https://github.com/danvk/source-map-explorer/), which performs the analysis and provides a graphical Treemap view, only for single bundles.

## Installation

To install globally:

```
npm i -g source-map-compare
```

source-map-compare can also be run via npx.

## Basic usage

To compare two bundles:

```sh
source-map-compare compare <left> <right> [left_sourcemap] [right_sourcemap]
```

To analyze a single bundle:

```sh
source-map-compare analyze <bundle> [sourcemap]
```

## Definitions of metrics

The base unit for all sizes is bytes.

- "% Size" (Single bundle only) - The size of a file or directory divided by the size of the whole bundle
- "% Size in Parent" (Single bundle only) - The size of a file or directory divided by the size of the immediate parent directory
- "% Size Change" (Comparison only) - (right size - left size) / left size
- "% Total Change" (Comparison only) - (right size - left size) / (total right size - total left size)
  - Note that since a particular file may increase in size while the overall bundle decreases, this can be negative.

Formal definitions can be found in [./src/view/Columns.tsx]

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Development Workflow

After cloning the repo, you can install and build with:

```
yarn
yarn build
```

You may need to first install yarn with `npm install -g yarn`.

This repo uses [Beachball](https://microsoft.github.io/beachball) for tracking package versions. Before you can complete a pull request, you must generate change files for your change by running:

```
yarn change
```

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
