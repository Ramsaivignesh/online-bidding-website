const mongoose=require("mongoose")

const AuctionItemSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	minimumBid: { type: Number, required: true },
	currentBid: { type: Number, required: true },
	endDate: { type: Date, required: true },
	imageUrl: { type: String, required: true },
	postedBy: { type: String, required: true },
	live: { type: Boolean },
	reviews: [
		{
			username: { type: String, required: true },
			reviewText: { type: String, required: true },
			rating: { type: Number, required: true },
			date: { type: Date, required: true },
		},
	],
	bidHistory: [
		{
			bidder: { type: String, required: true },
			amount: { type: Number, required: true },
			date: { type: Date, required: true },
		},
	],
})
const AuctionItem =
	mongoose.models.AuctionItem ||
	mongoose.model('AuctionItem', AuctionItemSchema)
module.exports=AuctionItem
