const jwt = require("jsonwebtoken");

function generateDocuSealToken({ proposalUrl, clientEmail, proposalName }) {
  const token = jwt.sign(
    {
 user_email: 'janavijpatil0406+test@gmail.com', // who is signing
        integration_email: 'janavijpatil0406@gmail.com',      name: proposalName,
      documents: [
        {
          url: proposalUrl,
          name: proposalName,
        },
      ],
    },
    process.env.DOCUSEAL_API_KEY,
    { algorithm: "HS256" }
  );

  return token;
}

module.exports = generateDocuSealToken;
