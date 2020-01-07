module.exports = (schema) => {
  // specify the transform schema option
  schema.options.toJSON = schema.options.toJSON || {};

  schema.options.toJSON.transform = (doc, ret) => {
    // doc - the original document
    // ret - the processed document
    if (doc._id) {
      // store serialized id
      const id = doc._id.toHexString();
      // delete from ret
      delete ret._id;
      // delete version info
      delete ret.__v;
      // add to ret
      ret.id = id;
    }
    // conclude
    return ret;
  };
};
