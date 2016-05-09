# Whose Mastery is it Anyway?

"Whose Mastery is it Anyway?" is a real-time game for clubs & parties to help figure out why does that one friend have 100k mastery points on Swain anyway.

## Meta

The more you play with friends, the more you know how they play, know where they like to play and what they like to play. This game puts these skills to test, by taking champion mastery infromation for all of the players and generating hard hitting questions. How well do you know your premade? Time to find out.

(The game requires at least 2 players, though more are heavily reccomended for the increased confusion)

## Screenshots

## Requirements

* Node >=5 (6 untested, but probably will work), on windows hosts make sure [you've got the setup for native module compilation](https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules)
* Optional but reccomended: 
    * A database server. By default a sqlite database is created in `database/database.sqlite`  
      See suported databases from [knex documentation](http://knexjs.org/#Installation-node)

## Installation

* `git clone`
* `npm install`
    * Note: During installation it might mention that peerDependencies aren't satisfied. This is due to using webpack@2 (in beta), but it will work fine.
* copy `config/local.json.dist` to `config/local.json` and modify it with any changes you want to do  
  see other config files for inspiration
* If you want to use a different database than bundled sqlite, [check knex documentation for extra library to install](http://knexjs.org/#Installation-node) and configuration to use (just change database.options in your local.json)
* Run database migrations with `npm run migrate`

### Development mode

*Featuring live reloading and nodemon* 

* `npm run dev`

Open http://localhost:8080 (is a proxy to the server which will run on :8000)

### Production mode

*Featuring optimisations and versioning*

* Build the files with `npm run build`
* Run the server with `npm run start` or by calling `node build/start.js`

Runs on port specified in the port option of config

## Talk Nerdy To Me

### Stack

* Platform - `node.js`  
  As much as the package ecosystem is a mess of [pick me pick me pick me up](https://youtu.be/M3rg-rh6MPo "I would like to apologise for linking to.. that"), it is still the best way at the moment for real-time based web servers.
* "Framework" - [`feathers.js`](http://feathersjs.com/)  
  Well... It's more of a cluster of packages, but as far as I have searched it is definitely the faster way to make a real-time thing. Mainly because sails is practically dead. That only leaves making the whole thing yourself which too slow.  
  Must be noted, even though it's good for real-time, it's not realy optimal for user registration-less games and there's quite a lot of rough edges. But those problems can be overwritten by doing it yourself. Also there's the downside of no good economy spinning around it, so there's quite a few things I had to build first, but now I can re-use those ~~for evil~~.  
  * Job queue / Task Scheduler - Custom  
    All the generic packages are too specialised to a database, and there isn't one that natively integrates with feathers. So I read up on laravel source, and did a mini-port of it for feathers, taking advantage of the possibility to watch for update events, practically guaranteeing on-time calling.
* Communication with league API - Custom  
  After taking a quick look around the thread in developer forums for node.js libraries for league API, quickly determined that need to roll my own cause either they were missing in rate limiting (or don't keep track per-region) or doesn't have good caching.  
  
  So yeah this has both.
* Frontend - [`vue.js`](http://vuejs.org/)  
  It has that laravel-like simplicity yet power to it. Also it's documentation is actually readable without having to cross-reference over many different pages (*looking at you, ember*)
* Frontend style - [`Bulma`](http://vuejs.org/) / [Material Colors](https://www.google.com/design/spec/style/color.html) / [`motion-ui`](http://zurb.com/playground/motion-ui) / Custom  
  Honestly it's just a frankenstein's monster of kinda-libraries and flexbox.
* Frontend tooling - [`Webpack & friends`](https://webpack.github.io/)
  Lady in the streets, (ph/)freak in the sheets.  
  Production build gets compiled, minified and versioned based on content hash. And different pages are split out to chunks to load on-demand.  
  In development, it (w/ help from vue) auto-reloads modified files on save. SOOOO NICE.

### Skeletons in the clost

Due to time limits (and the workload that just the real-time infrastructure needed), there are quite a bit of unpolished corners.

* Loss of session over refreshes
* No clearing of session once done / logging out of user
* Not a lot of variety in the types of questions
* Lack of filtering what events to send out to what sockets.
