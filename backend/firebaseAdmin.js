const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": "clicksolver-64687",
  "private_key_id": "8d5d5130fecabf276c97aa9e2de9b92f5ac9dd88",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCcu7xwnGSunr7S\nLLVaF22hHJSdPjm2Abj+Y7DT3xtw4fCXwmk3MpYU/3iWsa2Om2xhwuMZusUxVj1G\nbFzFUZWdCDVgAKhzaOdR/g4raviYlHJEtPXMA0k8p8hIJyyX6TRTGxoiO0fJvjwO\nnW2GtaIF4d46CPKoXVjyQmWL4z5fP4mLovmv26h/Twe5AMHPkQueDSg1+X72mKf3\nkDv2kpFFz+5Kg/S1Y5f+xT+5GknS1Ji3aZccbOKRGPkUO1i2WJ1priMSu14/Wvdo\n9lFiizzArQy8nwqA8lrJOPrW2vu+ZF2+07WbqayWUrn7VVM/p4XR6w4umEF61Xn+\nCDmWIrjjAgMBAAECggEAPszccxS/JNa3p/hBDCGyDCmrBJxfvGVRTiD8w9A0KxVk\n9THxPaw3xZ8dnuf/nlH5aeyQWYlkJOIkuDiILYoElECrPlXVKTUh5tEQtWXtyRlF\n9fC6Qi4Y5MRntD16GT5YeGo2HPw6xgPDBaofrifODWRUylU2ga6xipR/Ir+BiOEI\ndU1cksHSI1wQR9S1Qu2jcCnlSAJG4KuNl6sOU0x7MYlNE8zqGlo+66QSsVJuttF7\n0CQumc7jPmpkLvVz2WxqNpu46D9f1JpYsnjRl2ZLon2nlkMVCPHgSrCBJktmd+iW\ng87cAnFc1BMLavUo4TEkDE7hhZQoRY+eu9aXjN8OjQKBgQDNceT7Mtz/iehRKJwA\nlRE2mvKFWArvDIi/GnmN6comvfnZLw2jed2/DQBfvzhhRrLXEaQTwqmtX2G1FIM+\njJGzMikfN6WF1eoLdqW028J3FspVmpazD3IniW93+IcQpLSIF58/pqa6gM17guMt\nnyEMQvW/ffblb7gmMD5c9s6GjQKBgQDDTTuERAdDrk5FenaxGQNUrh67M3QALYAh\niBPAGzGNfqSlGMqDpCdknMnRtu0VyNTHOQDuE4grESsDRdnfxM45p7mB8qBF/7uJ\nVXNoysYcQAjcozkFAv0YZnK+PG7Y1TXaUajzm2p5zuaqFUtfXHfl4ODnmeJuAigL\nGOo1p3VZLwKBgGhZ2XzeMPJ7Ec1nWxXQoZWizlx8g9E4BJ1MzUEP5uYWyLlP9RV7\n6O4JpI79iZ2fU2d6RmTjE1xEflSDvsYekEL8z3ZTxXddWCvKcBCVLwleQheJFdKN\nneYHIN9HFROXFTurA/BIrZc9pSF/MfUSRq77s+c4DBgtztNW3dZKZkxhAoGAFyhi\nRUW3wsu5Vj22MzuvDGx1EmeAesDqb49uIBpZXtjEdxsgcEmXrjN1LtvM8wdUS6cz\nuAcy30By5Dl1IzZ36Zg8w+7cGFDBkQBD5godQZ5KLrdf/HslPa5wLqSF1Eo7z35d\nVT15e6YP7d0GifEx+l0W7f9uPPMegmpa4y/PF1sCgYAoZOlEI8aPJQk3KmqGO8MV\nloIgycdocBT2sopzysp+HmwuQmAk81P0OcVDWRjHMi173ylA6Jv7XZ2b4o8rVQQe\nT4zVcoXY53onLQIGbHk5kAcTp2fusSWKoX3rAT9HRPcl+3MwNLObI1A73USni+Yh\nAaendpDzWRkkfEFfbsl1Lw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-4vqvm@clicksolver-64687.iam.gserviceaccount.com",
  "client_id": "115758623859948786929",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-4vqvm%40clicksolver-64687.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
