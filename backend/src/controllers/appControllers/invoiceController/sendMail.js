const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const pug = require('pug');
const moment = require('moment');
let pdf = require('html-pdf');
const { loadSettings } = require('@/middlewares/settings');
const useLanguage = require('@/locale/useLanguage');
const { useMoney, useDate } = require('@/settings');

const Invoice = mongoose.model('Invoice');

const mail = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('MAIL ID RECEIVED:', id);

    const query = [];

    if (mongoose.Types.ObjectId.isValid(id)) {
      query.push({ _id: id });
    }

    const invoiceNumber = Number(id);

    if (!Number.isNaN(invoiceNumber)) {
      query.push({ number: invoiceNumber });
    }

    if (query.length === 0) {
      return res.status(400).json({
        success: false,
        result: {
          receivedId: id,
        },
        message: `Invalid invoice id: ${id}`,
      });
    }

    const invoice = await Invoice.findOne({
      removed: false,
      $or: query,
    })
      .populate('client')
      .exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: {
          receivedId: id,
        },
        message: 'Invoice not found',
      });
    }

    const client = invoice.client;
    console.log('CLIENT FOUND:', client);

    if (!client?.email) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Client has no email address',
      });
    }

    // Generate PDF in memory
    const settings = await loadSettings();
    const selectedLang = settings['idurar_app_language'];
    const translate = useLanguage({ selectedLang });

    const {
      currency_symbol,
      currency_position,
      decimal_sep,
      thousand_sep,
      cent_precision,
      zero_format,
    } = settings;

    const { moneyFormatter } = useMoney({
      settings: {
        currency_symbol,
        currency_position,
        decimal_sep,
        thousand_sep,
        cent_precision,
        zero_format,
      },
    });
    const { dateFormat } = useDate({ settings });

    settings.public_server_file = process.env.PUBLIC_SERVER_FILE;

    const htmlContent = pug.renderFile('src/pdf/invoice.pug', {
      model: invoice,
      settings,
      translate,
      dateFormat,
      moneyFormatter,
      moment: moment,
    });

    const pdfBuffer = await new Promise((resolve, reject) => {
      pdf.create(htmlContent, {
        format: 'A4',
        orientation: 'portrait',
        border: '10mm',
      }).toBuffer((err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Digital Orbit'}" <${process.env.EMAIL_FROM}>`,      to: client.email,
      cc: "zakaahm@outlook.com" && process.env.EMAIL_FROM, 
      subject: `Factuur #${invoice.number} - digitaal traject`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Beste ${client.name || 'klant'},</h2>

          <p>Wij danken u voor uw vertrouwen in Digital Orbit. Bij deze kan u in de bijlage een offerte terugvinden.</p>

          <p>
            Neem gerust contact met ons op als u vragen heeft over deze offerte of als u verdere toelichting wenst. U kunt ons bereiken via e-mail op ${process.env.EMAIL_FROM} of telefonisch op [telefoonnummer]. We staan klaar om u te helpen en eventuele onduidelijkheden weg te nemen.
          </p>

          <p>Wij kijken alvast uit naar uw reactie!</p>

          <br />

          <p>
            Met vriendelijke groeten,<br />
            ${process.env.EMAIL_FROM_NAME || 'Het team'}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Factuur-${invoice.number || invoice._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return res.status(200).json({
      success: true,
      result: null,
      message: 'Mail succesvol verzonden',
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = mail;