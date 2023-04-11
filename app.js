const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running..!");
    });
  } catch (e) {
    console.log(`DB error '${e.message}'`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Player Match Scores
// Given two files app.js and a database file cricketMatchDetails.db consisting of three tables player_details, match_details and player_match_score.

// Write APIs to perform operations on the tables player_details, match_details and player_match_score containing the following columns,

// Player Details Table

// Column	Type
// player_id	INTEGER
// player_name	TEXT
// Match Details Table

// Column	Type
// match_id	INTEGER
// match	TEXT
// year	INTEGER
// Player Match Score Table

// Column	Type
// player_match_id	INTEGER
// player_id	INTEGER
// match_id	INTEGER
// score	INTEGER
// fours	INTEGER
// sixes	INTEGER
// API 1
// Path: /players/
// Method: GET
// Description:
// Returns a list of all the players in the player table

// Response
// [
//   {
//     playerId: 1,
//     playerName: "Ram"
//   },

app.get("/players/", async (request, response) => {
  const allPlayersDbQuery = `select * from player_details;`;
  const playersArray = await db.all(allPlayersDbQuery);
  response.send(
    playersArray.map((each) => {
      return {
        playerId: each.player_id,
        playerName: each.player_name,
      };
    })
  );
});

//   ...
// ]
// API 2
// Path: /players/:playerId/
// Method: GET
// Description:
// Returns a specific player based on the player ID

// Response
// {
//   playerId: 2,
//   playerName: "Joseph"
// }

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const selectDBQuery = `select * from player_details
    where player_id = '${playerId}';`;
  const playerDetails = await db.get(selectDBQuery);
  response.send({
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
  });
});
// API 3
// Path: /players/:playerId/
// Method: PUT
// Description:
// Updates the details of a specific player based on the player ID

// Request
// {
//   "playerName": "Raju"
// }
// Response
// Player Details Updated

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateDBQuery = `update player_details set 
    player_name = '${playerName}' where player_id = '${playerId}';`;
  await db.run(updateDBQuery);
  response.send("Player Details Updated");
});
// API 4
// Path: /matches/:matchId/
// Method: GET
// Description:
// Returns the match details of a specific match

// Response
// {
//   matchId: 18,
//   match: "RR vs SRH",
//   year: 2011
// }
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const selectDBQuery = `select * from match_details where 
    match_id = '${matchId}';`;
  const matchDetails = await db.get(selectDBQuery);
  response.send({
    matchId: matchDetails.match_id,
    match: matchDetails.match,
    year: matchDetails.year,
  });
});

// API 5
// Path: /players/:playerId/matches
// Method: GET
// Description:
// Returns a list of all the matches of a player

// Response
// [
//   {
//     matchId: 1,
//     match: "SRH vs MI",
//     year: 2016
//   },

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `select b.* from  player_match_score a inner join 
  match_details b  on a.match_id = b.match_id where
    a.player_id = '${playerId}';`;
  const matchDetails = await db.all(dbQuery);
  response.send(
    matchDetails.map((each) => {
      return {
        matchId: each.match_id,
        match: each.match,
        year: each.year,
      };
    })
  );
});

// API 6
// Path: /matches/:matchId/players
// Method: GET
// Description:
// Returns a list of players of a specific match

// Response
// [
//   {
//     playerId: 2,
//     playerName: "Joseph"
//   },
//   ...
// ]

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const dbQuery = `select a.* from player_details a inner join player_match_score b 
    on a.player_id = b.player_id where b.match_id = '${matchId}';`;
  const playerDetails = await db.all(dbQuery);
  response.send(
    playerDetails.map((each) => {
      return {
        playerId: each.player_id,
        playerName: each.player_name,
      };
    })
  );
});
// API 7
// Path: /players/:playerId/playerScores
// Method: GET
// Description:
// Returns the statistics of the total score, fours, sixes of a specific player based on the player ID

// Response
// {
//   playerId: 1,
//   playerName: "Ram"
//   totalScore: 3453,
//   totalFours: 342,
//   totalSixes: 98
// }

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const dbQuery = `select a.player_id as playerId,
    a.player_name as playerName,
    sum(b.score) as totalScore,
    sum(b.fours) as totalFours,
    sum(b.sixes) as totalSixes from player_details a
    inner join player_match_score b on a.player_id = b.player_id 
    where b.player_id = '${playerId}' group by playerId;`;
  const playerScore = await db.get(dbQuery);
  response.send(playerScore);
});

// Use npm install to install the packages.

// Export the express instance using the default export syntax.
module.exports = app;

// Use Common JS module syntax.
