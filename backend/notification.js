const admin = require('firebase-admin');

const serviceAccount = {
  "type": "service_account",
  "project_id": "your-guider-fbcb0",
  "private_key_id": "07c415e452178bd94119071a15ad3d4194790d27",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0JrSFLFrvp6yY\n4e7fgi3pXcARRubFKx5I0KePs2/UkprqhwJm4aMFlZPd9OnABkafn+MbbdGYP33n\nam/BE56bb0CKgpY/YFxTBUJkEhwoEKZ//9j3LDapYA99s3ldBKcbD4zV8zO1d685\nvWdzo3Nq0lxu/a0zQ0rs3LxTg5+KuZyEFBjgoZK40tfZAev+Bs7pMxoDVqEOhkZE\ncNewoqy0rZnzKR3RIZebN4a7FiH4pP/6wIADIryL4k0T+i7NlZcoMoFYUkWaOy7a\n141Kz7heGDWl3aWX9FN2/045z8cA28vlIdyBXTZsPBdJXtjEIB6yL2pju9sSALgf\nzTpmP/KhAgMBAAECggEAAqsfGejkCPA8IYCZO/TO7sm9dlQNR4bhujTjAoEnKygn\nxMkOq0z0z/ic+djunHJLWgJxh/66r81i9UpRkPPUMdu2Qkb4aERqYa1uhBJzmdFT\nUgqNYW3lemFKoXNG3S6cNg2nKaUiUzIMZafNUDxv0Xl/toIp7lw1ECid3oPQ2Wpr\neu6Mr9SpOmk9jrzu5KlNLKVu/LBfjZ8TV24DXdXw5+WwaHBS3gGHzVDUwM9GbJII\nVLMKN0ine71Oey2XmZVCQZI4fYoRze8Ts6AsbtaSYgDZqE4THZP7kkMzvLiPBYlE\nihhcVgbfz92Va/zCym79R45zeaGCEL9wDDFhG5mjJQKBgQD7XjAvvhUCk9hl9Qbq\ndYlDbzZyCY4TCtnFPfVlWhU237EOntnIgDgL9wHjU+ian1+DWCNkHmpJaGell14K\nr5HyZ4zxn7z4Jje5WXRXEp5t7rKcVpjNQNLFIcZQxma9oNUEVsmq58M/rJltMzjc\nux0rkU+ZwLhqt7Qs9J/gnEF4rQKBgQC3eI6AicRjjs057Eo3oq23RErxpsAeM4EA\nRAggKkynpoxA7aoJNrMjpZ/2b4sV3Fk5uP9dV0W61K8kGHIBZIdpMrV/9iUAcqkJ\nENCSUYH+qeE8+AzkkBE7dk//x1M3Xjxs3+yd4lS3Mj8aRyai6iYqTGRjgO7RRBSO\n9URYrHWcRQKBgQCYDB8lodrflkJ9Wbt3MuV2jtzmGfWAez3C23mGdvkCGkjlSRz+\n9N/yDNVthqHadbC2qCewNd2gzbB0L51I5W5orE5LEY6io6ttSDjhOnfuk0Yi3xbK\ngP19FLL6xSf8aD6xwzV1VX97EpIzxZoNmnlIkzsNC9ABbWFlGAtlN986eQKBgFlY\nmTTZYk0FXsXFXwMm8qfb1w9FICvU8w5ZEwfu8XN3NLftxS9Fdwl1/6c3/KiBrOXi\nRGGFPYzVRBE04lfxR8wgCKkvCifkrpKeoKOQk9ibi/dv6H9p9Spa3Gx3+fttpclz\nZrwgWxb3nilC2vrdQga5Ou4F/Mbl+4j+wfDY01FtAoGBAPWYdHFAJD/omdjrJ8R+\nAMbchbIrUxQ5Xs5Fpm9pGCATIbYcl+DcBBOra8sb2IPBMXP/8Fa0TmXuvA4x2pkj\n4d+FoE8RasBO7xTaAtfAT8PJWRRS4fGiWF+guYNyYXUjtkQTHS5FPGqUTfaj5ZyO\nBMYwGzLAEJCa4Xkwkw+jrcGE\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-ozxmy@your-guider-fbcb0.iam.gserviceaccount.com",
  "client_id": "116637598165256229163",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ozxmy%40your-guider-fbcb0.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "1";

async function generateCustomToken() {
  try {
    const customToken = await admin.auth().createCustomToken(uid);
    console.log({ customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
  }
}

generateCustomToken();
