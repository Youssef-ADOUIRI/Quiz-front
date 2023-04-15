import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import "./App.css";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function downloadPDF(text, txt_type) {
  // create a new jsPDF instance
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add heading
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(txt_type.toUpperCase(), 10, 10);
  //add text
  doc.setLineWidth(0.5);
  doc.setLineHeightFactor(1.2);
  doc.setFontSize(12);
  doc.setFont("times", "normal");
  const splitText = doc.splitTextToSize(text, doc.internal.pageSize.width - 20);
  let cursorY = 20; // set initial y position
  splitText.forEach(line => {
    if (cursorY > 280) { // check if the cursor is at the end of the page
      doc.addPage(); // add new page
      cursorY = 20; // reset y position
    }
    doc.text(line, 10, cursorY); // add line of text
    cursorY += 10; // increase y position by line height
  });

  // save the PDF document
  doc.save(txt_type + ".pdf");
}

function App() {
  const [text, setText] = useState("Type here !!");
  const [istextArea, setIsTextArea] = useState(false);
  const [isLinkInput, setIsLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [isLinkOutput, setIsLinkOutput] = useState(false);
  const [isPdfInput, setIsPdfInput] = useState(false);
  const [pdfInput, setPdfInput] = useState();
  const [isPdfOutput, setIsPdfOutput] = useState(false);
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
        "http://127.0.0.1:8080/api/linktotext",
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
        .put("http://127.0.0.1:8080/api/pdftotext", formData, {
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
    setSummaryData("");
    setRephrasedData("");
    setQuizData("");

    setIsSummaryLoading(true);
    setIsRephraseLoading(true);
    setIsQuizLoading(true);

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
          setFuncSelect("summary");
          setOutputData(res.data);
          setIsSummaryLoading(false);
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
          setIsQuizLoading(false);
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
          setIsRephraseLoading(false);
        });
        const element = document.getElementById("output-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((e) => console.log(e));
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
            {(isSummaryLoading && funcSelect === "summary") ||
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
