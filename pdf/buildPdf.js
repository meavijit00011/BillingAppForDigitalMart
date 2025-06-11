const ejs = require('ejs');
let pdf = require('html-pdf');
const fs = require("fs");
const path = require('path')
const createPDF = async (req, res) => {
  try {
    let s1 = fs.readFileSync(path.join(__dirname, '/invoice.ejs')).toString();
    let s2 = fs.readFileSync(path.join(__dirname, '/invoice2.ejs')).toString();
    let htmlString = req.data.templateType == 2 ? s2 : s1;

    if (req.data.templateType == 2) {
      const qrImgFile = fs.readFileSync(path.join(__dirname, '/qr.jpeg')).toString('base64');
      const qrImg = `data:image/jpeg;base64,${qrImgFile}`;
      req.data.qrImg = qrImg;
    };

    let ejsData = ejs.render(htmlString, req.data);

    pdf.create(ejsData, {
      childProcessOptions: {
        env: {
          OPENSSL_CONF: '/dev/null',
        },
      }
    }).toStream((err, stream) => {
      stream.pipe(res);
    })

  }
  catch (err) {
    console.log(err)
    if (res.saleAddedToDatabase == true) {
      return res.status(206).json({ status: true, msg: "Sale Added But Failed to generate PDF. Please try again later !" })
    }
    res.status(500).json({ status: false, msg: 'Server Failed !' })
  }
}

module.exports = createPDF;
