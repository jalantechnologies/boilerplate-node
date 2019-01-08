const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: String,
  password: {
    hash: String,
    salt: String,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// // specify the transform schema option
// if (!schema.options.toObject) schema.options.toObject = {};

// schema.options.toObject.transform = (doc, ret) => {
//   // for _it to id transformation
//   const response = ret;
//   // delete the original _id
//   delete response._id;
//   // add the original _id as id
//   response.id = doc._id;
//   // conclude
//   return response;
// };

module.exports = mongoose.model('Account', schema);
