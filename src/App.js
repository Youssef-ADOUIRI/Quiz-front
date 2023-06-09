import { useState } from "react";
import { flushSync } from "react-dom";
import "./App.css";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";
import jsPDF from "jspdf";

function downloadPDF(text, txt_type) {
  // create a new jsPDF instance
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // detect if text is Tamil
  const isTamil = /[\u0B80-\u0BFF]/.test(text);

  const fontStyle = "normal";
  const encoding = isTamil ? "Identity-H" : "StandardEncoding";
  const fontSize = 12;

  // Add heading
  doc.setFontSize(16);
  doc.text(txt_type.toUpperCase(), 10, 10);

  if (isTamil) {
    // Load the Tamil font from file
    doc.addFont("Latha.ttf", "Latha", "normal", encoding);
    doc.setFont("Latha");
    doc.setLanguage("ta");
  } else {
    // Set the font to Times
    doc.setFont("times", fontStyle);
  }

  // Add text
  doc.setLineWidth(0.5);
  doc.setLineHeightFactor(1.2);
  doc.setFontSize(fontSize);
  const splitText = doc.splitTextToSize(text, doc.internal.pageSize.width - 20);
  let cursorY = 20; // set initial y position
  splitText.forEach((line) => {
    if (cursorY > 280) {
      // check if the cursor is at the end of the page
      doc.addPage(); // add new page
      cursorY = 20; // reset y position
    }

    doc.text(line, 10, cursorY); // add line of text
    cursorY += fontSize * doc.getLineHeightFactor(); // increase y position by line height
  });

  // save the PDF document
  doc.save(txt_type + ".pdf");
}

