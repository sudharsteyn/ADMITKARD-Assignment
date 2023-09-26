import { useState } from "react";
import MostOccurredWords from "../MostOccurreedWords";
import MostCoOccurredWords from "../MostCoOccurredWords";
import WordFrequency from "../WordFrequency";
import { MagnifyingGlass, ProgressBar } from "react-loader-spinner";

import { FaCloudUploadAlt } from "react-icons/fa";

import "./index.css";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const TextAnalyser = () => {
  const [textFile, setTextFile] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [fileName, setFileName] = useState("No file chosen");
  const [searchResultData, setSearchResultData] = useState({
    apiStatus: apiStatusConstants.initial,
    resultData: {},
  });
  const [analyzedData, setAnalyzedData] = useState({
    mostOccurredWords: [],
    mostCoOccurredWords: [],
    wordFrequency: [],
    apiStatus: apiStatusConstants.initial,
    errorMsg: "",
    showError: false,
  });

  const checkIsFileExist = () => {
    if (!textFile) {
      setAnalyzedData({
        ...analyzedData,
        errorMsg: "Please select a file",
        showError: true,
      });
    }
  };

  const changeFile = (event) => {
    setSearchInput("");
    setSearchResultData({
      ...searchResultData,
      apiStatus: apiStatusConstants.initial,
    });
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size < 5 * 1024 * 1024 && file.name.endsWith(".txt")) {
        setTextFile(file);
        setFileName(file.name);
        setAnalyzedData({
          ...analyzedData,
          showError: false,
          apiStatus: apiStatusConstants.initial,
        });
      } else {
        const errorMsg =
          "File format should be .txt & File size exceeds 5MB limit.";
        setAnalyzedData({
          ...analyzedData,
          showError: true,
          errorMsg,
          apiStatus: apiStatusConstants.initial,
        });
        setFileName("No file chosen");
        setTextFile(null);
        event.target.value = "";
      }
    } else {
      const errorMsg = "Please select a file";
      setAnalyzedData({
        ...analyzedData,
        showError: true,
        errorMsg,
        apiStatus: apiStatusConstants.initial,
      });
      setFileName("No file chosen");
    }
  };

  const uploadFailed = (errorMsg) => {
    setAnalyzedData({
      ...analyzedData,
      apiStatus: apiStatusConstants.failure,
      errorMsg,
      showError: true,
    });
  };

  const uploadFile = async (event) => {
    event.preventDefault();
    setAnalyzedData({
      ...analyzedData,
      apiStatus: apiStatusConstants.inProgress,
    });
    if (textFile) {
      const formData = new FormData();
      formData.append("file", textFile);

      try {
        const url = "https://text-analyser-7ij2.onrender.com/upload/";
        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          setAnalyzedData({
            ...analyzedData,
            mostOccurredWords:
              data.frequency_and_occurrence_words.top_5_mostly_occurred_words,
            mostCoOccurredWords:
              data.frequency_and_occurrence_words
                .top_5_mostly_co_occurred_words,
            wordFrequency:
              data.frequency_and_occurrence_words.frequency_of_each_word,
            apiStatus: apiStatusConstants.success,
            showError: false,
          });
        } else {
          uploadFailed(data.error_msg);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const findSearchWordOccurrence = async () => {
    setSearchResultData({
      ...searchResultData,
      apiStatus: apiStatusConstants.inProgress,
    });
    if (textFile) {
      const formData = new FormData();
      formData.append("file", textFile);
      formData.append("searchWord", searchInput);

      try {
        const url = "https://text-analyser-7ij2.onrender.com/search/";
        const response = await fetch(url, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          setSearchResultData({
            apiStatus: apiStatusConstants.success,
            resultData: data,
          });
        } else {
          setSearchResultData({
            ...searchResultData,
            apiStatus: apiStatusConstants.failure,
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const onChangeSearch = (event) => {
    setSearchInput(event.target.value);
  };

  const submitSearch = (event) => {
    if (event.key === "Enter") {
      if (searchInput.length > 0) {
        findSearchWordOccurrence();
      }
    }
  };

  const searchResultSuccessView = () => {
    return (
      <div className="search-result-container">
        <p className="search-result-word">{searchResultData.resultData.word}</p>
        <hr className="separator" />
        <p className="search-result-occurrence">
          {`${searchResultData.resultData.occrrences} times appears in the paragraph`}
        </p>
      </div>
    );
  };

  const searchResultFailureView = () => {
    return (
      <div>
        <p>Failed to search</p>
      </div>
    );
  };

  const searchResultLoadingView = () => {
    return (
      <div>
        <ProgressBar
          height="100"
          width="100"
          ariaLabel="progress-bar-loading"
          wrapperStyle={{}}
          wrapperClass="progress-bar-wrapper"
          borderColor="#51E5FF"
          barColor="#51E5FF"
        />
      </div>
    );
  };

  const searchResult = () => {
    switch (searchResultData.apiStatus) {
      case apiStatusConstants.success:
        return searchResultSuccessView();
      case apiStatusConstants.failure:
        return searchResultFailureView();
      case apiStatusConstants.inProgress:
        return searchResultLoadingView();
      default:
        return null;
    }
  };

  const successView = () => {
    const { mostOccurredWords, mostCoOccurredWords, wordFrequency } =
      analyzedData;
    return (
      <>
        <div className="search-input-container">
          <input
            className="search-input"
            type="search"
            value={searchInput}
            placeholder="Search word"
            onChange={onChangeSearch}
            onKeyDown={submitSearch}
          />
          <button onClick={findSearchWordOccurrence} type="button">
            Search
          </button>
        </div>
        {searchResult()}
        <div className="text-analyser-container">
          <div className="section-container">
            <h1 className="section-heading">Top 5 mostly occurred words</h1>
            <hr className="separator" />
            <div className="column-heading-container">
              <p className="column-heading">WORD</p>
              <hr className="separator" />
              <p className="column-heading">FREQUENCY</p>
            </div>
            <hr className="separator" />
            <ul className="word-item-list">
              {mostOccurredWords.map((eachWord, e) => (
                <MostOccurredWords key={e} wordDetail={eachWord} />
              ))}
            </ul>
          </div>
          <div className="section-container">
            <h1 className="section-heading">Top 5 mostly co-occurred words</h1>
            <hr className="separator" />
            <div className="column-heading-container">
              <p className="column-heading">PAIR</p>
              <hr className="separator" />
              <p className="column-heading">FREQUENCY</p>
            </div>
            <hr className="separator" />
            <ul className="word-item-list">
              {mostCoOccurredWords.map((eachPair, e) => (
                <MostCoOccurredWords key={e} pairDetail={eachPair} />
              ))}
            </ul>
          </div>
          <div className="section-container">
            <h1 className="section-heading">Frequency of each word</h1>
            <hr className="separator" />
            <div className="column-heading-container">
              <p className="column-heading">WORD</p>
              <hr className="separator" />
              <p className="column-heading">FREQUENCY</p>
            </div>
            <hr className="separator" />
            <ul className="word-item-list">
              {wordFrequency.map((eachWord, e) => (
                <WordFrequency key={e} wordDetail={eachWord} />
              ))}
            </ul>
          </div>
        </div>
      </>
    );
  };

  const failureView = () => {
    return (
      <div>
        <p></p>
      </div>
    );
  };

  const loadingView = () => {
    return (
      <div className="main-loading-container">
        <MagnifyingGlass height={100} width={100} />
      </div>
    );
  };

  const renderApiStatus = () => {
    switch (analyzedData.apiStatus) {
      case apiStatusConstants.success:
        return successView();
      case apiStatusConstants.failure:
        return failureView();
      case apiStatusConstants.inProgress:
        return loadingView();
      default:
        return null;
    }
  };

  return (
    <div className="home-section">
      <h1 className="app-heading">Text analyser and Search</h1>
      <form className="upload-form" onSubmit={uploadFile}>
        <label className="input-label" htmlFor="fileInput">
          Choose a .txt file (up to 5MB)
        </label>
        <input
          className="file-input"
          type="file"
          id="fileInput"
          name="uploadFile"
          accept=".txt"
          onChange={changeFile}
          required
        />
        <label className="custom-upload" htmlFor="fileInput">
          <FaCloudUploadAlt />
          &#160; Choose File
        </label>
        <label className="selected-file-name" htmlFor="fileInput">
          {fileName}
        </label>
        <button className="upload-btn" type="submit" onClick={checkIsFileExist}>
          Upload
        </button>
        {analyzedData.showError && (
          <p className="error-msg">*{analyzedData.errorMsg}</p>
        )}
      </form>
      {renderApiStatus()}
    </div>
  );
};

export default TextAnalyser;
