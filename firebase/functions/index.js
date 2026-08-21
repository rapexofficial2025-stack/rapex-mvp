const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendPushNotification = onRequest(async (req, res) => {
  const { targetToken, title, body } = req.body;

  if (!targetToken || !title || !body) {
    return res.status(400).send("Missing required fields: targetToken, title, body");
  }

  const message = {
    token: targetToken,
    notification: { title, body },
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).send({ success: true, messageId: response });
  } catch (error) {
    return res.status(500).send({ success: false, error: error.message });
  }
});
