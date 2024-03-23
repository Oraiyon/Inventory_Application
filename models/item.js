const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 20 },
  description: { type: String, required: true, maxLength: 50 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  in_stock: { type: Number, required: true }
});

ItemSchema.virtual("url").get(function () {
  return `/catalog/item/${this._id}`;
});

module.exports = mongoose.model("Item", ItemSchema);
