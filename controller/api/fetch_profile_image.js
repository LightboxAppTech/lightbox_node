const UserProfile = require('../../model/user_profile')

module.exports = async (req, res) => {
  const id = req.params.id
  if (!id) return res.status(400).json({ message: 'ID is required' })

  const userProfile = await UserProfile.findById(id)
  if (!userProfile)
    return res.status(404).json({ message: 'Profile image not found' })

  const image = Buffer.from(userProfile.profile_image, 'base64')

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': image.length,
  })
  res.end(image)
}
