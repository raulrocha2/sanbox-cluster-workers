import rq from 'amqplib';
import fabObj from "../math-logic/fibonacci-series.js";


export function sendValueToQueue(number, queueName, workerPid) {
  rq.connect("amqp://localhost").then((conn) => {
    return conn.createChannel();
  }).then((channel) => {
    let result = fabObj.calculateFibonacciValue(number);
    channel.assertQueue(queueName, { durable: false });
     const message = JSON.stringify({
        result: result,
        workerPid: workerPid
    });
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`Message sent to the queue ${queueName} : result: ${result}`);
  }).catch((err) => {
    console.error("Error in sending message to the queue : ", err);
  });
}   

export function receiveValueFromQueue(queueName, callback) {
  rq.connect("amqp://localhost").then((conn) => {
    return conn.createChannel();
  }).then((channel) => {
    channel.assertQueue(queueName, { durable: false });
    console.log(`Waiting for messages in the queue : ${queueName}`);
    channel.consume(queueName, (message) => {
      if (message !== null) {
        console.log(`Message received from the queue : ${queueName}`);
        callback(message.content.toString());
        channel.ack(message);
      }
    });
  }).catch((err) => {
    console.error("Error in receiving message from the queue : ", err);
  });
}