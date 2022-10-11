const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_SERVICE_ID

module.exports = {

    doSms: (userData) => {
        let res = {}
        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceSid).verifications.create({
                to: `+91${userData.phone}`,
                channel: "sms"
            }).then((res) => {
                res.valid = true;
                resolve(res)
                console.log(res);
            })
        })
    },

    otpVerify: (otpData, userData) => {
        let resp = {}

        return new Promise(async (resolve, reject) => {
            await client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${userData.phone}`,
                code: otpData.otp
            }).then((resp) => {
                console.log(resp,"resprespresp");
                console.log("verification success");
               
                resolve(resp)
            }).catch((error)=>{
                reject(error)
            })
        })
    }


}