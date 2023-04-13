import { useState } from "react";
import { flushSync } from "react-dom";
import "./App.css";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

function App() {
  const [text, setText] = useState("Type here !!");
  const [istextArea, setIsTextArea] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isOutput, setIsOutput] = useState(false);
  const [outputData, setOutputData] = useState("");
  const [summaryData, setSummaryData] = useState("");
  const [rephrasedData, setRephrasedData] = useState("");
  const [quizData, setQuizData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const start = () => {
    flushSync(() => {
      setIsStarted(true);
    });

    const element = document.getElementById("input-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const createTextarea = () => {
    flushSync(() => {
      setIsTextArea(true);
      setIsOutput(true);
    });

    const element = document.getElementById("input-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  const textAreaChanged = (e) => {
    setText(e.target.value);
  };

  const getoutputs = async () => {
    setIsLoading(true);
    await axios
      .post(
        "http://127.0.0.1:8080/api/text/summarize",

        {
          text: text,
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        flushSync(() => {
          setSummaryData(res.data);
        });
        const element = document.getElementById("output-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((e) => console.log(e));
    await axios
      .post(
        "http://127.0.0.1:8080/api/text/rephrase",

        {
          text: text,
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        flushSync(() => {
          setRephrasedData(res.data);
        });
        const element = document.getElementById("output-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((e) => console.log(e));
    await axios
      .post(
        "http://127.0.0.1:8080/api/text/quiz",

        {
          text: text,
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        flushSync(() => {
          setQuizData(res.data);
        });
        const element = document.getElementById("output-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((e) => console.log(e));
    setIsLoading(false);
  };

  const createSummaryTextarea = () => {
    setOutputData(summaryData);
  };
  const createRephrasedTextarea = () => {
    setOutputData(rephrasedData);
  };
  const createQuizTextarea = () => {
    setOutputData(quizData);
  };
  return (
    <div className="App">
      <div className="started_page">
        <img src="img/v1_9.png" alt="My Image" className="img_title" />
        <div className="landing_bubble_container">
          <div className="landing_bubble">
            <img src="img/v1_9.png" alt="myImage" className="img_bubble" />
            <div className="get_started_bubble">
              <button className="get_started" onClick={start}>
                Get Started!
              </button>
            </div>
            <h1 className="txt_bubble txt_bubble_summarize">summarize,</h1>
            <h1 className="txt_bubble txt_bubble_paraphrase">paraphrase,</h1>
            <h1 className="quiz">quiz!</h1>
          </div>
        </div>
      </div>
      {isStarted && (
        <div className="default-background" id="input-section">
          <h1 className="choose_input">Choose an input type:</h1>
          <div className="button-wrapper">
            <button onClick={createTextarea} className="button left">
              TEXT
            </button>
            <button onClick={createTextarea} className="button center">
              LINK
            </button>
            <button onClick={createTextarea} className="button right">
              PDF
            </button>
          </div>
          <div className="InputContainer">
            {istextArea && (
              <textarea
                rows="20"
                className="InputTextarea"
                onChange={textAreaChanged}
                value={text}
              ></textarea>
            )}
            <br />
          </div>
        </div>
      )}
      {isOutput && (
        <div className="back_2">
          <button onClick={getoutputs} className="button_outputs button">
            Get Outputs
          </button>
        </div>
      )}

      {(summaryData || rephrasedData || quizData) && (
        <div className="ouput_section" id="output-section">
          <h1 className="view_output">View your outputs:</h1>
          <div className="button-wrapper">
            <button
              onClick={createSummaryTextarea}
              className="button_type_output "
            >
              SUMMARY
            </button>
            <button
              onClick={createRephrasedTextarea}
              className="button_type_output "
            >
              REPHRASED
            </button>
            <button
              onClick={createQuizTextarea}
              className="button_type_output "
            >
              QUIZ
            </button>
          </div>
          <div className="OutputContainer">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <textarea
                rows="10"
                className="OutputTextarea"
                onChange={textAreaChanged}
                value={outputData}
                readOnly
              ></textarea>
            )}

            <br />
          </div>
          <div className="download_section">
            <button className="download_btn">DOWNLOAD</button>
            <button className="download_btn">DOWNLOAD ALL</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
