const mongoose = require('mongoose');
const Client = require('./clients/schema');
const Provider = require('./providers/schema');

const clients = [
  new Client({
    name: 'Chuck Norris',
    email: 'chuck@mail.com',
    phone: '88005553555',
    providers: [],
  }),
  new Client({
    name: 'Bill Murray',
    email: 'bill@mail.com',
    phone: '89003334444',
    providers: [],
  }),
  new Client({
    name: 'Agent K',
    email: 'agentk@mail.com',
    phone: '89303334455',
    providers: [],
  }),
];

const providers = [
  new Provider({
    name: 'Provider 1',
  }),
  new Provider({
    name: 'Provider 2',
  }),
  new Provider({
    name: 'Provider 3',
  }),
];

mongoose
  .connect('mongodb://localhost:27017/vue-test')
  .catch((err) => {
    console.log(err.stack);
    process.exit(1);
  })
  .then(() => {
    console.log('Connected to db...');
  });

const createProviders = Promise.all(
  providers.map(async (provider) => {
    await provider.save();
  })
).then(() => console.info('Providers created...'));

const createClients = Promise.all(
  clients.map(async (client) => {
    await client.save();
  })
).then(() => console.info('Clients created...'));

Promise.all([createClients, createProviders]).then(async () => {
  const providers = await Provider.find().distinct('_id');
  const client = await Client.findOneAndUpdate(
    { name: 'Chuck Norris' },
    { providers }
  );
  await Provider.updateMany({}, { $addToSet: { clients: client._id } });
  console.info('All done ✊')
  process.exit(0);
});
