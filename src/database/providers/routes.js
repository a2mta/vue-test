var express = require('express');
var router = express.Router();
var Provider = require('./schema');
const { checkSchema, validationResult } = require('express-validator');

const providerValidationSchema = {
  _id: {
    isString: true,
    exists: true,
    not: {
      isEmpty: true,
    },
  },
  name: {
    isString: true,
    exists: true,
    not: {
      isEmpty: true,
    },
  },
};

router.get('/', async (_req, res) => {
  try {
    const providers = await Provider.find().populate('clients');
    res.status(200).send(providers);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/create', async ({ body }, res) => {
  const provider = new Provider(body);
  try {
    await provider.save();
    res.status(200).send(provider);
  } catch ({ message }) {
    res.status(400).send(message);
  }
});

router.delete('/delete/:id', async ({ params }, res) => {
  const { id } = params;
  try {
    const provider = await Provider.findOne({ _id: id });
    await provider.deleteOne();
    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/update', checkSchema(providerValidationSchema), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    body: { _id, name },
  } = req;

  Provider.findByIdAndUpdate(_id, { name }, (err, result) => {
    if (err) res.status(400).send(err);
    res.status(200).send(result);
  });
});

module.exports = router;
