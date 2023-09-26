import "./index.css";

const MostCoOccurredWords = (props) => {
  const { pairDetail } = props;
  return (
    <li className="word-item">
      <p className="word-info">{pairDetail.pair}</p>
      <p className="word-info">{pairDetail.frequency}</p>
    </li>
  );
};

export default MostCoOccurredWords;
