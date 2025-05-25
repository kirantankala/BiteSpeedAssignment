const Contact = require('../models/contact');
const { Op } = require('sequelize');

exports.identifyContact = async (req, res) => {
  const { email, phoneNumber } = req.body;

  // 1️⃣ Validate input
  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Email or phoneNumber is required' });
  }

  // 2️⃣ Dynamically build query condition
  const condition = [];
  if (email) condition.push({ email });
  if (phoneNumber) condition.push({ phoneNumber });

  const contacts = await Contact.findAll({
    where: {
      [Op.or]: condition
    }
  });

  // 3️⃣ No match found — create new primary
  if (contacts.length === 0) {
    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: 'primary'
    });

    return res.json({
      contact: {
        primaryContatctId: newContact.id,
        emails: [newContact.email],
        phoneNumbers: [newContact.phoneNumber],
        secondaryContactIds: []
      }
    });
  }

  // 4️⃣ Find the primary contact (or fetch it if all are secondaries)
  let primary = contacts.find(c => c.linkPrecedence === 'primary');

  if (!primary) {
    // All matched are secondaries → get their linked primary
    primary = await Contact.findByPk(contacts[0].linkedId);
  }

  // 5️⃣ Find all linked contacts to this primary
  const linkedContacts = await Contact.findAll({
    where: {
      [Op.or]: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  // 6️⃣ If this combination is new, create secondary
  const alreadyExists = linkedContacts.find(c =>
    c.email === email && c.phoneNumber === phoneNumber
  );

  if (!alreadyExists) {
    await Contact.create({
      email,
      phoneNumber,
      linkedId: primary.id,
      linkPrecedence: 'secondary'
    });
  }

  // 7️⃣ Refresh and format final cluster
  const finalContacts = await Contact.findAll({
    where: {
      [Op.or]: [
        { id: primary.id },
        { linkedId: primary.id }
      ]
    }
  });

  const emails = [...new Set(finalContacts.map(c => c.email).filter(Boolean))];
  const phoneNumbers = [...new Set(finalContacts.map(c => c.phoneNumber).filter(Boolean))];
  const secondaryContactIds = finalContacts
    .filter(c => c.linkPrecedence === 'secondary')
    .map(c => c.id);

  // 8️⃣ Return response
  res.json({
    contact: {
      primaryContatctId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds
    }
  });
};
