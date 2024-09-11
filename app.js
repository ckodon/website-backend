const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

let origin;
if (process.env.NODE_ENV !== "PRODUCTION") {
  origin = "http://localhost:3000";
} else {
  origin = "https://www.ckodon.com/";
}
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./.env",
  });
}



const Story = require("./controllers/story");


app.use("/api/v1/stories", Story);

app.use(ErrorHandler);
module.exports = app;
