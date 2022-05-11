const express = require('express');
const router = express.Router();
const Client = require('./schema');
const Provider = require('../providers/schema');
const difference = require('lodash/difference');
const { checkSchema, validationResult } = require('express-validator');

const createClientSchema = {
  name: {
    isString: true,
    exists: true,
    not: {
      isEmpty: true,
    },
  },
  phone: {
    exists: true,
    isMobilePhone: true,
  },
  email: {
    exists: true,
    isEmail: true,
  },
  providers: {
    exists: true,
    isArray: true,
  },
};

const updateClientSchema = {
  ...createClientSchema,
  _id: {
    isString: true,
    exists: true,
    not: {
      isEmpty: true,
    },
  },
};

router.get('/', async (_req, res) => {
  try {
    const clients = await Client.find().populate('providers');
    res.status(200).send(clients);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/:id', async ({ params }, res) => {
  try {
    const client = await Client.findById(params.id);
    res.status(200).send(client);
  } catch (error) {
    res.status(400).send(err);
  }
});

router.post(
  '/create',
  checkSchema(createClientSchema),
  async ({ body }, res) => {
    try {
      const client = await Client.create(body);
      if (!!body.providers) {
        await Provider.updateMany(
          { _id: body.providers },
          { $addToSet: { clients: client._id } }
        );
      }
      res.status(200).send(client);
    } catch (error) {
      res.status(400).send(error);
    }
  }
);

router.delete('/delete/:id', async ({ params }, res) => {
  const { id } = params;
  try {
    const client = await Client.findByIdAndDelete({ _id: id });
    await Provider.updateMany(
      { _id: client.providers },
      { $pull: { clients: id } }
    );
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/update', checkSchema(updateClientSchema), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    body: { _id, providers, ...rest },
  } = req;

  const client = await Client.findByIdAndUpdate(_id, { providers, ...rest });
  const oldProviders = client.providers.map((id) => id.toString());
  const removed = difference(oldProviders, providers);
  const added = difference(providers, oldProviders);
  await Provider.updateMany(
    { _id: added },
    { $addToSet: { clients: client._id } }
  );
  await Provider.updateMany(
    { _id: removed },
    { $pull: { clients: client._id } }
  );
  res.status(200).send();
});

module.exports = router;
