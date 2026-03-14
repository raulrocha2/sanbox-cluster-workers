import fabObj from "../math-logic/fibonacci-series.js";



process.on("message", (message) => {
    if (message.number) {
        const number = fabObj.calculateFibonacciValue(Number.parseInt(message.number));
        process.send(number);
    }
});