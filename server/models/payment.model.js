const pool = require('../config/db');
const { NotFoundError, ConflictError } = require('../utils/errors');

class PaymentModel {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  async create(data, connection = null) {
    const db = connection || this.pool;
    try {
      const [result] = await db.query(
        `
        INSERT INTO payments (
          booking_id, razorpay_order_id, amount, currency, status
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [
          data.booking_id,
          data.razorpay_order_id,
          data.amount,
          data.currency,
          data.status || 'created',
        ]
      );
      return {
        payment_id: result.insertId,
        booking_id: data.booking_id,
        razorpay_order_id: data.razorpay_order_id,
        amount: data.amount,
        currency: data.currency,
        status: data.status || 'created',
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictError('Payment order already exists');
      }
      throw error;
    }
  }

  async updatePaymentDetails(razorpay_order_id, data, connection = null) {
    const db = connection || this.pool;
    const [result] = await db.query(
      `
      UPDATE payments
      SET razorpay_payment_id = ?, razorpay_signature = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE razorpay_order_id = ?
      `,
      [
        data.razorpay_payment_id,
        data.razorpay_signature,
        data.status,
        razorpay_order_id,
      ]
    );
    if (result.affectedRows === 0) {
      throw new NotFoundError('Payment not found');
    }
  }

  async findByOrderId(razorpay_order_id, connection = null) {
    const db = connection || this.pool;
    const [rows] = await db.query(
      'SELECT * FROM payments WHERE razorpay_order_id = ?',
      [razorpay_order_id]
    );
    if (!rows[0]) {
      throw new NotFoundError('Payment not found');
    }
    return rows[0];
  }
}

module.exports = new PaymentModel(pool);