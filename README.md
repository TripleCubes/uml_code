# This repo is the old version of Unofficial Mini Jam Leaderboard
Check out the new version. It is located at https://github.com/TripleCubes/uml

You will notice that the url of the new version is the same url as the github pages repo for the old unofficial leaderboard. From now on that url will be for the new unofficial leaderboard's source code and github pages repo

**IMPORTANT:** Aside from this notice, I have not updated anything else in this repo, including the text of this README. So all the README stuff you see after this notice, consider them outdated

An archive of the old unofficial leaderboard is available at https://triplecubes.github.io/uml_legacy, and ofcourse, we have this repo that host the old unofficial leaderboard source code as well

---------------------------------------------------------

# Api usage
minijamofficial.com: I asked the Mini Jam's hosts for permissions to use the minijamofficial.com private api and to publish the datas. Before using the scripts you should also ask for the permissions like I did

itch.io's entries.json: Leafo said it is fine to use the API. https://itch.io/t/1487695/solved-any-api-to-fetch-jam-entries

# Requirements
You will need NodeJS installed. You will also need [jsdom](https://www.npmjs.com/package/jsdom) module installed globally

If you dont scrap files, you dont need to install jsdom

To install jsdom globally, use

```
npm install jsdom -g
```

You will also need to [setup your `NODE_PATH`](https://stackoverflow.com/questions/7970793/how-do-i-import-global-modules-in-node-i-get-error-cannot-find-module-module). The link gave linux instruction, for Windows google "How to add environment variables Windows"

# Commands
There are 3 commands:

```
node scrap.js
node data_create.js
node html_create.js
```

To use them, first cd into the `scripts/` folder

You can get the command's usage and agruments by using

```
node [file_name] ?
```

I recommend doing so for all 3 commands to see what they do

# How updating the page work

This repository only contain the source code for Unofficial MiniJam Leaderboard. The actual github pages repo is at https://github.com/TripleCubes/uml

The workflow is, you scrap files, and then generate data files, and then you generate html files

To generate the json files, you need the scrapped files \
To generate the html files, you need the generated json files

After all files are generated, copy the `docs/` and `_scraped_files/` folders to https://github.com/TripleCubes/uml, and then commit and push the changes

## Scraped jams wont get rescraped
All the scraped files are saved in `_scraped_files/` folder

The scraped jams wont get rescraped, unless a game in the jam change its name or url

If you dont already have the `_scraped_files/` folder, the first scrap can take really long time, since all jams need to be scraped. In that case there is a `_scraped_files/` folder that you can download in https://github.com/TripleCubes/uml that is up to date with the latest MiniJam/MajorJam

# CREDITS
The ilscore part of Unofficial Mini Jam Leaderboard is written by [ilPrinni](https://github.com/iLays1)

# LICENSE
Unofficial Mini Jam Leaderboard is under the MIT license. Check [LICENSE](LICENSE) for full information

# THIRD PARTY LICENSES
## jsdom
MIT license

Copyright (c) 2010 Elijah Insua

The license file can be found here [third_party_licenses/jsdom/LICENSE.txt](third_party_licenses/jsdom/LICENSE.txt)
