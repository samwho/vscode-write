# vscode-write

A collection of tools to aid writing with VSCode.

## Features

- Highlights sentences with a high automated readability index.
- Uses [write-good][2] to highlight common writing mistakes.
- Spell checks English words.

## Config

- `write.readability.threshold`: a number representing what automated readability index score to flag to the user. See <https://en.wikipedia.org/wiki/Automated_readability_index> for how to set this.
- `write.write-good.*`: a range of boolean for disabling the features in `write-good`. Names match 1:1 with the features discussed in [the readme][1].

[1]: https://github.com/btford/write-good#checks
[2]: https://github.com/btford/write-good