const { model, Schema, Types } = require('mongoose');

const ProviderSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  clients: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
  ],
});

ProviderSchema.pre('deleteOne', { document: true }, function (next) {
  this.model('Client').updateMany(
    { _id: this.clients },
    { $pull: { providers: this._id } },
    next
  );
});

module.exports = model('Provider', ProviderSchema, 'providers');
