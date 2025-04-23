import { useEffect, useRef, useState } from "react";

const SnakeGame = () => {
  // Game state
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [speed, setSpeed] = useState(150);
  const [isMobile, setIsMobile] = useState(false);

  const xVelocityRef = useRef(0);
  const yVelocityRef = useRef(0);

  // Button state
  const buttonRef = useRef(null);
  const [buttonText, setButtonText] = useState("Contact Us (Don't Bother)");

  // Check if mobile on mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Game initialization
  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    // Game variables
    let snake = [{ x: 10, y: 10 }];
    let apple = { x: 5, y: 5 };
    let xVelocity = 0;
    let yVelocity = 0;
    let snakeLength = 1;
    let gameLoopId;

    // Draw game state
    const drawGame = () => {
      // Clear canvas
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw snake
      ctx.fillStyle = "#4CAF50";
      snake.forEach((segment) => {
        ctx.fillRect(
          segment.x * gridSize,
          segment.y * gridSize,
          gridSize - 1,
          gridSize - 1
        );
      });

      // Draw apple
      ctx.fillStyle = "#FF5252";
      ctx.beginPath();
      ctx.arc(
        apple.x * gridSize + gridSize / 2,
        apple.y * gridSize + gridSize / 2,
        gridSize / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    };

    // Game logic
    const updateGame = () => {
      // Move snake
      const head = {
        x: snake[0].x + xVelocityRef.current,
        y: snake[0].y + yVelocityRef.current,
      };
      snake.unshift(head);

      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
      ) {
        setGameOver(true);
        return;
      }

      // Check apple collision
      if (head.x === apple.x && head.y === apple.y) {
        // Generate new apple position (not on snake)
        let newApple;
        do {
          newApple = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
          };
        } while (
          snake.some(
            (segment) => segment.x === newApple.x && segment.y === newApple.y
          )
        );

        apple = newApple;
        snakeLength++;
        setScore((prev) => prev + 10);
      }

      // Remove tail if not growing
      if (snake.length > snakeLength) {
        snake.pop();
      }

      drawGame();
    };

    // Game loop
    gameLoopId = setInterval(() => {
      if (!isPaused && !gameOver) {
        updateGame();
      }
    }, speed);

    // Keyboard controls - PREVENT SCROLLING
    const handleKeyDown = (e) => {
      // Prevent arrow key scrolling
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
          if (yVelocityRef.current !== 1) {
            xVelocityRef.current = 0;
            yVelocityRef.current = -1;
          }
          break;
        case "ArrowDown":
          if (yVelocityRef.current !== -1) {
            xVelocityRef.current = 0;
            yVelocityRef.current = 1;
          }
          break;
        case "ArrowLeft":
          if (xVelocityRef.current !== 1) {
            xVelocityRef.current = -1;
            yVelocityRef.current = 0;
          }
          break;
        case "ArrowRight":
          if (xVelocityRef.current !== -1) {
            xVelocityRef.current = 1;
            yVelocityRef.current = 0;
          }
          break;
        case " ":
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial draw
    drawGame();

    // Cleanup
    return () => {
      clearInterval(gameLoopId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted, isPaused, gameOver, speed]);

  // Button avoidance effect
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const directions = [
      { x: 120, y: 0, text: "Nope!" },
      { x: -120, y: 0, text: "Not today!" },
      { x: 0, y: 80, text: "Too slow!" },
      { x: 0, y: -80, text: "Nice try!" },
      { x: 100, y: 60, text: "Missed me!" },
      { x: -100, y: 60, text: "Try harder!" },
      { x: 100, y: -60, text: "So close!" },
      { x: -100, y: -60, text: "Maybe later!" },
    ];

    let clickAttempts = 0;

    const handleMouseMove = (e) => {
      const btnRect = button.getBoundingClientRect();
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      const angle =
        Math.atan2(e.clientY - btnCenterY, e.clientX - btnCenterX) *
        (180 / Math.PI);

      const direction = Math.floor((angle + 180 + 22.5) / 45) % 8;
      const { x, y, text } = directions[direction];

      button.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 20 - 10}deg)`;
      setButtonText(text);
    };

    const handleClick = () => {
      clickAttempts++;
      if (clickAttempts > 3) {
        button.style.transform = "translate(0, 0) rotate(0deg)";
        button.style.backgroundColor = "#4CAF50";
        setButtonText("Fine. You win.");
        setTimeout(() => {
          button.style.backgroundColor = "#f44336";
          setButtonText("Contact Us (Why Bother?)");
          clickAttempts = 0;
        }, 2000);
      } else {
        const randomDir = Math.floor(Math.random() * 8);
        const { x, y, text } = directions[randomDir];
        button.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 360}deg)`;
        setButtonText(text);
      }
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("click", handleClick);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("click", handleClick);
    };
  }, []);

  // Mobile controls handler
  const handleMobileControl = (direction) => {
    console.log(direction);
    switch (direction) {
      case "up":
        if (yVelocityRef.current !== 1) {
          xVelocityRef.current = 0;
          yVelocityRef.current = -1;
        }
        break;
      case "down":
        if (yVelocityRef.current !== -1) {
          xVelocityRef.current = 0;
          yVelocityRef.current = 1;
        }
        break;
      case "left":
        if (xVelocityRef.current !== 1) {
          xVelocityRef.current = -1;
          yVelocityRef.current = 0;
        }
        break;
      case "right":
        if (xVelocityRef.current !== -1) {
          xVelocityRef.current = 1;
          yVelocityRef.current = 0;
        }
        break;
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setSpeed(150);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Productivity Avoidance Snake
        </h1>

        {/* Game Canvas */}
        <div className="relative mb-6 sm:flex sm:justify-center">
          <canvas
            ref={canvasRef}
            width="350"
            height="350"
            className="bg-gray-100 border border-gray-300 rounded-lg mx-auto block"
          />

          {!gameStarted && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
              >
                Start Avoiding
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="bg-white p-6 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="mb-4">Final Score: {score}</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={startGame}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <div className="bg-white px-4 py-2 rounded font-bold">PAUSED</div>
            </div>
          )}

          {/* Mobile Controls Overlay */}
          {isMobile && gameStarted && !gameOver && !isPaused && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <button
                  onClick={() => handleMobileControl("up")}
                  className="bg-gray-200 bg-opacity-70 w-12 h-12 rounded-full flex items-center justify-center"
                >
                  <span className="text-xl">↑</span>
                </button>
                <div></div>
                <button
                  onClick={() => handleMobileControl("left")}
                  className="bg-gray-200 bg-opacity-70 w-12 h-12 rounded-full flex items-center justify-center"
                >
                  <span className="text-xl">←</span>
                </button>
                <button
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="bg-gray-200 bg-opacity-70 w-12 h-12 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs">Pause</span>
                </button>
                <button
                  onClick={() => handleMobileControl("right")}
                  className="bg-gray-200 bg-opacity-70 w-12 h-12 rounded-full flex items-center justify-center"
                >
                  <span className="text-xl">→</span>
                </button>
                <div></div>
                <button
                  onClick={() => handleMobileControl("down")}
                  className="bg-gray-200 bg-opacity-70 w-12 h-12 rounded-full flex items-center justify-center"
                >
                  <span className="text-xl">↓</span>
                </button>
                <div></div>
              </div>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-xl font-bold">{score}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-600">Speed</p>
            <p className="text-xl font-bold">
              {Math.round((200 - speed) / 15)}/10
            </p>
          </div>
        </div>

        {/* Controls (shown on desktop) */}
        {!isMobile && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-center">Controls</h3>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg">↑</span>
                </div>
                <span className="text-xs">Up</span>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg">↓</span>
                </div>
                <span className="text-xs">Down</span>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg">←</span>
                </div>
                <span className="text-xs">Left</span>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg">→</span>
                </div>
                <span className="text-xs">Right</span>
              </div>
              <div className="text-center">
                <div className="bg-gray-200 w-10 h-10 rounded flex items-center justify-center mx-auto mb-1">
                  <span className="text-lg">␣</span>
                </div>
                <span className="text-xs">Pause</span>
              </div>
            </div>
          </div>
        )}

        {/* Unclickable Button */}
        <div className="relative h-24 mb-6">
          <button
            ref={buttonRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                     px-6 py-3 bg-red-500 text-white rounded-full transition-all 
                     duration-300 hover:bg-red-600 shadow-lg font-bold whitespace-nowrap"
          >
            {buttonText}
          </button>
        </div>

        {/* Game Legend */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2 text-center">Game Legend</h3>
          <div className="flex justify-center gap-6">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">You (the avoider)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm">Productivity (avoid!)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
