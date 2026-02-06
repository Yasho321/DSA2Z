import axios from "axios";
export const getLanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    JAVA: 62,
    CPP: 54,
  };

  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_BASE_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    },
    {
      headers: { Authorization: `Bearer ${process.env.JUDGE0_API_KEY}` , "X-Auth-Token": process.env.JUDGE0_API_KEY, },
    },
  );

  return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResult = async (tokens) => {
  while (true) {
    console.log("Tokens", tokens);
    console.log("Api key", process.env.JUDGE0_API_KEY);
    const { data } = await axios.get(
      `${process.env.JUDGE0_BASE_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
        headers: {
          Authorization: `Bearer ${process.env.JUDGE0_API_KEY}`,
          "X-Auth-Token": process.env.JUDGE0_API_KEY,
        },
      },
    );

    console.log("Data", data);

    const results = data.submissions;
    console.log("Results", results);

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2,
    );
    if (isAllDone) {
      return results;
    }
    await sleep(1000);
  }
};

export const getLanguageName = (languageid) => {
  const languageNames = {
    71: "PYTHON",
    63: "JAVASCRIPT",
    62: "JAVA",
    54: "CPP",
  };

  return languageNames[languageid];
};