function App() {
  const [text, setText] = useState("Type here !!");
  const [istextArea, setIsTextArea] = useState(false);
  const [isLinkInput, setIsLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [isPdfInput, setIsPdfInput] = useState(false);
  const [pdfInput, setPdfInput] = useState();
  const [isOutputClicked, setIsPdfOutput] = useState(false);
  const [pdfName, setPdfName] = useState("Select a PDF");
  const [isStarted, setIsStarted] = useState(false);
  const [isOutput, setIsOutput] = useState(false);
  const [outputData, setOutputData] = useState("");
  const [summaryData, setSummaryData] = useState("");
  const [rephrasedData, setRephrasedData] = useState("");
  const [quizData, setQuizData] = useState("");
  const [funcSelect, setFuncSelect] = useState("summary");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isRephraseLoading, setIsRephraseLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  // const [errSummary, setErrSummary] = useState("");
  // const [errRephrase, setErrRephrase] = useState("");
  // const [errQuiz, setErrQuiz] = useState("");
  // const [errEmpty, setErrEmpty] = useState("");
  const [err, setErr] = useState("");

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
      setIsPdfInput(false);
      setIsLinkInput(false);
      setIsTextArea(true);
      setText("Type Here !!");
      setIsOutput(true);
    });

    const element = document.getElementById("input-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const createLinkInput = () => {
    setIsTextArea(false);
    setIsPdfInput(false);
    setIsOutput(false);
    setIsLinkInput(true);
  };
  const onChangeLink = (e) => {
    setLinkInput(e.target.value);
  };
  const onGiveLink = async () => {
    await axios
      .post(
        "api/linktotext",
        {
          link: linkInput,
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((res) => {
        setText(res.data);
        setIsTextArea(true);
        setIsOutput(true);
      })
      .catch((e) => console.log(e));
  };
  const createPdfInput = () => {
    setIsTextArea(false);
    setIsLinkInput(false);
    setIsOutput(false);
    setIsPdfInput(true);
  };
  const onPdfChange = (e) => {
    e.preventDefault();
    setPdfInput(e.target.files[0]);
    setPdfName(e.target.files[0] ? e.target.files[0].name : "Select a PDF");
  };
  const onGivePdf = async () => {
    const formData = new FormData();
    if (pdfInput) {
      formData.append("pdfFile", pdfInput, pdfInput.name);
      await axios
        .put("api/pdftotext", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          setText(res.data);
          setIsTextArea(true);
          setIsOutput(true);
        });
    }
  };

  const textAreaChanged = (e) => {
    setText(e.target.value);
  };

  const getoutputs = async () => {
    setErr("");
    setSummaryData("");
    setRephrasedData("");
    setQuizData("");

    setIsSummaryLoading(true);
    setIsRephraseLoading(true);
    setIsQuizLoading(true);
    setIsPdfOutput(true);
    if (!text) {
      setErr("Empty Text !!");
    } else {
      await axios
        .post(
          "api/text/summarize",

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
            setIsSummaryLoading(false);
            setSummaryData(res.data);
            setFuncSelect("summary");
            setOutputData(res.data);
          });
          const element = document.getElementById("output-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        })
        .catch((e) => console.log(e));
      await axios
        .post(
          "api/text/quiz",

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
            setIsQuizLoading(false);
            if (funcSelect === "quiz") {
              setOutputData(quizData);
            }
          });
          const element = document.getElementById("output-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        })
        .catch((e) => console.log(e));
      await axios
        .post(
          "api/text/rephrase",

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
            setIsRephraseLoading(false);
            setRephrasedData(res.data);
            if (funcSelect === "rephrase") {
              setOutputData(rephrasedData);
            }
          });
          const element = document.getElementById("output-section");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        })
        .catch((e) => console.log(e));
    }
  };

  const createSummaryTextarea = () => {
    setOutputData(summaryData);
    setFuncSelect("summary");
  };
  const createRephrasedTextarea = () => {
    setOutputData(rephrasedData);
    setFuncSelect("rephrase");
  };
  const createQuizTextarea = () => {
    setOutputData(quizData);
    setFuncSelect("quiz");
  };

  const download = () => {
    downloadPDF(outputData, funcSelect);
  };
  const downloadAll = () => {
    downloadPDF(
      "Summary :\n" +
        summaryData +
        "\n\nRephrased :\n" +
        rephrasedData +
        "\n\nQuiz :\n" +
        quizData,
      "Quizter"
    );
  };

  return (
    <div className="App">
      <div className="started_page" id="started-page">
        <img src="img/v1_9.png" alt="My Image" className="img_title" />
        <div className="landing_bubble_container">
          <div className="landing_bubble">
            <img src="img/v1_9.png" alt="myImage" className="img_bubble" />
            <div className="get_started_bubble">
              <button className="get_started" onClick={start}>
                Get Started!
              </button>
            </div>
            <img
              src="img/summarize.png"
              alt="myImage"
              className="img_summarize"
            />
            <img
              src="img/paraphrase.png"
              alt="myImage"
              className="img_paraphrase"
            />
            <img src="img/quiz.png" alt="myImage" className="img_quiz" />
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
            <button onClick={createLinkInput} className="button center">
              LINK
            </button>
            <button onClick={createPdfInput} className="button right">
              PDF
            </button>
          </div>
          <div className="InputContainer">
            {isLinkInput && (
              <div className="link_container">
                <input
                  type="text"
                  className="InputTextarea"
                  placeholder="Paste link !!"
                  onChange={onChangeLink}
                ></input>
                <button className="give_text_btn" onClick={onGiveLink}>
                  SEE TEXT
                </button>
              </div>
            )}
            {isPdfInput && (
              <div className="link_container">
                <label className="label_pdf">
                  <input type="file" onChange={onPdfChange} accept=".pdf" />
                  <span>{pdfName}</span>
                </label>

                <button className="give_text_btn" onClick={onGivePdf}>
                  SEE TEXT
                </button>
              </div>
            )}
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

      {isOutputClicked && (
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
            {err ? (
              <div className="error_container">
                <span className="error">{err}</span>
              </div>
            ) : (isSummaryLoading && funcSelect === "summary") ||
              (isRephraseLoading && funcSelect === "rephrase") ||
              (isQuizLoading && funcSelect === "quiz") ? (
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
            <button className="download_btn" onClick={download}>
              DOWNLOAD
            </button>
            <button className="download_btn" onClick={downloadAll}>
              DOWNLOAD ALL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
