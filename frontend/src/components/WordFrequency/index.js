import "./index.css";

const WordFrequency = (props) => {
  const { wordDetail } = props;
  return (
    <li className="word-item">
      <p className="word-info">{wordDetail.word}</p>
      <p className="word-info">{wordDetail.frequency}</p>
    </li>
  );
};

export default WordFrequency;
