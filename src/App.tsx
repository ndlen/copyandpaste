import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
    const [inputData, setInputData] = useState("");
    const [lines, setLines] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const previewListRef = useRef<HTMLDivElement>(null);

    // Auto scroll khi currentIndex thay đổi
    useEffect(() => {
        if (previewListRef.current && currentIndex >= 0) {
            const currentItem = previewListRef.current.querySelector(
                `[data-index="${currentIndex}"]`
            );
            if (currentItem) {
                currentItem.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    }, [currentIndex]);

    const handleStart = () => {
        const processedLines = inputData
            .split("\n")
            .filter((line) => line.trim() !== "") // Xóa dòng trống
            .flatMap((line) => {
                // Nếu có dấu chấm, chia thành 2 dòng
                const dotIndex = line.indexOf(".");
                if (dotIndex !== -1 && dotIndex < line.length - 1) {
                    const beforeDot = line.substring(0, dotIndex + 1).trim();
                    const afterDot = line.substring(dotIndex + 1).trim();
                    return [beforeDot, afterDot].filter((part) => part !== "");
                }
                return [line.trim()];
            })
            .filter((line) => line !== ""); // Lọc lại lần nữa sau khi xử lý

        setLines(processedLines);
        setCurrentIndex(0);
        setIsStarted(true);
    };

    const handleCopy = async () => {
        if (lines.length > 0 && currentIndex < lines.length) {
            try {
                await navigator.clipboard.writeText(lines[currentIndex]);
                // Tự động chuyển sang dòng tiếp theo
                setCurrentIndex((prev) => prev + 1);
            } catch (err) {
                console.error("Failed to copy text: ", err);
                alert("Không thể copy. Hãy thử bấm nút copy lại.");
            }
        }
    };

    const handleReset = () => {
        setIsStarted(false);
        setCurrentIndex(0);
        setLines([]);
    };

    const getProcessedLineCount = () => {
        return inputData
            .split("\n")
            .filter((line) => line.trim() !== "")
            .flatMap((line) => {
                const dotIndex = line.indexOf(".");
                if (dotIndex !== -1 && dotIndex < line.length - 1) {
                    const beforeDot = line.substring(0, dotIndex + 1).trim();
                    const afterDot = line.substring(dotIndex + 1).trim();
                    return [beforeDot, afterDot].filter((part) => part !== "");
                }
                return [line.trim()];
            })
            .filter((line) => line !== "").length;
    };

    return (
        <div className="app-container">
            <div className="app-grid">
                <div className="input-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">📝 Nhập dữ liệu</h2>
                        <div className="panel-info">
                            {getProcessedLineCount()} dòng sau xử lý
                        </div>
                    </div>

                    <div className="input-section">
                        <textarea
                            className="input-textarea"
                            value={inputData}
                            onChange={(e) => setInputData(e.target.value)}
                            placeholder="Nhập dữ liệu, mỗi dòng một...\nTự động: Xóa dòng trống, tách dòng có dấu chấm"
                            rows={8}
                        />
                    </div>

                    <div className="button-section">
                        <button
                            className={`btn btn-primary ${
                                !inputData.trim() || isStarted ? "disabled" : ""
                            }`}
                            onClick={handleStart}
                            disabled={!inputData.trim() || isStarted}
                        >
                            🚀 Bắt đầu
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={handleReset}
                        >
                            🔄 Reset
                        </button>
                    </div>
                </div>

                <div className="copy-panel">
                    <div className="panel-header">
                        <h2 className="panel-title">📋 Sao chép</h2>
                        {isStarted && (
                            <div className="panel-info">
                                {currentIndex}/{lines.length} dòng
                            </div>
                        )}
                    </div>

                    {!isStarted ? (
                        <div className="waiting-state">
                            <div className="waiting-icon">⏳</div>
                            <p>
                                Nhập dữ liệu bên trái và bấm "Bắt đầu" để bắt
                                đầu sao chép
                            </p>
                        </div>
                    ) : (
                        <div className="copy-section">
                            {lines.length > 0 && (
                                <div className="preview-section">
                                    <div
                                        className="preview-list"
                                        ref={previewListRef}
                                    >
                                        {lines.map((line, index) => (
                                            <div
                                                key={index}
                                                data-index={index}
                                                className={`preview-item ${
                                                    index === currentIndex
                                                        ? "current"
                                                        : index < currentIndex
                                                        ? "completed"
                                                        : "pending"
                                                }`}
                                            >
                                                <span className="preview-number">
                                                    {index + 1}
                                                </span>
                                                <span className="preview-text">
                                                    {line}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="copy-button-section">
                                <button
                                    className={`btn btn-copy ${
                                        currentIndex >= lines.length
                                            ? "disabled"
                                            : ""
                                    }`}
                                    onClick={handleCopy}
                                    disabled={currentIndex >= lines.length}
                                >
                                    {currentIndex >= lines.length
                                        ? "✅ Đã xong"
                                        : `📋 Copy (${currentIndex + 1}/${
                                              lines.length
                                          })`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
