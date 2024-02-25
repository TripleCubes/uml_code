# How to use the scripts
### NOTICE: I asked the Mini Jam's hosts for permissions to use the minijamofficial.com private api and to publish the datas. You should also ask for the permissions like I did

To scrap files, you will need NodeJS installed. You will also need [jsdom](https://www.npmjs.com/package/jsdom) module installed globally

If you dont scrap files, you dont need to install jsdom

> Scraping files took a long time, so there is a `_scraped_files` folder uploaded at [https://github.com/TripleCubes/uml](https://github.com/TripleCubes/uml) that you can download instead. The `_scraped_files` folder need to be placed inside the root folder of the project

First, `cd` to the `scripts/` folder

```
node scrap.js
```
This command request from minijamofficial.com private api and scrap itch.io for datas. This will take a long time so only do this once every two weeks, after jam voting is done

------
```
node scrap.js [max_mini_jam_id]
```
This will disable major jam scraping, and start scraping mini jam from [max_mini_jam_id] to mini jam 1

For example, Mini Jam 150: Magic have mini_jam_id == 150

This will also wont read from minijamofficial.com api and instead read the created `scripts/scrapped_files/jam_list/jam_list.json` file for jam list data. So only run this command when you already have `jam_list.json` created from previous scrap

This command is used for when you stopped the script mid scrap, so you can continue your scraping

------
```
node scrap_link.js [jam_link]
```
This command scrap only the [jam_link]

This command still read from minijamofficial.com api to create new `jam_list.json`

This command is used for, for example, when you already have every previous jams scraped, so you just scrap only the latest jam

> You would think you can scrap all jams once, and then every new jam you can just only scrap that new jam. But jammers change their itch.io usernames, and that kinda mess with the datas \
So what I do is 1 or 2 days before jam voting end, I scrap every jams. This will update all jammer's itch.io usernames. And then when jam voting end I scrap the finished jam

------
```
node data_create.js
```
This command generate the json files. The json files are used to generate the html files, but the leaderboard json files and the jammer_lookup.json are also used for the site's search page and jammer page

------
```
node html_create.js
```
This command generate the html files. The generated jam list and leaderboard html files are not indented. Other generated html files are indented

------
```
node html_create.js indent
```
The same as the command above, but with all generated html files indented

This command is really slow. Prefer the no indent command instead

------

To generate the json files, you need the scrapped files \
To generate the html files, you need the generated json files

After all files are generated, the page is up to date

# CREDITS
The ilscore part of Unofficial Mini Jam Leaderboard is written by [ilPrinni](https://github.com/iLays1)

# LICENSE
Unofficial Mini Jam Leaderboard is under the MIT license. Check [LICENSE](LICENSE) for full information

# THIRD PARTY LICENSES
## jsdom
MIT license

Copyright (c) 2010 Elijah Insua

The license file can be found here [third_party_licenses/jsdom/LICENSE.txt](third_party_licenses/jsdom/LICENSE.txt)
