import { model, Schema } from 'mongoose';

const paymentSchema = new Schema({
    // in production label don't use of third party packege in generic schema this is not good practice 
    razorpay_payment_id: {
        type: String,
        required: true,
    }, 
    razorpay_subscription_id: {
        type: String,
        required: true,
    },
    razorpay_signature: {
        type: String,
        required: String,
    },
},
    {
        timestamps: true,
      }
);

const Payment = model('Payment', paymentSchema);

export default Payment;