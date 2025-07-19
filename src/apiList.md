# DevTinder APIs

## authRouter
-POST /singup
-POST /login
-POST /logout

## profileRouter

-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password

## connectionRequestRouter

-POST /request/send/intereted/:userId
-POST /request/send/ignored/:userId
-POST /request/review/accepted/:requestId
-POSt /request/review/rejected/:requestId

## useRouter
-GET /user/connections
-GET /user/requests

