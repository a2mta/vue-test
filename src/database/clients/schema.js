const { model, Schema } = require('mongoose');

const ClientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  providers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
    },
  ],
});


module.exports = model('Client', ClientSchema, 'clients');
