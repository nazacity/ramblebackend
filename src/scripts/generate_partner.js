const { PartnerService } = require('../services');

const generatePartner = async () => {
  try {
    await PartnerService.createPartner({
      username: 'partner',
      password: 'password',
      display_name: 'partner',
      activities: [
        '5fd5bcc079b43b1a50ed659a',
        '5fd5bccb576b5603f87201e7',
        '5fd5bd32efed2526e4a45ef9',
        '5fd5c420c1f07a578462fdc9',
        '5fd5c42f815b4d4af8036f3e',
        '5fd5c75cbf6e9d542c414f9c',
        '5fd5c7d6b4e91a0de86ed897',
        '5fd5c89ddc937756fcf9f423',
      ],
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

generatePartner();
