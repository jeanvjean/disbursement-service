exports.bucket = {
    digitalocean: {
      secret_key: process.env.DIGITAL_OCEAN_SPACES_SECRET_KEY,
      access_key: process.env.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
      name: process.env.DIGITAL_OCEAN_SPACES_BUCKET,
      url: process.env.DIGITAL_OCEAN_SPACES_URL,
      region: process.env.DIGITAL_OCEAN_SPACES_REGION,
    }
};