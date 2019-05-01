## Documentation

You can see below the API reference of this module.

### `init(config, cb)`
Inits BibleJS submodules by downloading them as set in the `config` object
This method should be called before initializing the BibleJS instance.

#### Params

- **Object** `config`: The configuration object containing the following field:
 - `versions` (Object)
    - `<version_name>` (Object)
       - `source` (String): The git url of the BibleJS submodule.
       - `version` (String): The git tag or branch of the submodule.
       - `language` (String): The submodule language.
- **Function** `cb`: The cb function.

#### Return
- **BibleJS** The BibleJS constructor.

### `BibleJS(options)`
Creates a new `BibleJS` instance.

#### Params

- **Object** `options`: An object containing the following fields:
 - `language`: the langauge of the BibleJS instance (default: `"en"`).

#### Return
- **BibleJS** The `BibleJS` instance.

### `get(reference, cb)`
This function gets the response providing the BibleJS `reference`.

#### Params

- **String** `reference`: The verse reference. It can be in the following formats:
 ```
 e.g. Genesis 1:1  - returns one verse
 or Genesis 1:1,2  - returns two verses (1 and 2)
 or Genesis 1:1-10 - returns the verses 1 - 10
 or Genesis 1      - returns the whole chapter
 ```
- **Function** `cb`: The cb function.

#### Return
- **BibleJS** The BibleJS instance (this).

### `search(query, cb)`
This function gets the verses that match to the regular expression
provided.

#### Params

- **String|RegExp** `query`: The string/regular expression that matches the searched verses.
- **Function** `cb`: The cb function

#### Return
- **BibleJS** The BibleJS instance (this)

