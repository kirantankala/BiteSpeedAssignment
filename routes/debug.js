const express = require('express');
const Contact = require('../models/contact'); // Adjust the path as necessary
const router = express.Router();

// 🔍 Get all contacts
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [['id', 'ASC']]
    });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ❌ Delete a contact by ID (soft delete)
router.delete('/contacts/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.destroy(); // soft delete (or hard delete if paranoid: false)
    res.json({ message: `Contact with id ${id} has been deleted.` });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ❌ Delete all contacts and reset IDs
router.delete('/contacts', async (req, res) => {
  try {
    await Contact.destroy({ where: {}, truncate: true });  // <-- truncate resets IDs
    res.json({ message: 'All contacts have been deleted and IDs reset.' });
  } catch (err) {
    console.error('Delete all error:', err);
    res.status(500).json({ error: 'Failed to delete all contacts' });
  }
});

// ❌ Delete contacts by email (soft delete)
router.delete('/contacts/email/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const contacts = await Contact.findAll({ where: { email } });

    if (contacts.length === 0) {
      return res.status(404).json({ error: 'No contacts found for that email' });
    }

    for (const contact of contacts) {
      await contact.destroy(); // soft delete (or hard delete if paranoid: false)
    }

    res.json({ message: `All contacts with email "${email}" have been deleted.` });
  } catch (err) {
    console.error('Delete by email error:', err);
    res.status(500).json({ error: 'Failed to delete contacts by email' });
  }
});

module.exports = router;
