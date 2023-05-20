require('../../config');

const {
  rabbitmqArchitecture,
  rabbitmq,
} = require('../../../utils/rabbitmq');
const { sendExportedUploadErrorLogs } = require('../../../utils/uploadError.js');

const run = async () => {
  const { channel } = await rabbitmq();
  const { queue, exchange, routingKey } = await rabbitmqArchitecture(
    'send_exported_upload_error_logs_queue'
  );

  

  // create the exchange if it doesn't already exist
  await channel.assertExchange(exchange, 'topic', { durable: true });
  // create the queue if it doesn't already exist
  const q = await channel.assertQueue(queue, { durable: true });
  // bind queue to exchange
  await channel.bindQueue(q.queue, exchange, routingKey);
  console.log(' [*] Waiting for %s. To exit press CTRL+C', queue);
  // get one message off the queue at a time
  await channel.prefetch(1);
  // consume message from queue
  await channel.consume(
    q.queue,
    async msg => {
      try {
        const message = JSON.parse(msg.content.toString());

        console.log(`${message.action}_${message.type}`);
        switch (`${message.action}_${message.type}`) {
          case 'send_exported_upload_error_logs_fire':
            {
              console.log(' [Received] %s', message.type);
              await sendExportedUploadErrorLogs(message.data);
              console.log(
                ' [Processed] %s',
                `SendExportsUploadErrorLogsWorker - ${message.type}`
              );
              channel.ack(msg); // acknowledged processing is complete
            }
            break;

          default:
            break;
        }
      } catch (error) {
        console.error({ RetrySendingUploadErrorExportError: error });
        channel.nack(msg);
      }
    },
    { noAck: false } // ensure that message acknowledged after processed - it must be false to work like so
  );
};
// call function
run();
