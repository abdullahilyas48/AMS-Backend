// services/RewardsService.js
const UserModel = require('../models/User');

const REWARD_CONFIG = {
  vehicle: 10,
  hotel: 15,
  lounge: 20,
  flight: 25,
};

async function addPoints(userId, type) {
  const points = REWARD_CONFIG[type] || 0;
  if (!points) return;

  await UserModel.findByIdAndUpdate(userId, {
    $inc: { rewards: points }
  });
}

async function redeemPoints(userId, pointsToRedeem) {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.rewards < pointsToRedeem) {
    throw new Error("Not enough points");
  }

  user.rewards -= pointsToRedeem;
  await user.save();
  return user.rewards;
}

module.exports = { addPoints, redeemPoints };