import { useRef, useEffect } from "react";
import "./live-api-console.css";

export default function LiveApiConsole({ payload, title = "Live API Logs" }) {
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [payload]);

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const lines = formatJson(payload).split("\n");

  return (
    <section className="zf-section">
      <h2 className="zf-section__title mb-4">{title}</h2>
      <div className="live-console" ref={consoleRef}>
        <div className="console-header">
          <span className="console-prompt">$</span>
          <span className="console-command">zorvyn_api {title.toLowerCase().replace(/\s+/g, "_")}</span>
        </div>
        <div className="console-output">
          {lines.map((line, idx) => (
            <div key={idx} className="console-line">
              <span className="console-line-num">{String(idx + 1).padStart(3, " ")}</span>
              <span className="console-text">{line || " "}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
