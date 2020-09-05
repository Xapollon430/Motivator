const mongoose = require("mongoose");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

const deals = [];
const sets = [];

dotenv.config();

mongoose.set("useCreateIndex", true);

mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}`, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

let jwtTokenSchema = new mongoose.Schema({
  jwtToken: {
    type: String,
  },
  expireAt: {
    type: Date,
    default: Date.now(),
    expires: 10000,
  },
});

let accessTokenSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now(),
    expires: 3000,
  },
});

let AccessTokenModel = mongoose.model("accessToken", accessTokenSchema);
let jwtToken = mongoose.model("jwtToken", jwtTokenSchema);

const createAccessToken = async () => {
  let tokenResponse = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?grant_type=refresh_token&refresh_token=${process.env.REFRESH_TOKEN}&client_secret=${process.env.CLIENT_SECRET}&client_id=${process.env.CLIENT_ID}`,
    {
      method: "POST",
    }
  );
  let accessToken = await tokenResponse.json();

  let accessTokenFromDB = AccessTokenModel.create({
    accessToken: accessToken.access_token,
  });

  return accessTokenFromDB;
};

const getAccessToken = async () => {
  let accessTokenFromDB = await AccessTokenModel.findOne();
  if (accessTokenFromDB) {
    return accessTokenFromDB.accessToken;
  }

  let newCreatedAccessToken = await createAccessToken();
  return newCreatedAccessToken.accessToken;
};

const getSales = async () => {
  if (sets.length > 0 && deals.length > 0) {
    return {
      deals,
      sets,
    };
  }
  await createSales();

  return {
    deals,
    sets,
  };
};

const createSales = async () => {
  let accessToken = await getAccessToken();
  let dealsResponse1 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let dealsResponse2 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=2`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let dealsResponse3 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=3`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let dealsResponse4 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=4`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let dealsResponse5 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=5`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let dealsResponse6 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=6`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let dealsResponse7 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=7`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let dealsResponse8 = fetch(
    `https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=8`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  await Promise.all([
    dealsResponse1,
    dealsResponse2,
    dealsResponse3,
    dealsResponse4,
    dealsResponse5,
    dealsResponse6,
    dealsResponse7,
    dealsResponse8,
  ])
    .then((responses) => {
      return Promise.all(responses.map((r) => r.json()));
    })
    .then((responses) => {
      responses.map((r) => {
        deals.push(...r.data);
      });
    });

  let setsResponse1 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse2 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=2`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse3 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=3`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse4 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=4`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse5 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=5`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse6 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=6`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse7 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=7`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse8 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=8`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse9 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=9`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse10 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=10`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  await Promise.all([
    setsResponse1,
    setsResponse2,
    setsResponse3,
    setsResponse4,
    setsResponse5,
    setsResponse6,
    setsResponse7,
    setsResponse8,
    setsResponse9,
    setsResponse10,
  ])
    .then((responses) => {
      return Promise.all(responses.map((r) => r.json()));
    })
    .then((responses) => {
      responses.map((r) => {
        sets.push(...r.data);
      });
    });

  let setsResponse11 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=11`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  let setsResponse12 = fetch(
    `https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=12`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
    }
  );

  await Promise.all([setsResponse11, setsResponse12])
    .then((responses) => {
      return Promise.all(responses.map((r) => r.json()));
    })
    .then((responses) => {
      responses.map((r) => {
        sets.push(...r.data);
      });
    });

  return { deals, sets };
};

module.exports = {
  getAccessToken,
  jwtToken,
  getSales,
};
