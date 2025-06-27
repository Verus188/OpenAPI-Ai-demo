import { GoogleGenAI } from "@google/genai";
import { useRef, useState } from "react";
export const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseText, setResponseText] = useState<string | undefined>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [history, setHistory] = useState("");

  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCzl8i9dRBBXPYh5S1DqWSMFAV51ZqVxsM",
  });

  //отправка запроса
  const sendRequest = async (requestCounter: number = 0) => {
    setIsLoading(true);
    if (textAreaRef.current === null || requestCounter > 5) return;

    const requestPrompt = textAreaRef.current.value;

    //параметры запроса, если нет json файла
    const defaulParameters = {
      model: "gemini-2.5-flash",
      contents: requestPrompt,
      config: {
        systemInstruction: "Не используй markdown в ответе." + " " + history,
      },
    };

    const jsonParametersSystemPrompt = "Не используй markdown в ответе.";
    let jsonText = "";

    if (jsonFile) {
      jsonText = await jsonFile.text();
    }

    //параметры запроса, если есть json файл
    const jsonParameters = {
      model: "gemini-2.5-flash",
      contents: requestPrompt,
      config: {
        systemInstruction:
          jsonText + " " + jsonParametersSystemPrompt + " " + history,
      },
    };

    ai.models
      .generateContent(jsonFile ? jsonParameters : defaulParameters)
      .then((response) => {
        setHistory(history + " " + response.text);
        setResponseText(response.text);
      })
      .catch((error) => {
        sendRequest(requestCounter + 1);
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="p-10 flex flex-col gap-5">
      <div className="flex gap-5 items-center">
        <textarea
          ref={textAreaRef}
          name="requestArea"
          id="requestArea"
          placeholder="Request..."
          className="w-1/3 resize-none h-60 border-1 border-border outline-none text-2xl rounded-lg p-2 text-mainTextColor bg-secondaryBackground"
        ></textarea>
        <div className="grid grid-rows-3 gap-5">
          <button
            onClick={() => {
              if (!isLoading) {
                sendRequest();
              }
            }}
            className={`border-1 border-border bg-secondaryBackground  text-2xl rounded-lg py-2 px-10  ${
              isLoading
                ? "bg-transparent text-border"
                : "hover:bg-hoverBackground text-mainTextColor"
            }`}
          >
            Send
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`border-1 border-border flex justify-center text-center bg-secondaryBackground  text-2xl rounded-lg py-2 px-10 hover:bg-hoverBackground text-mainTextColor ${
                jsonFile ? "w-3/4" : "w-full"
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => {
                setJsonFile(null);
              }}
              className={`border-1 border-border text-center justify-center bg-secondaryBackground  text-2xl rounded-lg py-2 px-10 hover:bg-hoverBackground text-mainTextColor ${
                jsonFile ? "w-1/4 flex" : "hidden"
              }`}
            >
              X
            </button>
          </div>
          <input
            type="file"
            className="hidden"
            onInput={(e) => {
              //проверка файла на json
              const target = e.target as HTMLInputElement;
              const file = target.files?.[0];

              if (file?.type === "application/json") {
                setJsonFile(file);
              } else {
                setJsonFile(null);
              }
            }}
            ref={fileInputRef}
          />
          <button
            onClick={() => {
              setHistory("");
            }}
            className={`border-1 border-border bg-secondaryBackground  text-2xl rounded-lg py-2 px-10  ${
              history === ""
                ? "bg-transparent text-border"
                : "hover:bg-hoverBackground text-mainTextColor"
            }`}
          >
            Clean history
          </button>
        </div>
      </div>
      <div className="w-3/4 border-border border-1 bg-secondaryBackground h-100 overflow-y-scroll">
        <pre className="text-mainTextColor text-2xl p-5 whitespace-pre-wrap ">
          {responseText}
        </pre>
      </div>
    </div>
  );
};
