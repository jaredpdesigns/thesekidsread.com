const { EleventyServerless } = require("@11ty/eleventy");
require("./eleventy-bundler-modules.js");

async function handler(event) {
  let elev = new EleventyServerless("search", {
    path: event.path,
    query: event.queryStringParameters,
    inputDir: "src",
    functionsDir: "./netlify/functions/",
  });

  try {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
      },
      body: await elev.render(),
    };
  } catch (error) {
    if (elev.isServerlessUrl(event.path)) {
      console.log("Serverless Error:", error);
    }

    return {
      statusCode: error.httpStatusCode || 500,
      body: JSON.stringify(
        {
          error: error.message,
        },
        null,
        2
      ),
    };
  }
  admin.app().delete();
}

exports.handler = handler;
