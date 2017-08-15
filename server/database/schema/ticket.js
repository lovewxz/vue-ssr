import mongoose from 'mongoose'

const Schema = mongoose.Schema

const TicketSchema = new Schema({
  name: String,
  ticket: String,
  expires_in: Number,
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

TicketSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now()
  } else {
    this.meta.updatedAt = Date.now()
  }
  next()
})

TicketSchema.statics = {
  async getTicket() {
    const ticket = await this.findOne({
      name: 'ticket'
    }).exec()
    return ticket
  },
  async saveTicket(data) {
    let ticket = await this.findOne({
      name: 'ticket'
    }).exec()
    if (ticket) {
      ticket.ticket = data.ticket
      ticket.expires_in = data.expires_in
    } else {
      ticket = new Ticket({
        name: 'ticket',
        expires_in: data.expires_in,
        ticket: data.ticket
      })
    }
    await ticket.save()
    return ticket
  }
}


const Ticket = mongoose.model('Ticket', TicketSchema)
