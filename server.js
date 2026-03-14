import express from "express";
import cluster from "cluster";
import os from "os";
import {fork} from "child_process";
import {sendValueToQueue, receiveValueFromQueue} from "./queues/fab-queue.js";

const TOTAL_CPUS = os.cpus().length;
if (cluster.isPrimary) {
    console.log(`Total CPUs : ${TOTAL_CPUS}`);
    const worker1 = fork('./workers/fab-series-worker1.js', {workerType: "worker1"});
    const worker2 = fork('./workers/fab-series-worker2.js', {workerType: "worker2"});
    worker1.on("message", function (number) {
        console.log(`Worker 1 : ${number}`);
        
    });
    worker2.on("message", function (number) {
        console.log(`Worker 2 : ${number}`);
    });

    cluster.on("online", (worker) => {
        console.log(`Message received from - ${worker.process.pid}`)
        worker.on("message", num => {
            if (num % 2 === 0) {
                const queueName = "fab_queue_even";
            sendValueToQueue(num, queueName, worker.process.pid);
            receiveValueFromQueue(queueName, result => {
                console.log(`Result received from the queue : ${result}`);
            });
            }
            else {
                const queueName = "fab_queue_odd";
            sendValueToQueue(num, queueName, worker.process.pid);
            receiveValueFromQueue(queueName, result => {
                console.log(`Result received from the queue : ${result}`);
            });
            }
            

        });
    });

    const cpu_limit = TOTAL_CPUS > 4 ? 4 : TOTAL_CPUS;
    for (let i = 0; i < cpu_limit; i++) {
        let worker = cluster.fork();
        console.log(`Worker started on PID - ${worker.process.pid}`);
    }
} else {
    const app = express();
    // http://localhost:3000?number=10
    app.get("/", (request, response) => {
        process.send(request.query.number);
        console.log(`Process Id ${process.pid} received the request!`);
        response.send("<h3>The request has been received successfully! We will send an email once your calculation is ready!</h3>");
        response.end();
    });
    app.listen(3000, () => console.log("Express App is running on PORT : 3000"));
}

