const welcomeEmailBody = (code) => {
  return `<body style="height: 100%; margin:0; padding: 0, width:100%">
    <div
      style="
        display: none;
        font-size: 1px;
        color: #fefefe;
        line-height: 1px;
        font-family: 'Lato', Helvetica, Arial, sans-serif;
        max-height: 0px;
        max-width: 0px;
        opacity: 0;
        overflow: hidden;
      "
    >
      We're thrilled to have you here! Get ready to dive into your new account.
    </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <!-- LOGO -->
      <tr>
        <td bgcolor="#006ba6" align="center">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px;"
          >
            <tr>
              <td
                align="center"
                valign="top"
                style="padding: 40px 10px 40px 10px;"
              ></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td
          bgcolor="#006ba6"
          align="center"
          style="padding: 0px 10px 0px 10px;"
        >
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px;"
          >
            <tr>
              <td
                bgcolor="#ffffff"
                align="center"
                valign="top"
                style="
                  padding: 40px 20px 20px 20px;
                  border-radius: 4px 4px 0px 0px;
                  color: #111111;
                  font-family: 'Lato', Helvetica, Arial, sans-serif;
                  font-size: 48px;
                  font-weight: 400;
                  letter-spacing: 4px;
                  line-height: 48px;
                "
              >
                <h1
                  style="
                    color: #006ba6;
                    font-size: 32px;
                    font-weight: bold;
                    margin: 2;
                  "
                >
                  Welcome to Lightbox!
                </h1>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td bgcolor="black" align="center" style="padding: 0px 10px 0px 10px;">
          <table
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 600px;"
          >
            <tr>
              <td
                bgcolor="#ffffff"
                align="left"
                style="
                  padding: 20px 30px 40px 30px;
                  color: #666666;
                  font-family: 'Lato', Helvetica, Arial, sans-serif;
                  font-size: 18px;
                  font-weight: 400;
                  line-height: 25px;
                "
              >
                <p style="margin: 0;">
                  There's one quick step you need to complete before crating
                  your Lightbox account. Let's make sure this is the right email
                  address to use for your new account. Please enter the given
                  verification code to get started on Lightbox:
                </p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#ffffff" align="left">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td
                      bgcolor="#ffffff"
                      align="center"
                      style="padding: 20px 30px 60px 30px;"
                    >
                      <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td
                            align="center"
                            style="border-radius: 3px;"
                            bgcolor="#FFA73B"
                          >
                            <button
                              style="
                                font-size: 24px;
                                font-family: 'Lato', Helvetica, Arial, sans-serif;
                font-weight: bold;
                                text-decoration: none;
                                color: white;
                                background-color: #006ba6;
                                padding: 15px 25px;
                                border-radius: 5px;
                letter-spacing: 4px;
                                border: 1px solid #006ba6;
                                display: inline-block;
                                "
                            >
                              &nbsp;${code}&nbsp;
                            </button>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- COPY -->
            <tr>
              <td
                bgcolor="#ffffff"
                align="left"
                style="
                  padding: 0px 30px 0px 30px;
                  color: #666666;
                  font-family: 'Lato', Helvetica, Arial, sans-serif;
                  font-size: 18px;
                  font-weight: 400;
                  line-height: 25px;
                "
              >
                <p style="margin: 0;">
                  If you did not create an account, we highly recommend securing
                  your email address. If you have any questions, just reply to
                  this email - we are always happy to help you out.
                </p>
              </td>
            </tr>
            <!-- COPY -->
            <tr>
              <td
                bgcolor="#ffffff"
                align="left"
                style="
                  padding: 0px 30px 40px 30px;
                  border-radius: 0px 0px 4px 4px;
                  color: #666666;
                  font-family: 'Lato', Helvetica, Arial, sans-serif;
                  font-size: 18px;
                  font-weight: 400;
                  line-height: 25px;
                "
              >
                <!-- <p style="margin: 0;">Cheers,<br />BBB Team</p> -->
                <br />
                Thanks and Regards, <br />
                <br />

                <div style="content: ''; display: table; clear: both;">
                  <div style="float: left;">
                    <img
                      src="https://lightbox-demo.netlify.app/logo.png"
                      alt="Lightbox"
                      style="width: 50px;"
                    />
                  </div>
                  <div style="float: left; text-align: center;">
                    <a
                      href="https://lightbox-demo.netlify.app/"
                      style="
                        font-weight: bold;
                        color: #006ba6;
                        text-decoration: none;
                      "
                      >The Lightbox Team </a
                    ><br />
                    <a
                      href="https://lightbox-demo.netlify.app/policy"
                      style="color: #006ba6; text-decoration: none;"
                      >Privacy Policy</a
                    >
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td bgcolor="black" align="center" style="padding: 0px 10px 0px 10px;">
          <p></p>
        </td>
      </tr>
    </table>
  </body>`;
};

