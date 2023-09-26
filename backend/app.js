const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

const findFrequencyAndOccurrence = (text) => {
  const words = text.toLowerCase().match(/\w+/g);
  const wordFrequency = {};
  const frequencyAndOccrrence = {
    top_5_mostly_occurred_words: [],
    top_5_mostly_co_occurred_words: [],
    frequency_of_each_word: [],
  };

  words.forEach((word) => {
    if (wordFrequency[word]) {
      wordFrequency[word]++;
    } else {
      wordFrequency[word] = 1;
    }
  });

  const sortedWords = Object.entries(wordFrequency).sort((a, b) => b[1] - a[1]);

  sortedWords.forEach(([word, frequency], index) => {
    frequencyAndOccrrence.frequency_of_each_word.push({ word, frequency });
  });

  const top5Words = sortedWords.slice(0, 5);

  const wordPairs = {};
  for (let i = 0; i < words.length - 1; i++) {
    const pair = words[i] + " " + words[i + 1];
    if (wordPairs[pair]) {
      wordPairs[pair]++;
    } else {
      wordPairs[pair] = 1;
    }
  }

  const sortedPairs = Object.entries(wordPairs).sort((a, b) => b[1] - a[1]);

  const top5Pairs = sortedPairs.slice(0, 5);

  top5Words.forEach(([word, frequency], index) => {
    frequencyAndOccrrence.top_5_mostly_occurred_words.push({ word, frequency });
  });

  top5Pairs.forEach(([pair, frequency], index) => {
    frequencyAndOccrrence.top_5_mostly_co_occurred_words.push({
      pair,
      frequency,
    });
  });

  return frequencyAndOccrrence;
};

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error_msg: "No file uploaded." });
  }

  const fileContent = req.file.buffer.toString("utf8");

  if (fileContent.length <= 0) {
    return res.status(400).send({
      error_msg: "The provided file is empty. Please upload a file with text.",
    });
  }

  res.send({
    frequency_and_occurrence_words: findFrequencyAndOccurrence(fileContent),
  });
});

const findWordOccurrences = (paragraph, searchText) => {
  let count = 0;

  const regex = new RegExp(`\\b${searchText}\\b`, "gi");

  const matches = paragraph.match(regex);
  if (matches) {
    count = matches.length;
  }

  return { word: searchText, occrrences: count };
};

app.post("/search", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error_msg: "No file uploaded." });
  }

  const { searchWord } = req.body;

  const fileContent = req.file.buffer.toString("utf8");

  res.send(findWordOccurrences(fileContent, searchWord));
});

app.listen(3004, () => {
  console.log("server is running");
});
