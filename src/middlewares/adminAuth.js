const adminAuth = (req, res, next) => {
    const token = 'xyza'
    const authorzation = token === 'xyz'
    if (!authorzation) {
        res.status(401).send("Something went worng !")
    }
    else {
        next()
    }
}


const userAuth = (req, res, next) => {
    const token = 'xyz';
    const authozation = token === 'xyza';
    if (!authozation) {
        res.status(401).send('User Credentails Wrong !')
    }
    else {
        next()
    }
}

module.exports = { adminAuth, userAuth }