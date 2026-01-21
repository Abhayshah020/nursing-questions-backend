const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const userAuthentication = require("./auth.routes");
const questionsRoutes = require("./questions.routes");
const questionsGroupRoutes = require("./questionsgroup.routes");
const examSubmissionRoutes = require("./examSubmission.routes");
const uploadRoutes = require("./images.routes");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(helmet());
app.use(morgan("dev"));

app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors({
  origin: [
    "http://localhost:3000",
  ],
  credentials: true,
}));


app.use(express.json());


app.use("/api/uploads", uploadRoutes);

app.use("/api/authentication", userAuthentication);

app.use("/api/questions", questionsRoutes);
app.use("/api/group-questions", questionsGroupRoutes);
app.use("/api/exam-result", examSubmissionRoutes);


module.exports = app;