const forgotPasswordEmailBody = (code) => {
  return `<body style="height: 100%; margin:0; padding: 0, width:100%">
  <div
    style="
      display: none;
      font-size: 1px;
      color: #fefefe;
      line-height: 1px;
      font-family: 'Lato', Helvetica, Arial, sans-serif;
      max-height: 0px;
      max-width: 0px;
      opacity: 0;
      overflow: hidden;
    "
  >
    We're thrilled to have you here! Get ready to dive into your new account.
  </div>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <!-- LOGO -->
    <tr>
      <td bgcolor="#006ba6" align="center">
        <table
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="max-width: 600px;"
        >
          <tr>
            <td
              align="center"
              valign="top"
              style="padding: 40px 10px 40px 10px;"
            ></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td
        bgcolor="#006ba6"
        align="center"
        style="padding: 0px 10px 0px 10px;"
      >
        <table
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="max-width: 600px;"
        >
          <tr>
            <td
              bgcolor="#ffffff"
              align="center"
              valign="top"
              style="
                padding: 40px 20px 20px 20px;
                border-radius: 4px 4px 0px 0px;
                color: #111111;
                font-family: 'Lato', Helvetica, Arial, sans-serif;
                font-size: 48px;
                font-weight: 400;
                letter-spacing: 4px;
                line-height: 48px;
              "
            >
              <h1
                style="
                  color: #006ba6;
                  font-size: 28px;
                  font-weight: bold;
                  margin: 2;
                "
              >
                Lightbox Password Reset
              </h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td bgcolor="black" align="center" style="padding: 0px 10px 0px 10px;">
        <table
          border="0"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="max-width: 600px;"
        >
          <tr>
            <td
              bgcolor="#ffffff"
              align="left"
              style="
                padding: 20px 30px 40px 30px;
                color: #666666;
                font-family: 'Lato', Helvetica, Arial, sans-serif;
                font-size: 18px;
                font-weight: 400;
                line-height: 25px;
              "
            >
              <p style="margin: 0;">
                We heard that you lost your Lightbox password. Sorry about that !
                But don't worry, Use the given verification code to reset your password:
              </p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" align="left">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td
                    bgcolor="#ffffff"
                    align="center"
                    style="padding: 20px 30px 60px 30px;"
                  >
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td
                          align="center"
                          style="border-radius: 3px;"
                          bgcolor="#FFA73B"
                        >
                          <button
                            style="
                              font-size: 24px;
                              font-family: 'Lato', Helvetica, Arial, sans-serif;
              font-weight: bold;
                              text-decoration: none;
                              color: white;
                              background-color: #006ba6;
                              padding: 15px 25px;
                              border-radius: 5px;
              letter-spacing: 4px;
                              border: 1px solid #006ba6;
                              display: inline-block;
                              "
                          >
                            &nbsp;${code}&nbsp;
                          </button>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- COPY -->
          <tr>
            <td
              bgcolor="#ffffff"
              align="left"
              style="
                padding: 0px 30px 0px 30px;
                color: #666666;
                font-family: 'Lato', Helvetica, Arial, sans-serif;
                font-size: 18px;
                font-weight: 400;
                line-height: 25px;
              "
            >
              <p style="margin: 0;">
                You are receiving this email because a password reset was requested for your account. If you didn't request password reset, we urge to secure your email address. 
              </p><p style="margin-top: 1">
                If you have any questions, just reply to
                this email - we are always happy to help you out.
              </p>
            </td>
          </tr>
          <!-- COPY -->
          <tr>
            <td
              bgcolor="#ffffff"
              align="left"
              style="
                padding: 0px 30px 40px 30px;
                border-radius: 0px 0px 4px 4px;
                color: #666666;
                font-family: 'Lato', Helvetica, Arial, sans-serif;
                font-size: 18px;
                font-weight: 400;
                line-height: 25px;
              "
            >
              <!-- <p style="margin: 0;">Cheers,<br />BBB Team</p> -->
              <br />
              Thanks and Regards, <br />
              <br />

              <div style="content: ''; display: table; clear: both;">
                <div style="float: left;">
                  <img
                    src="https://lightbox-demo.netlify.app/logo.png"
                    alt="Lightbox"
                    style="width: 50px;"
                  />
                </div>
                <div style="float: left; text-align: center;">
                  <a
                    href="https://lightbox-demo.netlify.app/"
                    style="
                      font-weight: bold;
                      color: #006ba6;
                      text-decoration: none;
                    "
                    >The Lightbox Team </a
                  ><br />
                  <a
                    href="https://lightbox-demo.netlify.app/policy"
                    style="color: #006ba6; text-decoration: none;"
                    >Privacy Policy</a
                  >
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td bgcolor="black" align="center" style="padding: 0px 10px 0px 10px;">
        <p></p>
      </td>
    </tr>
  </table>
</body>`;
};

module.exports = { welcomeEmailBody, forgotPasswordEmailBody };