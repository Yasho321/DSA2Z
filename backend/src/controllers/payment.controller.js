import { db } from "../libs/db.js";
import { razorpayInstance } from "../libs/razorpay.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { planName } = req.body;
    const plans = {
        standard: { amount: 99, tokens: 10 },
        premium: { amount: 199, tokens: 25 },
        pro: { amount: 349, tokens: 50 },
    };
     
    const selected = plans[planName];
    
    if (!selected) return res.status(400).json({ message: "Invalid plan" });

    const options = {
        amount: selected.amount * 100, // in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);

    

    res.status(200).json({ orderId: order.id, amount: selected.amount, tokens: selected.tokens });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error while creating order" });
    
  }
};

// controllers/payment.js
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, tokens ,amount , razorpay_order_id,razorpay_signature} = req.body;
    const userId = req.user.id;

    

    const verifyingToken = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(verifyingToken.toString()).digest("hex");

    console.log({ expectedSignature, razorpay_signature })

    if(razorpay_signature === expectedSignature){

        const payment = await db.payment.create({
            data: {
            userId,
            amount: parseInt(amount),
            tokens,
            razorpayId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id
            },
        });

       const user = await db.user.update({
            where: { id: userId },
            data: { tokens: { increment: tokens } },
        });

        

         res.status(200).json({ success: true ,
            message : "Payment verified successfully" 
         });

        
    }

    res.status(400).json({
      success: false,
      message : "Signature did not match"
    })

    
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error while verifying payment" });
    
  }
};
