const fetch = require("node-fetch");

const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const cors = require("cors");

const path = require("path");

const dbpath = path.join(__dirname, "Hodlinfo.db");

const app = express();

app.use(cors());

app.use(express.json());

let db = null;

const init = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server is started");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

init();

let array = [];

const FetchMethod = async () => {
  const url = await fetch("https://api.wazirx.com/api/v2/tickers");

  const result = await url.json();

  for (let item in result) {
    if (array.length === 10) {
      tostore(array);
      break;
    } else {
      array.push(result[item]);
    }
  }
};

FetchMethod();

const tostore = async (data) => {
  for (let each of data) {
    const query = `INSERT INTO hodlinfo(name, last, buy, sell, volume, base_unit)
    VALUES('${each.name}',${each.last},${each.buy},${each.sell},${each.volume},'${each.base_unit}');
    `;
    const main = await db.run(query);
  }
};

app.get("/user/", async (request, response) => {
  const query = `SELECT distinct * FROM hodlinfo
  LIMIT 9
  ;`;
  const total = await db.all(query);

  response.send(total);
});

app.get("/getData/", async (request, response) => {
  await response.sendFile("./index.html", { root: __dirname });
});
