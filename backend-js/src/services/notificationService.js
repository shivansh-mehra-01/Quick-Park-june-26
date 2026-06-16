/**
 * Notification Service
 * Sends push notifications to mobile devices using the Expo Push API.
 */

async function sendPushNotification(usersCollection, plate, title, body, data = {}) {
  try {
    if (!plate) return null;
    
    const cleanPlate = plate.trim().toUpperCase();

    // Query to find user registered with this vehicle plate (as string or object)
    const user = await usersCollection.findOne({
      $or: [
        { vehicles: cleanPlate },
        { "vehicles.plate": cleanPlate },
        { "vehicles": { $elemMatch: { plate: cleanPlate } } }
      ]
    });

    if (!user) {
      console.log(`[Push Notification] No user found registered with plate: ${cleanPlate}`);
      return null;
    }

    if (!user.pushToken) {
      console.log(`[Push Notification] User ${user.email} found, but has no pushToken registered`);
      return null;
    }

    console.log(`[Push Notification] Sending notification to ${user.email} (Token: ${user.pushToken})`);
    
    const payload = {
      to: user.pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: {
        ...data,
        plate: cleanPlate,
      }
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log(`[Push Notification] Expo API response:`, JSON.stringify(result));
    return result;
  } catch (err) {
    console.error(`[Push Notification] Error sending notification:`, err);
    return null;
  }
}

module.exports = { sendPushNotification };
