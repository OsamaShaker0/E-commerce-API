const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'please provide product name '],
      maxlength: [100, 'name can not be more than 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'please provide product price '],
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'please provide product description '],
      maxlength: [1000, 'description can not be more than 1000 characters'],
    },
    image: {
      type: String,
      default: '/upload/example.jpeg',
    },

    category: {
      type: String,
      required: [true, 'please provide product category '],
      enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
      type: String,
      required: [true, 'please provide product company '],
      enum: {
        values: ['ikea', 'liddy', 'marcos'],
        message: '{VALUE} is not supported',
      },
    },
    colors: {
      type: [String],
      default: ['#222'],
      required: [true, 'please provide product color '],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShiping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      // required: true,
      default: 15,
    },
    averageRating: {
      type: Number,
      deafult: 0,
    },
    numOfReviews: {
      type: Number,
      deafult: 0,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual('reviews', {
  ref: 'Review',
  justOne: false,
  localField: '_id',
  foreignField: 'product',
});

ProductSchema.pre('remove', async function () {
  await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('Product', ProductSchema);
