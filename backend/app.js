const express = require("express")
const collection = require("./mongo")
const cors = require("cors")
const AuctionItem = require("./AuctionModel")
const app = express()
const jwt = require('jsonwebtoken');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({orgin:'*',credentials:true}))

const JWT_SECRET = 'hQeKeyRPlEPQciJJ4r4Ym5bIb8z9dabBe9ehLMDJwLs=';


app.post("/", async (req, res) => {
    const { email, password } = req.body

    try {
        console.log(email);
        const user = await collection.findOne({ email: email })
        console.log(user,1);

        if (user) {

            const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            console.log("toke  "+ token);
            res.cookie('token', token, {
                httpOnly: true,
                path:'/',
                maxAge: 3600000, // 1 hour
            })
            console.log('hi');
            res.json({message:'exist',token:token})
        }
        else {
            res.json("notexist")
        }



    }
    catch (e) {
        res.json("fail")
    }

})
app.post('/bid',async(req, res) =>{
	
		const { id, bidder, amount } = req.body

		try {
			const item = await AuctionItem.findById(id)

			if (!item) {
				return res.status(404).json({ error: 'Item not found' })
			}

			if (amount <= item.currentBid) {
				return res
					.status(400)
					.json({ error: 'Bid must be higher than current bid' })
			}

			item.bidHistory.push({ bidder, amount, date: new Date() })
			item.currentBid = amount

			await item.save()

			res.status(200).json({ message: 'Bid submitted successfully', item })
		} catch (error) {
			console.log(error)
			res.status(500).json({ error: 'Server error' })
		}
	
})
app.post('/review',async(req, res)=> {
	if (req.method !== 'POST') {
		return res.status(405).json({ message: 'Method Not Allowed' })
	}

	const { auctionId, rating, reviewText, reviewer } = req.body
	if (!auctionId || !rating || !reviewText) {
		return res.status(400).json({ message: 'Bad Request' })
	}


	const auctionItem = await AuctionItem.findById(auctionId)
	if (!auctionItem) {
		return res.status(404).json({ message: 'Auction item not found' })
	}

	const review = {
		username: reviewer,
		reviewText,
		rating: parseInt(rating, 10),
		date: new Date(),
	}

	auctionItem.reviews.push(review)
	await auctionItem.save()

	return res
		.status(201)
		.json({ message: 'Review submitted successfully', review })
})
app.post('/auction', async (req, res) => {
    const { method } = req

    console.log(method)

    switch (method) {
        case 'POST':
            try {
                const body = req.body
                console.log(body)

                const done = await AuctionItem.insertMany({
                    ...req.body,
                })
                res.status(201).json({ success: true, data: done })
            } catch (error) {
                console.log(error)
                res.status(403).json({ success: false, error: error.message })
            }
            break
        default:
            res.status(400).json({ success: false, error: 'Invalid request method' })
            break
    }
})

app.get("/get-auction", async (req, res) => {
    const { method } = req

    console.log(method)

    switch (method) {
        case 'GET':
            try {
                const done = await AuctionItem.find({})
                res.status(201).json({ success: true, data: done })
            } catch (error) {
                console.log(error)
                res.status(403).json({ success: false, error: error.message })
            }
            break
        default:
            res.status(400).json({ success: false, error: 'Invalid request method' })
            break
    }
})

app.put('/update-auction/:id',async (req, res) =>{
	if (req.method !== 'PUT') {
		return res.status(405).json({ message: 'Method Not Allowed' })
	}

	const { id } = req.params


	try {
		const auctionItem = await AuctionItem.findByIdAndUpdate(id, req.body, {
			new: true,
		})
		if (!auctionItem) {
			return res.status(404).json({ message: 'Auction item not found' })
		}

		return res.status(200).json(auctionItem)
	} catch (error) {
		return res.status(500).json({ message: 'Internal Server Error'})
	}
})

app.get("/my-auction/:email", async (req, res) => {
    const { method } = req

    const {email} = req.params
    console.log(email)

    switch (method) {
        case 'GET':
            try {
                const done = await AuctionItem.find({postedBy:email})
                res.status(201).json({ success: true, data: done })
            } catch (error) {
                console.log(error)
                res.status(403).json({ success: false, error: error.message })
            }
            break
        default:
            res.status(400).json({ success: false, error: 'Invalid request method' })
            break
    }
})

app.get('/auction/:id', async (req, res) => {
    const { id } = req.params
    console.log(id);

    try {
        const auctionItem = await AuctionItem.findById(id)

        if (!auctionItem) {
            return res
                .status(404)
                .json({ success: false, message: 'Auction item not found' })
        }

        res.status(200).json({ success: true, data: auctionItem })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
})
app.get('/bidding-history/:userId',async (req, res) => {
	const { userId } = req.params
    console.log(userId);

	if (!userId) {
		return res.status(400).json({ error: 'User ID is required' })
	}
	try {
		const auctions = await AuctionItem.find({ 'bidHistory.bidder': userId })
		res.status(200).json({ success: true, data: auctions })
	} catch (error) {
		res.status(500).json({ success: false, error: 'Server Error' })
	}
})
app.post("/signup", async (req, res) => {
    const { email, password } = req.body

    const data = {
        email: email,
        password: password
    }

    try {
        const check = await collection.findOne({ email: email })
        console.log(check);
        if (check) {
            res.json("exist")
        }
        else {
            res.json("notexist")
            await collection.insertMany([data])
        }

    }
    catch (e) {
        console.log(e);
        res.json("fail")
    }

})

app.listen(8000, () => {
    console.log("port connected");
})

