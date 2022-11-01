require('dotenv').config()
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

let myOAuthClient = new OAuth2({
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  redirectUri: process.env.OAUTH_URI,
})

myOAuthClient.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
})

module.exports = async (mail, userEmailId) => {
  try {
    let myAccessToken = myOAuthClient.getAccessToken()

    let transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.OAUTH_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        accessToken: myAccessToken,
      },
    })

    const mailBody = {
      from: `Lightbox <${process.env.OAUTH_USER}>`,
      to: userEmailId,
      subject: mail.subject,
      html: mail.html,
    }

    return transport.sendMail(mailBody)
  } catch (e) {
    throw e
  }
}
