const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const http = require("http");
const app = express();
var path = require("path");
const fs = require("fs");
var axios = require("axios");
const redis = require("redis");
const redisClient = redis.createClient();

const cors = require("cors");
const uuid = require("uuid");
app.use(cors());

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
redisClient.connect().then(() => {
  console.log("Connected!");
});

// Construct a schema, using GraphQL schema language
// getTopTenBinnedPosts() : [ImagePost]
const typeDefs = gql`
  type Query {
    unsplashImages(pageNum: Int): [ImagePost]
    userPostedImages: [ImagePost]
    binnedImages: [ImagePost]
    getTopTenBinnedPosts: [ImagePost]
  }
  type ImagePost {
    id: ID!
    url: String!
    posterName: String!
    description: String
    userPosted: Boolean!
    binned: Boolean!
    numBinned: Int!
  }
  type Mutation {
    updateImage(
      id: ID!
      url: String
      posterName: String
      description: String
      userPosted: Boolean
      binned: Boolean
      numBinned: Int
    ): ImagePost

    uploadImage(
      url: String!
      description: String
      posterName: String
    ): ImagePost

    deleteImage(id: ID!): ImagePost
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    getTopTenBinnedPosts: async () => {
      let returnData = [];

      const members = await redisClient.zRangeByScoreWithScores(
        "binned_images",
        -Infinity,
        Infinity
      );
      //async function(err,members){
      console.log(members);
      var revMem = members.reverse();

      console.log(revMem);
      if (revMem.length != 0) {
        for (var i = 0; i < Math.min(10, revMem.length); i++) {
          console.log(revMem[i].value);
          const jsonImageFromRedis = await redisClient.get(revMem[i].value);
          const recomposedImage = JSON.parse(jsonImageFromRedis);
          returnData.push(recomposedImage);
        }
        return returnData;
      }
      return returnData;
    },

    userPostedImages: async () => {
      let returnData = [];
      const data = await redisClient.lRange("photos_list", 0, -1);
      console.log("userPostedImages", data);
      if (data.length != 0) {
        for (let d of data) {
          const jsonImageFromRedis = await redisClient.get(d);
          const recomposedImage = JSON.parse(jsonImageFromRedis);
          returnData.push(recomposedImage);
        }
      }
      return returnData;
    },

    unsplashImages: async (_, args) => {
      let returnData = [];
      let imageData = {};

      try {
        const { data } = await axios.get(
          "https://api.unsplash.com/photos?page=" +
            args.pageNum +
            "&client_id=o4x-EHJvCLBK0Dus0_EXg1HGHRBQNleUpl00U2EqdWo"
        );

        let existBin;
        for (let arr of data) {
          imageData.id = arr.id;
          imageData.url = arr.urls.thumb;
          imageData.numBinned = arr.likes;
          imageData.posterName = arr.user.name ? arr.user.name : "";
          imageData.description = arr.description
            ? arr.description
            : arr.alt_description;
          imageData.userPosted = false;

          console.log(arr.id);
          existBin = await redisClient.get(arr.id);
          if (existBin) imageData.binned = true;
          else imageData.binned = false;
          returnData.push(imageData);
          imageData = {};
        }
      } catch (err) {
        console.log(err);
        return null;
      }

      return returnData;
    },

    binnedImages: async () => {
      let returnData = [];

      const members = await redisClient.zRangeByScoreWithScores(
        "binned_images",
        -Infinity,
        Infinity
      );
      //async function(err,members){

      if (members.length != 0) {
        for (let a of members) {
          const jsonImageFromRedis = await redisClient.get(a.value);

          const recomposedImage = JSON.parse(jsonImageFromRedis);
          returnData.push(recomposedImage);
          console.log(returnData.length);
        }
      }

      return returnData;
    },
  },
  Mutation: {
    async uploadImage(_, args) {
      const redisId = uuid.v4();
      const newImage = {
        id: redisId,
        url: args.url,
        posterName: args.posterName,
        description: args.description,
        userPosted: true,
        binned: false,
        numBinned: 0,
      };

      await redisClient.rPush("photos_list", redisId);

      const jsonBio = JSON.stringify(newImage);
      await redisClient.set(redisId, jsonBio);
      const jsonImageFromRedis = await redisClient.get(redisId);
      const recomposedImage = JSON.parse(jsonImageFromRedis);

      return recomposedImage;
    },

    async updateImage(_, args) {
      var redisId = await args.id;
      console.log("binned", args.binned);
      if (args.binned) {
        const newImage = {
          id: redisId,
          url: args.url,
          posterName: args.posterName,
          description: args.description,
          userPosted: args.userPosted,
          binned: args.binned,
          numBinned: args.numBinned,
        };

        await redisClient.zAdd("binned_images", {
          score: args.numBinned,
          value: redisId,
        });

        await redisClient.del(redisId);
        const jsonBio = JSON.stringify(newImage);
        await redisClient.set(redisId, jsonBio);
        const jsonImageFromRedis = await redisClient.get(redisId);
        const recomposedImage = JSON.parse(jsonImageFromRedis);

        return recomposedImage;
      } else {
        await redisClient.zRem("binned_images", redisId);
        await redisClient.del(redisId);

        const jsonImageFromRedis = await redisClient.get(redisId);

        const recomposedImage = JSON.parse(jsonImageFromRedis);

        return recomposedImage;
      }
    },

    async deleteImage(_, args) {
      let redisId = args.id;

      //redisClient.zrem("binned_images", redisId);
      await redisClient.del(redisId);

      const jsonImageFromRedis = await redisClient.get(redisId);
      const recomposedImage = JSON.parse(jsonImageFromRedis);
      return recomposedImage;
    },
  },
};

let apolloServer = null;
async function startServer() {
  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
}
startServer();
const httpserver = http.createServer(app);

app.get("/", function (req, res) {
  res.json({ data: "server is running" });
});

app.listen(4000, function () {
  console.log(`server running on port 4000`);
  console.log(`gql path is ${apolloServer.graphqlPath}`);
});

//await
// redisClient.sadd(
//   ["photos_list", "ReactJS", "Angular", "Svelte", "VueJS", "VueJS"],
//   function (err, reply) {
//     console.log(reply); // 4
//   }
// );
