// Dependencies
const { minify } = require("terser");
const fs = require("fs-extra");
const htmlmin = require("html-minifier");

module.exports = function (eleventyConfig) {
  // Components
  eleventyConfig.addShortcode("Book", require("./src/_includes/book.js"));
  eleventyConfig.addShortcode("Icon", require("./src/_includes/icon.js"));

  // Filters
  eleventyConfig.addFilter("random", (arr) => {
    return arr[Math.floor(Math.random() * arr.length)].slug;
  });
  eleventyConfig.addFilter("related", (arr, authors, specific) => {
    let holder = [];
    authors.forEach((author) => {
      const result = arr.filter(
        (book) =>
          book.author.some((item) =>
            item.toLowerCase().includes(author.toLowerCase())
          ) && book.title !== specific
      );
      holder.push(result);
    });
    let cleaned = holder.flat();
    let unique = [...new Set(cleaned)];
    return unique;
  });
  eleventyConfig.addNunjucksAsyncFilter("jsmin", async (code, callback) => {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error("Terser error: ", err);
      callback(null, code);
    }
  });

  // Build stuff
  eleventyConfig.addPassthroughCopy({
    static: "/",
  });

  // 404 handling
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function (err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync("_site/404.html");
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content_404);
          res.end();
        });
      },
    },
  });

  // HTML minification
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });

  return {
    dir: {
      input: "src",
    },
  };
};
